import { useState } from 'react';
import { Palette, Check } from 'lucide-react';

const themes = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    colors: {
      primary: 'bg-gray-100 dark:bg-gray-800',
      accent: 'bg-gray-200 dark:bg-gray-700',
      text: 'text-gray-900 dark:text-white'
    },
    preview: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Professional and formal',
    colors: {
      primary: 'bg-blue-50 dark:bg-blue-900/20',
      accent: 'bg-blue-100 dark:bg-blue-800/30',
      text: 'text-blue-900 dark:text-blue-100'
    },
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary and sleek',
    colors: {
      primary: 'bg-purple-50 dark:bg-purple-900/20',
      accent: 'bg-purple-100 dark:bg-purple-800/30',
      text: 'text-purple-900 dark:text-purple-100'
    },
    preview: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Business and executive',
    colors: {
      primary: 'bg-slate-50 dark:bg-slate-800',
      accent: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-900 dark:text-slate-100'
    },
    preview: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800'
  }
];

export default function StyleThemePicker({ selected, setSelected }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Style Theme
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a theme for your PDF bundle. Each theme includes custom colors, fonts, and layout styles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelected(theme.name)}
                className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selected === theme.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className={`p-4 rounded-lg ${theme.preview}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${theme.colors.text}`}>{theme.name}</h4>
                    {selected === theme.name && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <p className={`text-sm ${theme.colors.text} opacity-75`}>
                    {theme.description}
                  </p>
                  
                  <div className="mt-3 flex space-x-2">
                    <div className={`w-4 h-4 rounded ${theme.colors.primary}`}></div>
                    <div className={`w-4 h-4 rounded ${theme.colors.accent}`}></div>
                    <div className={`w-4 h-4 rounded border ${theme.colors.text}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Selection Preview */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Theme: {selected}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {themes.find(t => t.name === selected)?.description}
              </p>
            </div>
            <div className="flex space-x-2">
              {themes.find(t => t.name === selected) && (
                <>
                  <div className={`w-6 h-6 rounded ${themes.find(t => t.name === selected).colors.primary}`}></div>
                  <div className={`w-6 h-6 rounded ${themes.find(t => t.name === selected).colors.accent}`}></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
