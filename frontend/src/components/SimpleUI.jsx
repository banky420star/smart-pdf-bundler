import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Upload, Edit3, Download, Palette, Eye, EyeOff,
  PenTool, Type, Square, Circle, Highlighter, Undo, Redo, Save, ZoomOut, ZoomIn
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const SimpleUI = () => {
  const [currentView, setCurrentView] = useState('upload');
  const [files, setFiles] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTool, setCurrentTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [objects, setObjects] = useState([]);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setCurrentView('editor');
  };

  // Handle tool changes
  const handleToolChange = (toolId) => {
    setCurrentTool(toolId);
    setIsDrawing(false);
  };

  // Handle mouse events
  const handleMouseDown = (e) => {
    if (currentTool === 'pen' || currentTool === 'highlight') {
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing) {
      // Drawing logic here
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Smart PDF Bundler
              </h1>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                v2.0 Pro
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'upload'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                Upload
              </button>
              
              <button
                onClick={() => setCurrentView('editor')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'editor'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                Editor
              </button>
              
              <button
                onClick={() => setCurrentView('theme')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'theme'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                <Palette className="w-4 h-4" />
              </button>
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                {isDarkMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <AnimatePresence mode="wait">
          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Upload Your Documents
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Drag and drop your files to create a professional PDF bundle
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Files
              </button>
              
              {files.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Uploaded Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <span className="text-gray-900 dark:text-gray-100">{file.name}</span>
                        <span className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {/* Toolbar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Tools:</span>
                    <button
                      onClick={() => handleToolChange('select')}
                      className={`p-2 rounded ${currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToolChange('pen')}
                      className={`p-2 rounded ${currentTool === 'pen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      <PenTool className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToolChange('text')}
                      className={`p-2 rounded ${currentTool === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToolChange('highlight')}
                      className={`p-2 rounded ${currentTool === 'highlight' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    >
                      <Highlighter className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button onClick={zoomOut} className="p-2 rounded hover:bg-gray-100">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">{zoom}%</span>
                    <button onClick={zoomIn} className="p-2 rounded hover:bg-gray-100">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded hover:bg-gray-100">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="border border-gray-300 rounded cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                Theme Designer
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Color Palette
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-sm text-gray-600">{color}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SimpleUI; 