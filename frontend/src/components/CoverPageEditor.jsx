import { useState } from 'react';
import { FileText, Calendar, User, Building, Type } from 'lucide-react';

export default function CoverPageEditor({ coverInfo, setCoverInfo }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    setCoverInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cover Page Editor
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <div className={`space-y-4 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Document Title
            </label>
            <input
              type="text"
              value={coverInfo.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter document title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Client Name
            </label>
            <input
              type="text"
              value={coverInfo.client || ''}
              onChange={(e) => handleInputChange('client', e.target.value)}
              placeholder="Enter client name..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Company/Organization
            </label>
            <input
              type="text"
              value={coverInfo.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Enter company name..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={coverInfo.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={coverInfo.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter a brief description of the document bundle..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Author/Prepared By
            </label>
            <input
              type="text"
              value={coverInfo.author || ''}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Enter author name..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Cover Page Preview</h4>
          <div className="text-center space-y-2">
            {coverInfo.title && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{coverInfo.title}</h2>
            )}
            {coverInfo.client && (
              <p className="text-lg text-gray-700 dark:text-gray-300">Prepared for: {coverInfo.client}</p>
            )}
            {coverInfo.company && (
              <p className="text-md text-gray-600 dark:text-gray-400">{coverInfo.company}</p>
            )}
            {coverInfo.date && (
              <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(coverInfo.date).toLocaleDateString()}</p>
            )}
            {coverInfo.author && (
              <p className="text-sm text-gray-500 dark:text-gray-500">Prepared by: {coverInfo.author}</p>
            )}
            {!coverInfo.title && !coverInfo.client && !coverInfo.company && (
              <p className="text-gray-400 dark:text-gray-500 italic">Fill in the fields above to see a preview</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
