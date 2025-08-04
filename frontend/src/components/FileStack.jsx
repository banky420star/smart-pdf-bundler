import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, File, X, GripVertical, Eye, Trash2, Sparkles, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { showSuccessToast, showErrorToast } from './Toast';

export default function FileStack({ files, setFiles, aiInsights = [] }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (file.type.includes('word') || file.type.includes('docx')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (file.type.includes('text') || file.type.includes('txt')) return <FileText className="w-5 h-5 text-gray-500" />;
    if (file.type.includes('image')) return <Image className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileInsight = (filename) => {
    return aiInsights.find(insight => insight.filename === filename);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    showSuccessToast('File removed from bundle');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
    showSuccessToast('Files reordered successfully');
  };

  const openInspector = (file, index) => {
    setSelectedFile({ ...file, index });
    setIsInspectorOpen(true);
  };

  if (files.length === 0) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">No files uploaded yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Upload some files to get started with AI-powered analysis
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Document Bundle ({files.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag to reorder • Click to inspect • AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            AI Enhanced
          </span>
        </div>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="files">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {files.map((file, index) => {
                const insight = getFileInsight(file.name);
                return (
                  <Draggable key={`${file.name}-${index}`} draggableId={`${file.name}-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${
                          snapshot.isDragging ? 'shadow-xl scale-105 rotate-2' : ''
                        } ${insight ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        layout
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-4">
                            <div {...provided.dragHandleProps} className="flex-shrink-0">
                              <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 cursor-grab active:cursor-grabbing" />
                            </div>
                            
                            <div className="flex-shrink-0">
                              {getFileIcon(file)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {file.name}
                                </p>
                                {insight && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center space-x-1"
                                  >
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium capitalize">
                                      {insight.classification}
                                    </span>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)} • {file.type}
                              </p>
                              
                              {/* AI Insights Preview */}
                              {insight && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                                >
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    {insight.summary}
                                  </p>
                                  {insight.sensitiveDataCount > 0 && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <AlertTriangle className="w-3 h-3 text-red-500" />
                                      <span className="text-xs text-red-600 dark:text-red-400">
                                        {insight.sensitiveDataCount} sensitive items
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <motion.button
                                onClick={() => openInspector(file, index)}
                                className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Inspect file"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => removeFile(index)}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Remove file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* File Inspector Sidebar */}
      <AnimatePresence>
        {isInspectorOpen && selectedFile && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50"
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  File Inspector
                </h3>
                <motion.button
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* File Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">File Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{selectedFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-white">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white">{selectedFile.type}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                {getFileInsight(selectedFile.name) && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Analysis</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">Classification:</span>
                        <span className="ml-2 text-sm font-medium text-blue-900 dark:text-blue-100 capitalize">
                          {getFileInsight(selectedFile.name).classification}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">Summary:</span>
                        <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                          {getFileInsight(selectedFile.name).summary}
                        </p>
                      </div>
                      {getFileInsight(selectedFile.name).sensitiveDataCount > 0 && (
                        <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700 dark:text-red-300">
                            {getFileInsight(selectedFile.name).sensitiveDataCount} sensitive data items detected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Preview
                    </motion.button>
                    <motion.button
                      className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Edit
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>Drag files to reorder them in the final PDF bundle</p>
        <p className="flex items-center justify-center space-x-1 mt-1">
          <Sparkles className="w-3 h-3" />
          <span>AI analysis provides automatic classification and insights</span>
        </p>
      </div>
    </div>
  );
}
