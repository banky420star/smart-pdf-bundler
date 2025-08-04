import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Settings, Palette, Edit3, Download, 
  Eye, EyeOff, Maximize2, Minimize2, X, Plus, Trash2, 
  FileImage, FilePdf, Layers, Search, Mic, Shield, CheckSquare,
  PenTool, Highlighter, Type, Square, Circle, ArrowRight, 
  MessageSquare, RotateCw, Crop, ZoomIn, ZoomOut, Undo, Redo, Save,
  FolderOpen, Star, Clock, Users, BarChart3, Grid, List
} from 'lucide-react';
import toast from 'react-hot-toast';

const ModernUI = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentTool, setCurrentTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1F2937'
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [objects, setObjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      
      canvas.width = 800;
      canvas.height = 1000;
      
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      drawBackground();
    }
  }, [theme]);

  // Draw background
  const drawBackground = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1000);
    
    // Draw grid pattern
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1000);
      ctx.stroke();
    }
    for (let i = 0; i < 1000; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }
    
    redrawObjects();
  };

  // Redraw all objects
  const redrawObjects = () => {
    objects.forEach(obj => {
      drawObject(obj);
    });
  };

  // Draw individual object
  const drawObject = (obj) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.save();
    
    switch (obj.type) {
      case 'text':
        ctx.font = `${obj.fontSize}px Arial`;
        ctx.fillStyle = obj.color;
        ctx.fillText(obj.text, obj.x, obj.y);
        break;
      case 'rectangle':
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        break;
      case 'circle':
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.beginPath();
        ctx.arc(obj.x + obj.radius, obj.y + obj.radius, obj.radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'path':
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.beginPath();
        obj.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded',
      progress: 100,
      uploadedAt: new Date()
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCurrentView('editor');
  };

  // Handle file removal
  const handleFileRemove = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  // Handle tool changes
  const handleToolChange = (toolId) => {
    setCurrentTool(toolId);
    setIsDrawing(false);
    setDrawingPath([]);
  };

  // Handle mouse events for canvas
  const handleMouseDown = (e) => {
    if (currentView !== 'editor' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (1000 / rect.height);
    
    if (currentTool === 'pen' || currentTool === 'highlight') {
      setIsDrawing(true);
      setDrawingPath([{ x, y }]);
    } else if (currentTool === 'text') {
      addText(x, y);
    } else if (currentTool === 'rectangle') {
      addRectangle(x, y);
    } else if (currentTool === 'circle') {
      addCircle(x, y);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (1000 / rect.height);
    
    setDrawingPath(prev => [...prev, { x, y }]);
    drawPath();
  };

  const handleMouseUp = () => {
    if (isDrawing && drawingPath.length > 1) {
      addPath();
    }
    setIsDrawing(false);
    setDrawingPath([]);
  };

  // Draw current path
  const drawPath = () => {
    const ctx = ctxRef.current;
    if (!ctx || drawingPath.length < 2) return;
    
    ctx.strokeStyle = currentTool === 'highlight' ? 'rgba(255, 255, 0, 0.3)' : theme.primary;
    ctx.lineWidth = currentTool === 'highlight' ? 20 : 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    drawingPath.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  // Add objects
  const addText = (x, y) => {
    const text = prompt('Enter text:');
    if (text) {
      const newObject = {
        id: Date.now(),
        type: 'text',
        text,
        x,
        y,
        color: theme.primary,
        fontSize: 16
      };
      addObject(newObject);
    }
  };

  const addRectangle = (x, y) => {
    const newObject = {
      id: Date.now(),
      type: 'rectangle',
      x,
      y,
      width: 100,
      height: 60,
      color: theme.primary,
      lineWidth: 2
    };
    addObject(newObject);
  };

  const addCircle = (x, y) => {
    const newObject = {
      id: Date.now(),
      type: 'circle',
      x,
      y,
      radius: 50,
      color: theme.primary,
      lineWidth: 2
    };
    addObject(newObject);
  };

  const addPath = () => {
    const newObject = {
      id: Date.now(),
      type: 'path',
      points: [...drawingPath],
      color: currentTool === 'highlight' ? 'rgba(255, 255, 0, 0.3)' : theme.primary,
      lineWidth: currentTool === 'highlight' ? 20 : 2
    };
    addObject(newObject);
  };

  const addObject = (obj) => {
    const newObjects = [...objects, obj];
    setObjects(newObjects);
    addToHistory({
      type: 'add',
      object: obj,
      timestamp: Date.now()
    });
    drawObject(obj);
  };

  // History management
  const addToHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(action);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      toast.success('Undone');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      toast.success('Redone');
    }
  };

  // Zoom controls
  const zoomIn = () => {
    const newZoom = Math.min(zoom + 25, 400);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 25, 25);
    setZoom(newZoom);
  };

  // Save function
  const handleSave = async () => {
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      toast.success('Document saved successfully!');
    } catch (error) {
      toast.error('Failed to save document');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Toolbar groups
  const toolbarGroups = [
    {
      label: "Pages",
      tools: [
        { id: 'thumbnails', icon: <Layers size={18} />, tip: "Thumbnails" },
        { id: 'rotate', icon: <RotateCw size={18} />, tip: "Rotate" },
        { id: 'crop', icon: <Crop size={18} />, tip: "Crop" }
      ]
    },
    {
      label: "Content",
      tools: [
        { id: 'select', icon: <Square size={18} />, tip: "Select" },
        { id: 'text', icon: <Type size={18} />, tip: "Text Box" },
        { id: 'pen', icon: <PenTool size={18} />, tip: "Ink" },
        { id: 'highlight', icon: <Highlighter size={18} />, tip: "Highlight" }
      ]
    },
    {
      label: "Shapes",
      tools: [
        { id: 'rectangle', icon: <Square size={18} />, tip: "Rectangle" },
        { id: 'circle', icon: <Circle size={18} />, tip: "Circle" },
        { id: 'arrow', icon: <ArrowRight size={18} />, tip: "Arrow" }
      ]
    },
    {
      label: "Comment",
      tools: [
        { id: 'sticky', icon: <MessageSquare size={18} />, tip: "Sticky Note" },
        { id: 'audio', icon: <Mic size={18} />, tip: "Audio Comment" }
      ]
    },
    {
      label: "Secure",
      tools: [
        { id: 'redact', icon: <Shield size={18} />, tip: "Redact" },
        { id: 'password', icon: <CheckSquare size={18} />, tip: "Password Protect" }
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
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
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                Dashboard
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

            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                {isDarkMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                {showSidebar ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              exit={{ width: 0 }}
              className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Files ({files.length})
                </h3>
                
                {/* File Upload */}
                <div className="mb-4">
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
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </button>
                </div>

                {/* File List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                          <FilePdf className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleFileSelect(file)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFileRemove(file.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                {files.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Generate Bundle
                      </button>
                      
                      <button 
                        onClick={() => setCurrentView('theme')}
                        className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Customize Theme
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex items-center justify-center p-8"
              >
                <div className="max-w-4xl w-full">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Welcome to Smart PDF Bundler
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                      Professional PDF editing and bundling made simple
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Upload Files
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Drag and drop your PDFs, documents, and images to get started
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                        <Edit3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Edit & Annotate
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Use professional tools to edit, annotate, and enhance your documents
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                        <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Export Bundle
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Generate professional PDF bundles with custom themes and styling
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'editor' && (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Editor Toolbar */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2">
                    {/* Tool Groups */}
                    <div className="flex items-center space-x-4">
                      {toolbarGroups.map((group) => (
                        <div key={group.label} className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                            {group.label}
                          </span>
                          {group.tools.map((tool) => (
                            <button
                              key={tool.id}
                              onClick={() => handleToolChange(tool.id)}
                              className={`p-2 rounded-md transition-colors ${
                                currentTool === tool.id
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}
                              title={tool.tip}
                            >
                              {tool.icon}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <Undo size={18} />
                      </button>
                      <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <Redo size={18} />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                      
                      <button onClick={zoomOut} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ZoomOut size={18} />
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
                        {zoom}%
                      </span>
                      <button onClick={zoomIn} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ZoomIn size={18} />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                      
                      <button onClick={handleSave} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Save size={18} />
                      </button>
                      <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto">
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={1000}
                        className="border border-gray-200 cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{ transform: `scale(${zoom / 100})` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'theme' && (
              <motion.div
                key="theme"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-auto p-8"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Theme Designer
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Customize the look and feel of your PDF bundles
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Color Palette
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(theme).map(([key, color]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {key}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {color}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button */}
      {files.length > 0 && currentView === 'dashboard' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('editor')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <Edit3 className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default ModernUI; 