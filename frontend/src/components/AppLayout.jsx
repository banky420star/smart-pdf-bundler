import { useState } from 'react';
import { Moon, Sun, FileText, Settings, Download, Upload } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AppLayout({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Smart PDF Bundler</h1>
            </div>
          </div>
          
          <nav className="px-4 space-y-2">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                Tools
              </div>
              <a href="#upload" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </a>
              <a href="#organize" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Organize</span>
              </a>
              <a href="#preview" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Preview & Export</span>
              </a>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                Settings
              </div>
              <button 
                onClick={toggleDarkMode}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Your PDF Bundle</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload, organize, and export your documents</p>
              </div>
              <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
