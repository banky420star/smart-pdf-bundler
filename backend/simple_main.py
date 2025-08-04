from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import uuid
import tempfile
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

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

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "service": "Smart PDF Bundler AI"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Smart PDF Bundler AI Backend", "version": "2.0.0"}

@app.get("/docs")
async def docs():
    """API documentation"""
    return {"message": "API documentation available at /docs"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file"""
    try:
        # Create unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Get file info
        file_size = len(content)
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": filename,
            "original_name": file.filename,
            "size": file_size,
            "uploaded_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bundle")
async def create_bundle(
    files: List[UploadFile] = File(...),
    coverInfo: str = Form("{}"),
    theme: str = Form("Minimal")
):
    """Create a PDF bundle from uploaded files"""
    try:
        # Parse cover info
        cover_data = json.loads(coverInfo) if coverInfo else {}
        
        # Process uploaded files
        processed_files = []
        for file in files:
            file_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
            filename = f"{file_id}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save file
            content = await file.read()
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            processed_files.append({
                "id": file_id,
                "filename": filename,
                "original_name": file.filename,
                "size": len(content),
                "path": file_path
            })
        
        # Create bundle info
        bundle_id = str(uuid.uuid4())
        bundle_info = {
            "bundle_id": bundle_id,
            "files": processed_files,
            "cover_info": cover_data,
            "theme": theme,
            "created_at": datetime.now().isoformat(),
            "status": "completed"
        }
        
        return {
            "success": True,
            "bundle_id": bundle_id,
            "message": f"Bundle created successfully with {len(processed_files)} files",
            "bundle_info": bundle_info
        }
        
    except Exception as e:
        logger.error(f"Error creating bundle: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bundles")
async def list_bundles():
    """List all created bundles"""
    try:
        # This would normally query a database
        # For now, return a sample response
        return {
            "bundles": [
                {
                    "id": "sample-bundle-1",
                    "name": "Sample Bundle",
                    "file_count": 3,
                    "created_at": datetime.now().isoformat(),
                    "status": "completed"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Error listing bundles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 