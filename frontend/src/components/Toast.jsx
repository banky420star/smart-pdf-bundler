import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const colors = {
    success: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
    error: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg border ${colors[type]} shadow-lg max-w-sm`}>
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast utility functions
export const showToast = (message, type = 'info') => {
  // This would integrate with react-hot-toast or a custom toast system
  console.log(`[${type.toUpperCase()}] ${message}`);
};

export const showSuccessToast = (message) => showToast(message, 'success');
export const showErrorToast = (message) => showToast(message, 'error');
export const showWarningToast = (message) => showToast(message, 'warning');
export const showInfoToast = (message) => showToast(message, 'info');
