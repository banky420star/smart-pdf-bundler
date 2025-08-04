from fastapi import FastAPI, UploadFile, File, HTTPException, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.websockets import WebSocketState
import fitz  # PyMuPDF
import os
import uuid
import shutil
import tempfile
import json
import pytesseract
from PIL import Image
import io
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import aiofiles
from typing import List, Optional, Dict, Any
import logging
import asyncio
from datetime import datetime
import httpx
import cv2
import numpy as np
from pydantic import BaseModel
import redis
from celery import Celery
import boto3
from minio import Minio
import magic
import threading
import queue
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart PDF Bundler AI", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
TMP = tempfile.gettempdir()
UPLOAD_DIR = os.path.join(TMP, "smart_pdf_bundler")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Redis for caching and queues
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Celery for background tasks
celery_app = Celery('smart_pdf_bundler', broker='redis://localhost:6379/0')

# S3/MinIO configuration
s3_client = boto3.client(
    's3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='minioadmin',
    aws_secret_access_key='minioadmin',
    region_name='us-east-1'
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_progress(self, client_id: str, message: Dict[str, Any]):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending progress to {client_id}: {e}")
                self.disconnect(client_id)

manager = ConnectionManager()

# Pydantic models
class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    classification: Optional[str] = None
    summary: Optional[str] = None
    citations: Optional[List[str]] = None
    sensitive_data: Optional[List[Dict]] = None
    page_count: Optional[int] = None
    size: int
    uploaded_at: datetime

class BundleRequest(BaseModel):
    files: List[str]
    cover_info: Dict[str, Any]
    theme: str = "Minimal"
    client_id: str

# AI Document Classifier
class AIDocumentClassifier:
    def __init__(self):
        self.classification_prompt = """
        You are a legal-bundle sorter. Classify the document into one of these categories:
        - invoice
        - contract
        - legal_brief
        - email
        - report
        - receipt
        - certificate
        - other
        
        Document content: {content}
        
        Return only the category name.
        """
    
    async def classify_document(self, text_content: str) -> str:
        """Classify document using AI"""
        try:
            # For now, use a simple rule-based classifier
            # In production, this would use llama3 or OpenAI API
            text_lower = text_content.lower()
            
            if any(word in text_lower for word in ['invoice', 'bill', 'payment', 'amount due']):
                return 'invoice'
            elif any(word in text_lower for word in ['contract', 'agreement', 'terms', 'conditions']):
                return 'contract'
            elif any(word in text_lower for word in ['legal', 'court', 'judgment', 'brief']):
                return 'legal_brief'
            elif any(word in text_lower for word in ['email', 'sent', 'received', '@']):
                return 'email'
            elif any(word in text_lower for word in ['report', 'analysis', 'findings']):
                return 'report'
            elif any(word in text_lower for word in ['receipt', 'purchase', 'transaction']):
                return 'receipt'
            elif any(word in text_lower for word in ['certificate', 'certified', 'award']):
                return 'certificate'
            else:
                return 'other'
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return 'other'
    
    async def summarize_document(self, text_content: str) -> str:
        """Generate document summary using AI"""
        try:
            # Simple summary - in production, use llama3
            words = text_content.split()
            if len(words) > 50:
                summary = ' '.join(words[:50]) + '...'
            else:
                summary = text_content
            return summary
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return "Summary not available"
    
    async def detect_sensitive_data(self, text_content: str) -> List[Dict]:
        """Detect sensitive data like SSNs, phone numbers"""
        import re
        
        sensitive_data = []
        
        # SSN pattern
        ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
        ssns = re.findall(ssn_pattern, text_content)
        for ssn in ssns:
            sensitive_data.append({
                'type': 'ssn',
                'value': ssn,
                'page': 1  # Simplified - would need page detection
            })
        
        # Phone pattern
        phone_pattern = r'\b\d{3}-\d{3}-\d{4}\b'
        phones = re.findall(phone_pattern, text_content)
        for phone in phones:
            sensitive_data.append({
                'type': 'phone',
                'value': phone,
                'page': 1
            })
        
        return sensitive_data

# Enhanced PDF Bundler with AI
class AIEnhancedPDFBundler:
    def __init__(self, work_dir: str):
        self.work_dir = work_dir
        self.styles = getSampleStyleSheet()
        self.ai_classifier = AIDocumentClassifier()
        
    async def process_file_with_ai(self, file_path: str, file_type: str, client_id: str) -> Dict[str, Any]:
        """Process file with AI classification and analysis"""
        try:
            # Extract text content
            text_content = await self.extract_text_content(file_path, file_type)
            
            # AI processing
            classification = await self.ai_classifier.classify_document(text_content)
            summary = await self.ai_classifier.summarize_document(text_content)
            sensitive_data = await self.ai_classifier.detect_sensitive_data(text_content)
            
            # Convert to PDF
            pdf_path = await self.convert_to_pdf(file_path, file_type, text_content)
            
            # Get page count
            page_count = self.get_page_count(pdf_path)
            
            # Store metadata
            metadata = DocumentMetadata(
                id=str(uuid.uuid4()),
                filename=os.path.basename(file_path),
                file_type=file_type,
                classification=classification,
                summary=summary,
                sensitive_data=sensitive_data,
                page_count=page_count,
                size=os.path.getsize(file_path),
                uploaded_at=datetime.now()
            )
            
            # Send progress update
            await manager.send_progress(client_id, {
                'type': 'file_processed',
                'filename': metadata.filename,
                'classification': classification,
                'summary': summary,
                'sensitive_data_count': len(sensitive_data)
            })
            
            return {
                'metadata': metadata.dict(),
                'pdf_path': pdf_path,
                'text_content': text_content
            }
            
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            raise
    
    async def extract_text_content(self, file_path: str, file_type: str) -> str:
        """Extract text content from various file types"""
        if file_type.startswith('image/'):
            return self.extract_text_from_image(file_path)
        elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return self.extract_text_from_docx(file_path)
        elif file_type == 'text/plain':
            return self.extract_text_from_txt(file_path)
        elif file_type == 'application/pdf':
            return self.extract_text_from_pdf(file_path)
        else:
            return ""
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Enhanced OCR with image preprocessing"""
        try:
            # Load image
            image = cv2.imread(image_path)
            
            # Preprocessing for better OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # OCR with multiple attempts
            text = pytesseract.image_to_string(denoised, config='--psm 6')
            
            if not text.strip():
                # Try different PSM modes
                text = pytesseract.image_to_string(denoised, config='--psm 3')
            
            return text
        except Exception as e:
            logger.error(f"OCR failed for {image_path}: {e}")
            return ""
    
    def extract_text_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = Document(docx_path)
            text = []
            for paragraph in doc.paragraphs:
                text.append(paragraph.text)
            return '\n'.join(text)
        except Exception as e:
            logger.error(f"DOCX extraction failed: {e}")
            return ""
    
    def extract_text_from_txt(self, txt_path: str) -> str:
        """Extract text from TXT"""
        try:
            with open(txt_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"TXT extraction failed: {e}")
            return ""
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        try:
            doc = fitz.open(pdf_path)
            text = []
            for page in doc:
                text.append(page.get_text())
            doc.close()
            return '\n'.join(text)
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            return ""
    
    async def convert_to_pdf(self, file_path: str, file_type: str, text_content: str) -> str:
        """Convert file to PDF with enhanced formatting"""
        if file_type == 'application/pdf':
            return file_path
        
        pdf_path = file_path.replace('.docx', '_converted.pdf').replace('.txt', '_converted.pdf')
        pdf_path = pdf_path.replace('.png', '_converted.pdf').replace('.jpg', '_converted.pdf')
        
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        story = []
        
        # Add document header
        story.append(Paragraph(f"Document: {os.path.basename(file_path)}", self.styles['Heading1']))
        story.append(Spacer(1, 20))
        
        # Add content
        if text_content.strip():
            story.append(Paragraph(text_content, self.styles['Normal']))
        else:
            story.append(Paragraph("No text content extracted.", self.styles['Normal']))
        
        doc.build(story)
        return pdf_path
    
    def get_page_count(self, pdf_path: str) -> int:
        """Get page count of PDF"""
        try:
            doc = fitz.open(pdf_path)
            count = len(doc)
            doc.close()
            return count
        except:
            return 1

# WebSocket endpoint for real-time progress
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# Enhanced bundle creation endpoint
@app.post("/api/bundle")
async def create_ai_enhanced_bundle(
    files: List[UploadFile] = File(...),
    coverInfo: str = Form(...),
    theme: str = Form("Minimal"),
    client_id: str = Form(...)
):
    """Create AI-enhanced PDF bundle with real-time progress"""
    try:
        # Parse cover info
        cover_info = json.loads(coverInfo)
        
        # Create unique work directory
        bundle_id = str(uuid.uuid4())
        work_dir = os.path.join(UPLOAD_DIR, bundle_id)
        os.makedirs(work_dir, exist_ok=True)
        
        # Send initial progress
        await manager.send_progress(client_id, {
            'type': 'bundle_started',
            'bundle_id': bundle_id,
            'total_files': len(files)
        })
        
        bundler = AIEnhancedPDFBundler(work_dir)
        
        # Process files with AI
        processed_files = []
        for i, file in enumerate(files):
            # Save uploaded file
            file_path = os.path.join(work_dir, file.filename)
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Send file processing progress
            await manager.send_progress(client_id, {
                'type': 'file_processing',
                'filename': file.filename,
                'progress': (i / len(files)) * 100
            })
            
            # Process with AI
            result = await bundler.process_file_with_ai(file_path, file.content_type, client_id)
            processed_files.append(result)
        
        # Create enhanced cover page
        await manager.send_progress(client_id, {
            'type': 'creating_cover',
            'progress': 80
        })
        
        cover_path = await create_enhanced_cover_page(work_dir, cover_info, theme, processed_files)
        
        # Create AI-enhanced table of contents
        await manager.send_progress(client_id, {
            'type': 'creating_toc',
            'progress': 85
        })
        
        toc_path = await create_ai_enhanced_toc(work_dir, processed_files, theme)
        
        # Compile final bundle
        await manager.send_progress(client_id, {
            'type': 'compiling_bundle',
            'progress': 90
        })
        
        output_path = await compile_final_bundle(work_dir, cover_path, toc_path, processed_files)
        
        # Upload to S3/MinIO
        await manager.send_progress(client_id, {
            'type': 'uploading',
            'progress': 95
        })
        
        download_url = await upload_to_storage(output_path, bundle_id)
        
        # Send completion
        await manager.send_progress(client_id, {
            'type': 'bundle_complete',
            'progress': 100,
            'download_url': download_url,
            'bundle_id': bundle_id
        })
        
        return JSONResponse(content={
            "success": True,
            "url": download_url,
            "bundle_id": bundle_id,
            "message": f"AI-enhanced PDF bundle created successfully with {len(processed_files)} files"
        })
        
    except Exception as e:
        logger.error(f"Error creating AI-enhanced bundle: {e}")
        await manager.send_progress(client_id, {
            'type': 'error',
            'message': str(e)
        })
        raise HTTPException(status_code=500, detail=str(e))

async def create_enhanced_cover_page(work_dir: str, cover_info: dict, theme: str, processed_files: List[Dict]) -> str:
    """Create enhanced cover page with AI insights"""
    cover_path = os.path.join(work_dir, "cover.pdf")
    doc = SimpleDocTemplate(cover_path, pagesize=A4)
    story = []
    
    # Enhanced title with AI insights
    title = cover_info.get('title', 'Document Bundle')
    if not title:
        # Auto-generate title based on content
        classifications = [f['metadata']['classification'] for f in processed_files]
        if classifications:
            most_common = max(set(classifications), key=classifications.count)
            title = f"{most_common.title()} Bundle"
    
    story.append(Paragraph(title, getSampleStyleSheet()['Heading1']))
    story.append(Spacer(1, 30))
    
    # Add cover info
    for key, value in cover_info.items():
        if value and key != 'title':
            story.append(Paragraph(f"<b>{key.title()}:</b> {value}", getSampleStyleSheet()['Normal']))
            story.append(Spacer(1, 10))
    
    # Add AI insights
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>Bundle Summary:</b>", getSampleStyleSheet()['Heading2']))
    
    total_pages = sum(f['metadata']['page_count'] for f in processed_files)
    story.append(Paragraph(f"Total Documents: {len(processed_files)}", getSampleStyleSheet()['Normal']))
    story.append(Paragraph(f"Total Pages: {total_pages}", getSampleStyleSheet()['Normal']))
    
    # Document types breakdown
    classifications = {}
    for f in processed_files:
        cls = f['metadata']['classification']
        classifications[cls] = classifications.get(cls, 0) + 1
    
    if classifications:
        story.append(Spacer(1, 10))
        story.append(Paragraph("<b>Document Types:</b>", getSampleStyleSheet()['Normal']))
        for cls, count in classifications.items():
            story.append(Paragraph(f"• {cls.title()}: {count}", getSampleStyleSheet()['Normal']))
    
    doc.build(story)
    return cover_path

async def create_ai_enhanced_toc(work_dir: str, processed_files: List[Dict], theme: str) -> str:
    """Create AI-enhanced table of contents"""
    toc_path = os.path.join(work_dir, "toc.pdf")
    doc = SimpleDocTemplate(toc_path, pagesize=A4)
    story = []
    
    story.append(Paragraph("Table of Contents", getSampleStyleSheet()['Heading1']))
    story.append(Spacer(1, 30))
    
    # Group by classification
    grouped_files = {}
    for f in processed_files:
        cls = f['metadata']['classification']
        if cls not in grouped_files:
            grouped_files[cls] = []
        grouped_files[cls].append(f)
    
    page_num = 3  # Start after cover and TOC
    
    for classification, files in grouped_files.items():
        story.append(Paragraph(f"<b>{classification.title()}</b>", getSampleStyleSheet()['Heading2']))
        
        for f in files:
            filename = f['metadata']['filename']
            summary = f['metadata']['summary'][:50] + "..." if len(f['metadata']['summary']) > 50 else f['metadata']['summary']
            
            story.append(Paragraph(f"• {filename} (p.{page_num}) - {summary}", getSampleStyleSheet()['Normal']))
            page_num += f['metadata']['page_count']
        
        story.append(Spacer(1, 10))
    
    doc.build(story)
    return toc_path

async def compile_final_bundle(work_dir: str, cover_path: str, toc_path: str, processed_files: List[Dict]) -> str:
    """Compile final PDF bundle"""
    output_path = os.path.join(work_dir, "bundle.pdf")
    merger = fitz.open()
    
    # Add cover page
    if os.path.exists(cover_path):
        merger.insert_pdf(fitz.open(cover_path))
    
    # Add table of contents
    if os.path.exists(toc_path):
        merger.insert_pdf(fitz.open(toc_path))
    
    # Add processed files
    for f in processed_files:
        pdf_path = f['pdf_path']
        if os.path.exists(pdf_path):
            merger.insert_pdf(fitz.open(pdf_path))
    
    merger.save(output_path)
    merger.close()
    
    return output_path

async def upload_to_storage(file_path: str, bundle_id: str) -> str:
    """Upload bundle to S3/MinIO"""
    try:
        bucket_name = "pdf-bundles"
        
        # Create bucket if it doesn't exist
        try:
            s3_client.head_bucket(Bucket=bucket_name)
        except:
            s3_client.create_bucket(Bucket=bucket_name)
        
        # Upload file
        key = f"{bundle_id}/bundle.pdf"
        s3_client.upload_file(file_path, bucket_name, key)
        
        # Generate presigned URL
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': key},
            ExpiresIn=3600  # 1 hour
        )
        
        return url
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        # Fallback to local file
        return f"/static/{bundle_id}/bundle.pdf"

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0", "features": ["ai", "websocket", "realtime"]}

# AI endpoints
@app.post("/api/classify")
async def classify_document(text: str):
    """Classify document using AI"""
    classifier = AIDocumentClassifier()
    classification = await classifier.classify_document(text)
    return {"classification": classification}

@app.post("/api/summarize")
async def summarize_document(text: str):
    """Summarize document using AI"""
    classifier = AIDocumentClassifier()
    summary = await classifier.summarize_document(text)
    return {"summary": summary}

@app.post("/api/detect-sensitive")
async def detect_sensitive_data(text: str):
    """Detect sensitive data in document"""
    classifier = AIDocumentClassifier()
    sensitive_data = await classifier.detect_sensitive_data(text)
    return {"sensitive_data": sensitive_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
