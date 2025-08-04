import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label="Toggle dark mode"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          isDark ? 'translate-x-11' : 'translate-x-1'
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className={`h-4 w-4 text-yellow-500 transition-opacity duration-200 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`} />
        <Moon className={`h-4 w-4 text-blue-500 transition-opacity duration-200 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
    </button>
  );
}
