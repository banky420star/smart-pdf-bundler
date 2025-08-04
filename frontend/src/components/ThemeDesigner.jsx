import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Upload, EyeDropper, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ThemeDesigner = ({ onThemeChange, currentTheme }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Default theme colors
  const defaultTheme = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1F2937'
  };

  const [theme, setTheme] = useState(currentTheme || defaultTheme);

  // Simple color extraction from image (without colorthief)
  const extractColorsFromImage = async (file) => {
    setIsProcessing(true);
    
    try {
      const img = new Image();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple color extraction - sample pixels and find dominant colors
        const colors = [];
        const colorCounts = {};
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Convert to hex
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          
          // Group similar colors
          const roundedHex = `#${Math.round(r / 32) * 32 << 16 | Math.round(g / 32) * 32 << 8 | Math.round(b / 32) * 32}`;
          
          if (colorCounts[roundedHex]) {
            colorCounts[roundedHex]++;
          } else {
            colorCounts[roundedHex] = 1;
          }
        }
        
        // Get top 5 colors
        const sortedColors = Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([color]) => color);
        
        setExtractedColors(sortedColors);
        
        // Auto-apply the first color as primary
        const newTheme = {
          ...theme,
          primary: sortedColors[0],
          secondary: sortedColors[1] || sortedColors[0],
          accent: sortedColors[2] || sortedColors[0]
        };
        
        setTheme(newTheme);
        onThemeChange(newTheme);
        
        toast.success('Colors extracted successfully!');
      };
      
      img.src = URL.createObjectURL(file);
      
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast.error('Failed to extract colors from image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        extractColorsFromImage(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      extractColorsFromImage(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Color picker for manual selection
  const handleColorChange = (colorKey, color) => {
    const newTheme = { ...theme, [colorKey]: color };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  // Apply extracted color
  const applyExtractedColor = (color, colorKey) => {
    const newTheme = { ...theme, [colorKey]: color };
    setTheme(newTheme);
    onThemeChange(newTheme);
    toast.success(`${colorKey} color updated!`);
  };

  // Reset to default theme
  const resetTheme = () => {
    setTheme(defaultTheme);
    onThemeChange(defaultTheme);
    setExtractedColors([]);
    toast.success('Theme reset to default');
  };

  // Generate complementary colors
  const generateComplementaryColors = () => {
    const primary = theme.primary;
    const r = parseInt(primary.slice(1, 3), 16);
    const g = parseInt(primary.slice(3, 5), 16);
    const b = parseInt(primary.slice(5, 7), 16);
    
    // Generate complementary color
    const complementary = `#${((255 - r) << 16 | (255 - g) << 8 | (255 - b)).toString(16).padStart(6, '0')}`;
    
    // Generate analogous colors
    const analogous1 = `#${((r + 30) % 256 << 16 | (g + 30) % 256 << 8 | (b + 30) % 256).toString(16).padStart(6, '0')}`;
    const analogous2 = `#${((r - 30 + 256) % 256 << 16 | (g - 30 + 256) % 256 << 8 | (b - 30 + 256) % 256).toString(16).padStart(6, '0')}`;
    
    const newTheme = {
      ...theme,
      secondary: complementary,
      accent: analogous1
    };
    
    setTheme(newTheme);
    onThemeChange(newTheme);
    toast.success('Complementary colors generated!');
  };

  // Predefined color palettes
  const predefinedPalettes = [
    {
      name: 'Ocean Blue',
      colors: ['#1E40AF', '#0EA5E9', '#06B6D4', '#FFFFFF', '#1F2937']
    },
    {
      name: 'Forest Green',
      colors: ['#059669', '#10B981', '#34D399', '#FFFFFF', '#1F2937']
    },
    {
      name: 'Sunset Orange',
      colors: ['#DC2626', '#F97316', '#F59E0B', '#FFFFFF', '#1F2937']
    },
    {
      name: 'Royal Purple',
      colors: ['#7C3AED', '#8B5CF6', '#A78BFA', '#FFFFFF', '#1F2937']
    },
    {
      name: 'Midnight Dark',
      colors: ['#1F2937', '#374151', '#6B7280', '#F9FAFB', '#FFFFFF']
    }
  ];

  // Apply predefined palette
  const applyPalette = (palette) => {
    const newTheme = {
      primary: palette.colors[0],
      secondary: palette.colors[1],
      accent: palette.colors[2],
      background: palette.colors[3],
      text: palette.colors[4]
    };
    setTheme(newTheme);
    onThemeChange(newTheme);
    toast.success(`${palette.name} palette applied!`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Theme Designer
        </h3>
        <button
          onClick={resetTheme}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Reset
        </button>
      </div>

      {/* Logo Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Logo to Extract Colors
        </label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag and drop your logo here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Supports JPG, PNG, SVG
          </p>
        </div>
      </div>

      {/* Predefined Palettes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Palettes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {predefinedPalettes.map((palette, index) => (
            <button
              key={index}
              onClick={() => applyPalette(palette)}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex space-x-1 mb-2">
                {palette.colors.slice(0, 3).map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {palette.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Colors */}
      <AnimatePresence>
        {extractedColors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Extracted Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {extractedColors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Colors */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme Colors
        </label>
        
        <div className="space-y-3">
          {Object.entries(theme).map(([key, color]) => (
            <div key={key} className="flex items-center space-x-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] capitalize">
                {key}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              {/* Quick apply extracted colors */}
              {extractedColors.length > 0 && (
                <div className="flex space-x-1">
                  {extractedColors.slice(0, 3).map((extractedColor, index) => (
                    <button
                      key={index}
                      onClick={() => applyExtractedColor(extractedColor, key)}
                      className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 hover:scale-125 transition-transform"
                      style={{ backgroundColor: extractedColor }}
                      title={`Apply ${extractedColor}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Color Generation Tools */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color Tools
        </label>
        
        <div className="flex space-x-2">
          <button
            onClick={generateComplementaryColors}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Complementary</span>
          </button>
          
          <button
            onClick={() => {
              const newTheme = {
                ...theme,
                background: theme.background === '#FFFFFF' ? '#1F2937' : '#FFFFFF',
                text: theme.text === '#1F2937' ? '#F9FAFB' : '#1F2937'
              };
              setTheme(newTheme);
              onThemeChange(newTheme);
            }}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
          >
            <EyeDropper className="w-4 h-4" />
            <span>Toggle Dark/Light</span>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview
        </label>
        
        <div 
          className="p-4 rounded-lg border border-gray-200 dark:border-gray-600"
          style={{ backgroundColor: theme.background }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-8 h-8 rounded"
              style={{ backgroundColor: theme.primary }}
            />
            <h4 
              className="font-semibold"
              style={{ color: theme.text }}
            >
              Sample Document
            </h4>
          </div>
          
          <p 
            className="text-sm mb-2"
            style={{ color: theme.text }}
          >
            This is how your documents will look with the selected theme.
          </p>
          
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 text-xs rounded"
              style={{ 
                backgroundColor: theme.primary, 
                color: '#FFFFFF' 
              }}
            >
              Primary Button
            </button>
            <button 
              className="px-3 py-1 text-xs rounded border"
              style={{ 
                borderColor: theme.secondary, 
                color: theme.secondary 
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ThemeDesigner; 