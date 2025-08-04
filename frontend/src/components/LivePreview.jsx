import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, FileText, Loader2, Play, Pause, Sparkles, Zap, CheckCircle, Copy, Share2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { showSuccessToast, showErrorToast } from './Toast';

export default function LivePreview({ previewUrl, files, coverInfo, theme, onGenerate, clientId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [wsConnection, setWsConnection] = useState(null);

  // WebSocket connection for real-time progress
  useEffect(() => {
    if (clientId) {
      const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
      
      ws.onopen = () => {
        console.log('Preview WebSocket connected');
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      ws.onclose = () => {
        console.log('Preview WebSocket disconnected');
        setWsConnection(null);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [clientId]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'bundle_started':
        setProgress(10);
        setProgressMessage('AI analysis started...');
        break;
      case 'file_processing':
        setProgress(20 + (data.progress * 0.3));
        setProgressMessage(`Processing ${data.filename}...`);
        break;
      case 'creating_cover':
        setProgress(70);
        setProgressMessage('Creating cover page...');
        break;
      case 'creating_toc':
        setProgress(80);
        setProgressMessage('Generating table of contents...');
        break;
      case 'compiling_bundle':
        setProgress(90);
        setProgressMessage('Compiling final PDF...');
        break;
      case 'uploading':
        setProgress(95);
        setProgressMessage('Uploading to cloud...');
        break;
      case 'bundle_complete':
        setProgress(100);
        setProgressMessage('Bundle ready!');
        setDownloadUrl(data.download_url);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        showSuccessToast('PDF bundle created successfully! 🎉');
        break;
      case 'error':
        setProgress(0);
        setProgressMessage('Error occurred');
        showErrorToast(data.message);
        break;
    }
  };

  const handleGeneratePreview = async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('Initializing...');
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('coverInfo', JSON.stringify(coverInfo));
      formData.append('theme', theme);
      formData.append('client_id', clientId);
      
      const response = await fetch('/api/bundle', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to generate bundle');
      }

      const data = await response.json();
      setDownloadUrl(data.url);
      
    } catch (error) {
      console.error('Error generating bundle:', error);
      showErrorToast("Failed to generate PDF bundle");
      setProgress(0);
      setProgressMessage('Error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!downloadUrl) return;
    
    setIsLoading(true);
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `document-bundle-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccessToast('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showErrorToast("Failed to download PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!downloadUrl) return;
    
    try {
      await navigator.clipboard.writeText(downloadUrl);
      showSuccessToast('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      showErrorToast("Failed to copy link");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {showConfetti && <Confetti />}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Live Preview & Export
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-enhanced PDF bundle with real-time progress
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
              AI Powered
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Progress Tracking */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6 text-blue-500" />
                </motion.div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Creating AI-Enhanced Bundle
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {progressMessage}
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mt-2">
                <span>AI Analysis</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </motion.div>
          )}

          {/* Preview Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">PDF Bundle Preview</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {files.length} files • {theme} theme • AI enhanced
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleGeneratePreview}
                disabled={files.length === 0 || isGenerating}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isGenerating ? 'Generating...' : 'Generate AI Bundle'}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
            {downloadUrl ? (
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 relative">
                <iframe
                  src={downloadUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <motion.button
                    onClick={handleExportPDF}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {isLoading ? 'Downloading...' : 'Download PDF'}
                    </span>
                  </motion.button>
                  
                  <motion.button
                    onClick={copyShareLink}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="font-medium">Share</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <FileText className="w-20 h-20 text-gray-400 mx-auto" />
                  </motion.div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                      {files.length === 0 ? 'No files uploaded yet' : 'Preview not generated yet'}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      {files.length === 0 
                        ? 'Upload some files to get started' 
                        : 'Click "Generate AI Bundle" to create your PDF'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bundle Info */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Bundle Summary</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 dark:text-blue-300">Files</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">{files.length}</p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-300">Theme</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">{theme}</p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-300">Cover Page</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {coverInfo.title ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-300">Status</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {downloadUrl ? 'Ready' : 'Pending'}
                  </p>
                </div>
              </div>
              
              {downloadUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Bundle ready for download and sharing!
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
