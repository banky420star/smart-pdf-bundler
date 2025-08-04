# 🚀 Smart PDF Bundler

A professional PDF editing and bundling application with a modern, intuitive interface. Create, edit, and bundle PDFs with advanced features like annotations, themes, and professional styling.

![Smart PDF Bundler](https://img.shields.io/badge/Version-2.0%20Pro-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-Cross--Platform-orange)

## ✨ Features

### 🎨 **Professional UI/UX**
- **Modern Interface**: Clean, responsive design with dark/light mode
- **Smooth Animations**: Framer Motion powered transitions
- **Professional Toolbar**: Ribbon-style interface with all editing tools
- **Real-time Preview**: Live preview of changes as you edit

### 📁 **File Management**
- **Drag & Drop Upload**: Intuitive file upload interface
- **Multiple File Support**: Upload and manage multiple documents
- **File Organization**: Clean file list with size and type information
- **Batch Processing**: Process multiple files at once

### 🛠️ **PDF Editor**
- **Select Tool**: Move and manipulate objects
- **Pen Tool**: Freehand drawing and annotations
- **Text Tool**: Add text boxes with custom styling
- **Highlight Tool**: Professional highlighting with opacity control
- **Shape Tools**: Add rectangles, circles, and arrows
- **Zoom Controls**: 25% to 400% zoom with smooth scaling
- **Undo/Redo**: Full history management

### 🎨 **Theme Designer**
- **Color Palette**: Customize primary, secondary, and accent colors
- **Professional Themes**: Pre-built color schemes
- **Brand Integration**: Extract colors from logos
- **Live Preview**: See theme changes in real-time

### 🔧 **Advanced Features**
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **One-Click Launch**: Double-clickable launchers for easy startup
- **Professional Icons**: Custom SVG icons and logos
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-pdf-bundler.git
   cd smart-pdf-bundler
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Start the Application**

   **Option A: Use the launcher scripts**
   - **macOS**: Double-click `Smart PDF Bundler.command`
   - **Windows**: Double-click `Smart PDF Bundler.bat`

   **Option B: Manual startup**
   ```bash
   # Terminal 1 - Start Backend
   cd backend
   source venv/bin/activate
   python flask_server.py

   # Terminal 2 - Start Frontend
   cd frontend
   npm run dev
   ```

5. **Open the Application**
   - Navigate to `http://localhost:3000` in your browser
   - Or use the "Open Smart PDF Bundler" launcher scripts

## 📖 Usage Guide

### 1. **Upload Files**
- Click "Choose Files" or drag & drop files into the upload area
- Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG
- Files are automatically processed and added to your workspace

### 2. **Edit Documents**
- Switch to the "Editor" view
- Use the toolbar to select different editing tools:
  - **Select**: Move and resize objects
  - **Pen**: Draw freehand annotations
  - **Text**: Add text boxes
  - **Highlight**: Create highlights with custom colors
  - **Shapes**: Add rectangles, circles, and arrows

### 3. **Customize Themes**
- Navigate to the "Theme" view
- Choose from professional color palettes
- Customize primary, secondary, and accent colors
- See live preview of theme changes

### 4. **Save and Export**
- Use the save button to preserve your work
- Export as PDF with custom themes and styling
- Download your bundled documents

## 🏗️ Project Structure

```
smart_pdf_bundler/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── backend/                 # Flask backend API
│   ├── main.py             # Main Flask application
│   ├── flask_server.py     # Simplified Flask server
│   └── requirements.txt    # Python dependencies
├── launchers/              # Cross-platform launcher scripts
├── icons/                  # Application icons and logos
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
source venv/bin/activate
python flask_server.py    # Start Flask development server
```

### Adding New Features
1. **Frontend**: Add new components in `frontend/src/components/`
2. **Backend**: Add new API endpoints in `backend/flask_server.py`
3. **Styling**: Use Tailwind CSS classes for consistent design
4. **Icons**: Use Lucide React icons for consistency

## 🎨 Customization

### Adding New Tools
1. Add tool definition to the `toolbarGroups` array
2. Implement tool functionality in the canvas handlers
3. Add appropriate icons from Lucide React

### Custom Themes
1. Modify the theme object in the component state
2. Add new color palettes to the theme designer
3. Update CSS variables for consistent styling

### Styling
- **Colors**: Use Tailwind CSS color classes
- **Spacing**: Follow Tailwind spacing scale
- **Typography**: Use consistent font sizes and weights
- **Animations**: Use Framer Motion for smooth transitions

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
FLASK_ENV=development
FLASK_DEBUG=1
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Backend Configuration
- **Port**: Default 8000 (configurable in `flask_server.py`)
- **CORS**: Configured for localhost development
- **File Upload**: Configured for PDF and document files

### Frontend Configuration
- **Port**: Default 3000 (configurable in `vite.config.js`)
- **API URL**: Points to backend at `http://localhost:8000`
- **Build Output**: Configured for production deployment

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Deploy backend
cd ../backend
pip install -r requirements.txt
python flask_server.py
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Deploy automatically on push to main branch

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Add appropriate comments and documentation
- Test your changes thoroughly
- Update the README if adding new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/smart-pdf-bundler/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/smart-pdf-bundler/discussions)
- **Email**: support@smartpdfbundler.com

## 🔄 Changelog

### v2.0 Pro (Current)
- ✨ Complete UI redesign with modern interface
- 🎨 Professional theme designer
- 🛠️ Advanced PDF editing tools
- 📱 Responsive design for all devices
- 🚀 Cross-platform launcher scripts
- 🎯 Professional icons and branding

### v1.0
- 📁 Basic file upload functionality
- 🖊️ Simple PDF editing tools
- 💾 Basic save and export features

---

**Made with ❤️ by the Smart PDF Bundler Team** 