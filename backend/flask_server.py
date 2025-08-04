from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import tempfile
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
TMP = tempfile.gettempdir()
UPLOAD_DIR = os.path.join(TMP, "smart_pdf_bundler")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "service": "Smart PDF Bundler AI"
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({"message": "Smart PDF Bundler AI Backend", "version": "2.0.0"})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload a single file"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Create unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        
        return jsonify({
            "success": True,
            "file_id": file_id,
            "filename": filename,
            "original_name": file.filename,
            "size": file_size,
            "uploaded_at": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bundle', methods=['POST'])
def create_bundle():
    """Create a PDF bundle from uploaded files"""
    try:
        files = request.files.getlist('files')
        cover_info = request.form.get('coverInfo', '{}')
        theme = request.form.get('theme', 'Minimal')
        
        if not files:
            return jsonify({"error": "No files provided"}), 400
        
        # Parse cover info
        cover_data = json.loads(cover_info) if cover_info else {}
        
        # Process uploaded files
        processed_files = []
        for file in files:
            if file.filename == '':
                continue
                
            file_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
            filename = f"{file_id}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save file
            file.save(file_path)
            
            processed_files.append({
                "id": file_id,
                "filename": filename,
                "original_name": file.filename,
                "size": os.path.getsize(file_path),
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
        
        return jsonify({
            "success": True,
            "bundle_id": bundle_id,
            "message": f"Bundle created successfully with {len(processed_files)} files",
            "bundle_info": bundle_info
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bundles', methods=['GET'])
def list_bundles():
    """List all created bundles"""
    try:
        # This would normally query a database
        # For now, return a sample response
        return jsonify({
            "bundles": [
                {
                    "id": "sample-bundle-1",
                    "name": "Sample Bundle",
                    "file_count": 3,
                    "created_at": datetime.now().isoformat(),
                    "status": "completed"
                }
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 