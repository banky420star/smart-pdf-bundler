import fitz  # PyMuPDF
import os
import json
import tempfile
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from PIL import Image
import io
import base64
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import cv2
import numpy as np

logger = logging.getLogger(__name__)

class AdvancedPDFProcessor:
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.work_dir = os.path.join(self.temp_dir, "smart_pdf_bundler")
        os.makedirs(self.work_dir, exist_ok=True)
        
    def create_professional_cover_page(self, cover_info: Dict[str, Any], theme_colors: Dict[str, str]) -> str:
        """Create a professional cover page with full-bleed design"""
        cover_path = os.path.join(self.work_dir, f"cover_{uuid.uuid4()}.pdf")
        
        # Create PDF with custom dimensions
        doc = SimpleDocTemplate(cover_path, pagesize=A4)
        story = []
        
        # Custom styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=48,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor(theme_colors.get('primary', '#3B82F6')),
            spaceAfter=30,
            alignment=1  # Center
        )
        
        client_style = ParagraphStyle(
            'ClientStyle',
            parent=styles['Normal'],
            fontSize=18,
            fontName='Helvetica',
            textColor=colors.HexColor(theme_colors.get('secondary', '#10B981')),
            alignment=1
        )
        
        # Add logo placeholder
        logo_placeholder = f"""
        <div style="text-align: center; margin-bottom: 40px;">
            <img src="data:image/svg+xml;base64,{self._get_logo_svg(theme_colors)}" width="120" height="60"/>
        </div>
        """
        story.append(Paragraph(logo_placeholder, styles['Normal']))
        
        # Add title
        title = cover_info.get('title', 'Document Bundle')
        story.append(Paragraph(title, title_style))
        
        # Add client info
        client = cover_info.get('client', '')
        if client:
            story.append(Paragraph(f"Prepared for: {client}", client_style))
        
        # Add date
        date_str = datetime.now().strftime("%B %d, %Y")
        story.append(Paragraph(f"Generated: {date_str}", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        return cover_path
    
    def create_section_divider(self, section_name: str, page_number: int, theme_colors: Dict[str, str]) -> str:
        """Create a professional section divider page"""
        divider_path = os.path.join(self.work_dir, f"divider_{uuid.uuid4()}.pdf")
        
        doc = fitz.open()
        page = doc.new_page(width=595, height=842)  # A4 size
        
        # Add colored stripe on the left
        primary_color = fitz.utils.getColor(theme_colors.get('primary', '#3B82F6'))
        page.draw_rect(fitz.Rect(0, 0, 30, 842), color=primary_color, fill=primary_color)
        
        # Add section name
        page.insert_text(
            (60, 300),
            section_name.upper(),
            fontsize=48,
            fontname="helv-b",
            color=(0, 0, 0)
        )
        
        # Add large page number in background
        page.insert_text(
            (450, 750),
            f"{page_number:02d}",
            fontsize=120,
            color=(0.9, 0.9, 0.9),
            rotate=0,
            render_mode=3  # Invisible
        )
        
        doc.save(divider_path)
        doc.close()
        return divider_path
    
    def add_headers_and_footers(self, pdf_path: str, bundle_info: Dict[str, Any], theme_colors: Dict[str, str]) -> str:
        """Add professional headers and footers to all pages"""
        doc = fitz.open(pdf_path)
        primary_color = fitz.utils.getColor(theme_colors.get('primary', '#3B82F6'))
        
        for i, page in enumerate(doc):
            # Add top border
            page.draw_rect(fitz.Rect(0, 0, 595, 4), color=primary_color, fill=primary_color)
            
            # Add header text
            current_section = bundle_info.get('current_section', '')
            bundle_title = bundle_info.get('title', 'Document Bundle')
            
            page.insert_text((10, 20), current_section, fontsize=8, color=(0.3, 0.3, 0.3))
            page.insert_text((250, 20), bundle_title, fontsize=8, color=(0.3, 0.3, 0.3), align=1)
            page.insert_text((540, 20), f"{i+1}/{doc.page_count}", fontsize=8, color=(0.3, 0.3, 0.3), align=2)
            
            # Add footer
            year = datetime.now().year
            firm_name = bundle_info.get('firm', 'Smart PDF Bundler')
            page.insert_text((250, 820), f"© {year} {firm_name}", fontsize=6, color=(0.5, 0.5, 0.5), align=1)
            
            # Add thin line above footer
            page.draw_line((50, 810), (545, 810), color=(0.8, 0.8, 0.8), width=0.5)
        
        output_path = os.path.join(self.work_dir, f"with_headers_{uuid.uuid4()}.pdf")
        doc.save(output_path)
        doc.close()
        return output_path
    
    def apply_redactions(self, pdf_path: str, redaction_areas: List[Dict[str, Any]]) -> str:
        """Apply redactions to PDF"""
        doc = fitz.open(pdf_path)
        
        for redaction in redaction_areas:
            page_num = redaction.get('page', 0)
            if page_num < len(doc):
                page = doc[page_num]
                rect = fitz.Rect(
                    redaction['x'],
                    redaction['y'],
                    redaction['x'] + redaction['width'],
                    redaction['y'] + redaction['height']
                )
                page.add_redact_annot(rect, fill=(0, 0, 0))
        
        # Apply all redactions
        doc.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
        
        output_path = os.path.join(self.work_dir, f"redacted_{uuid.uuid4()}.pdf")
        doc.save(output_path)
        doc.close()
        return output_path
    
    def compress_pdf(self, pdf_path: str, quality: str = 'medium') -> str:
        """Compress PDF with adaptive compression"""
        doc = fitz.open(pdf_path)
        
        # Quality settings
        quality_settings = {
            'low': {'dpi': 72, 'image_quality': 0.3},
            'medium': {'dpi': 150, 'image_quality': 0.6},
            'high': {'dpi': 300, 'image_quality': 0.8}
        }
        
        settings = quality_settings.get(quality, quality_settings['medium'])
        
        # Process images
        for page in doc:
            image_list = page.get_images()
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                # Check if image is large enough to compress
                if pix.size > 1000000:  # 1MB
                    # Convert to RGB if needed
                    if pix.n - pix.alpha < 4:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    
                    # Resize based on DPI
                    scale_factor = settings['dpi'] / 300  # Assume original is 300 DPI
                    new_width = int(pix.width * scale_factor)
                    new_height = int(pix.height * scale_factor)
                    
                    # Create new pixmap with reduced size
                    new_pix = fitz.Pixmap(pix.colorspace, (0, 0, new_width, new_height))
                    new_pix.copy(pix, (0, 0, pix.width, pix.height))
                    
                    # Replace image in page
                    page.replace_image(xref, pixmap=new_pix)
                
                pix = None  # Free memory
        
        output_path = os.path.join(self.work_dir, f"compressed_{uuid.uuid4()}.pdf")
        doc.save(output_path, deflate=True, clean=True)
        doc.close()
        return output_path
    
    def add_signature(self, pdf_path: str, signature_data: str, position: Dict[str, float]) -> str:
        """Add signature to PDF"""
        doc = fitz.open(pdf_path)
        
        # Decode signature image
        signature_bytes = base64.b64decode(signature_data.split(',')[1])
        
        # Create pixmap from signature
        img = Image.open(io.BytesIO(signature_bytes))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Insert signature
        page = doc[position.get('page', 0)]
        rect = fitz.Rect(
            position['x'],
            position['y'],
            position['x'] + position['width'],
            position['y'] + position['height']
        )
        
        page.insert_image(rect, stream=img_bytes.getvalue())
        
        output_path = os.path.join(self.work_dir, f"signed_{uuid.uuid4()}.pdf")
        doc.save(output_path)
        doc.close()
        return output_path
    
    def extract_text_with_ocr(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text from PDF with OCR for scanned pages"""
        doc = fitz.open(pdf_path)
        text_data = {}
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Try to extract text normally first
            text = page.get_text()
            
            # If no text found, use OCR
            if not text.strip():
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Higher resolution for OCR
                img_data = pix.tobytes("png")
                
                # Use OCR (you would integrate with Tesseract here)
                # For now, return placeholder
                text = f"[OCR Text from page {page_num + 1}]"
            
            text_data[f"page_{page_num + 1}"] = {
                "text": text,
                "bbox": page.rect,
                "has_ocr": not page.get_text().strip()
            }
        
        doc.close()
        return text_data
    
    def create_form_fields(self, pdf_path: str, form_data: List[Dict[str, Any]]) -> str:
        """Add form fields to PDF"""
        doc = fitz.open(pdf_path)
        
        for field in form_data:
            page = doc[field.get('page', 0)]
            rect = fitz.Rect(
                field['x'],
                field['y'],
                field['x'] + field['width'],
                field['y'] + field['height']
            )
            
            field_type = field.get('type', 'text')
            
            if field_type == 'text':
                widget = page.add_text_annot(rect)
                widget.set_text(field.get('default_value', ''))
            elif field_type == 'checkbox':
                widget = page.add_checkbox_annot(rect)
                if field.get('checked', False):
                    widget.set_checked()
            elif field_type == 'radio':
                widget = page.add_radio_annot(rect)
                widget.set_checked()
        
        output_path = os.path.join(self.work_dir, f"form_{uuid.uuid4()}.pdf")
        doc.save(output_path)
        doc.close()
        return output_path
    
    def merge_pdfs_with_styling(self, pdf_files: List[str], bundle_info: Dict[str, Any], theme_colors: Dict[str, str]) -> str:
        """Merge multiple PDFs with professional styling"""
        merger = fitz.open()
        
        # Add cover page
        cover_path = self.create_professional_cover_page(bundle_info, theme_colors)
        cover_doc = fitz.open(cover_path)
        merger.insert_pdf(cover_doc)
        cover_doc.close()
        
        # Add section dividers and content
        for i, pdf_file in enumerate(pdf_files):
            # Add section divider
            section_name = f"Section {i + 1}"
            divider_path = self.create_section_divider(section_name, i + 1, theme_colors)
            divider_doc = fitz.open(divider_path)
            merger.insert_pdf(divider_doc)
            divider_doc.close()
            
            # Add content
            content_doc = fitz.open(pdf_file)
            merger.insert_pdf(content_doc)
            content_doc.close()
        
        # Save merged PDF
        output_path = os.path.join(self.work_dir, f"merged_{uuid.uuid4()}.pdf")
        merger.save(output_path)
        merger.close()
        
        # Add headers and footers
        final_path = self.add_headers_and_footers(output_path, bundle_info, theme_colors)
        
        return final_path
    
    def _get_logo_svg(self, theme_colors: Dict[str, str]) -> str:
        """Generate SVG logo with theme colors"""
        primary_color = theme_colors.get('primary', '#3B82F6')
        secondary_color = theme_colors.get('secondary', '#10B981')
        
        svg = f"""
        <svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="60" rx="8" fill="{primary_color}"/>
            <circle cx="30" cy="30" r="15" fill="{secondary_color}"/>
            <text x="60" y="35" font-family="Arial, sans-serif" font-size="12" fill="white" font-weight="bold">PDF</text>
        </svg>
        """
        return base64.b64encode(svg.encode()).decode()
    
    def cleanup_temp_files(self):
        """Clean up temporary files"""
        try:
            for file in os.listdir(self.work_dir):
                file_path = os.path.join(self.work_dir, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to cleanup temp files: {e}")

# Usage example
if __name__ == "__main__":
    processor = AdvancedPDFProcessor()
    
    # Example usage
    cover_info = {
        "title": "Quarterly Report Bundle",
        "client": "Acme Corporation",
        "firm": "Smart PDF Bundler"
    }
    
    theme_colors = {
        "primary": "#3B82F6",
        "secondary": "#10B981",
        "accent": "#F59E0B"
    }
    
    # Create cover page
    cover_path = processor.create_professional_cover_page(cover_info, theme_colors)
    print(f"Cover page created: {cover_path}")
    
    # Cleanup
    processor.cleanup_temp_files() 