import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, File, X, CheckCircle, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';
import { showSuccessToast, showErrorToast } from './Toast';

export default function UploadZone({ onFiles, onProgress, clientId }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);

  // WebSocket connection for real-time progress
  useEffect(() => {
    if (clientId) {
      const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [clientId]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'file_processed':
        setAiInsights(prev => [...prev, {
          filename: data.filename,
          classification: data.classification,
          summary: data.summary,
          sensitiveDataCount: data.sensitive_data_count
        }]);
        showSuccessToast(`AI processed: ${data.filename}`);
        break;
      case 'bundle_started':
        showSuccessToast('AI bundle creation started!');
        break;
      case 'bundle_complete':
        showSuccessToast('Bundle created successfully! 🎉');
        break;
      case 'error':
        showErrorToast(data.message);
        break;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length > 0) {
      // Add files to uploading state
      setUploadingFiles(validFiles.map(file => ({
        file,
        status: 'uploading',
        progress: 0
      })));

      // Simulate upload progress
      for (let i = 0; i < validFiles.length; i++) {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadingFiles(prev => prev.map((item, index) => 
            index === i ? { ...item, progress } : item
          ));
        }
        
        setUploadingFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'completed' } : item
        ));
      }

      onFiles(validFiles);
      showSuccessToast(`${validFiles.length} file(s) uploaded successfully`);
    }
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: true
  });

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('docx')) return <FileText className="w-6 h-6 text-blue-500" />;
    if (fileType.includes('text') || fileType.includes('txt')) return <FileText className="w-6 h-6 text-gray-500" />;
    if (fileType.includes('image')) return <Image className="w-6 h-6 text-green-500" />;
    return <File className="w-6 h-6 text-gray-400" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Documents
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop files here for AI-powered processing and analysis
          </p>
        </motion.div>
      </div>

      <motion.div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dropzoneDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-6">
          <motion.div 
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            animate={dropzoneDragActive ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Upload className="w-10 h-10 text-white" />
          </motion.div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {dropzoneDragActive ? 'Drop files here' : 'Upload your documents'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supports PDF, DOCX, TXT, PNG, JPG files
            </p>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                AI-powered text extraction & classification
              </span>
            </div>
          </div>
        </div>

        {dropzoneDragActive && (
          <motion.div 
            className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              Drop to upload
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Progress
            </h4>
            {uploadingFiles.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {getFileIcon(item.file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.file.name}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                {getStatusIcon(item.status)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights */}
      <AnimatePresence>
        {aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Insights
              </h4>
            </div>
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {insight.filename}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Type: <span className="font-medium capitalize">{insight.classification}</span>
                    </p>
                    {insight.summary && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {insight.summary}
                      </p>
                    )}
                    {insight.sensitiveDataCount > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        ⚠️ {insight.sensitiveDataCount} sensitive data items detected
                      </p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setAiInsights(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p>Maximum file size: 10MB per file</p>
        <p>Supported formats: PDF, DOCX, TXT, PNG, JPG</p>
        <p className="flex items-center justify-center space-x-1">
          <Sparkles className="w-3 h-3" />
          <span>AI-powered text extraction and document classification</span>
        </p>
      </div>
    </div>
  );
}
