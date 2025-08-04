import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, PenTool, Highlighter, Type, Square, Circle, 
  ArrowRight, MessageSquare, Eye, Lock, RotateCw, Crop,
  ZoomIn, ZoomOut, Undo, Redo, Save, Download, Settings,
  Palette, Layers, Search, Mic, Shield, CheckSquare, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const PDFEditor = ({ pdfUrl, onSave }) => {
  const [currentTool, setCurrentTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [theme, setTheme] = useState({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B'
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Toolbar groups
  const toolbarGroups = [
    {
      label: "Pages",
      tools: [
        { id: 'thumbnails', icon: <FileText size={18} />, tip: "Thumbnails" },
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
        { id: 'password', icon: <Lock size={18} />, tip: "Password Protect" }
      ]
    }
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;
    
    // Set initial styles
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Draw initial background
    drawBackground();
  }, []);

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
    
    // Redraw all objects
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
      case 'arrow':
        drawArrow(obj);
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

  // Draw arrow
  const drawArrow = (obj) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = obj.lineWidth;
    
    const headLength = 15;
    const angle = Math.atan2(obj.endY - obj.startY, obj.endX - obj.startX);
    
    ctx.beginPath();
    ctx.moveTo(obj.startX, obj.startY);
    ctx.lineTo(obj.endX, obj.endY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(obj.endX, obj.endY);
    ctx.lineTo(obj.endX - headLength * Math.cos(angle - Math.PI / 6), obj.endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(obj.endX, obj.endY);
    ctx.lineTo(obj.endX - headLength * Math.cos(angle + Math.PI / 6), obj.endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  // Handle tool changes
  const handleToolChange = (toolId) => {
    setCurrentTool(toolId);
    setIsDrawing(false);
    setDrawingPath([]);
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
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
    } else if (currentTool === 'arrow') {
      addArrow(x, y);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (1000 / rect.height);
    
    setDrawingPath(prev => [...prev, { x, y }]);
    drawPath();
  };

  // Handle mouse up
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

  // Add text
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

  // Add rectangle
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

  // Add circle
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

  // Add arrow
  const addArrow = (x, y) => {
    const newObject = {
      id: Date.now(),
      type: 'arrow',
      startX: x,
      startY: y,
      endX: x + 100,
      endY: y,
      color: theme.primary,
      lineWidth: 3
    };
    addObject(newObject);
  };

  // Add path
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

  // Add object to canvas
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

  // Undo/Redo
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
      await onSave({ dataURL, objects });
      toast.success('Document saved successfully!');
    } catch (error) {
      toast.error('Failed to save document');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Thumbnails */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              exit={{ width: 0 }}
              className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Pages
                </h3>
                <div className="space-y-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        pageNumber === i + 1
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setPageNumber(i + 1)}
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Page {i + 1}
                      </div>
                      <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded border"></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className={`p-2 rounded-md transition-colors ${
                    showThumbnails
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Layers size={16} />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {pageNumber} of {totalPages}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Search size={16} />
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings size={16} />
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
        </div>

        {/* Right Sidebar - Inspector */}
        <AnimatePresence>
          {showInspector && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              exit={{ width: 0 }}
              className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Properties
                </h3>
                
                {/* Theme Colors */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Theme Colors
                  </label>
                  <div className="flex space-x-2">
                    {Object.entries(theme).map(([key, color]) => (
                      <button
                        key={key}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          const newColor = prompt('Enter new color (hex):', color);
                          if (newColor) {
                            setTheme(prev => ({ ...prev, [key]: newColor }));
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Object Properties */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      defaultValue="16"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Stroke Width
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      defaultValue="2"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="100"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PDFEditor; 