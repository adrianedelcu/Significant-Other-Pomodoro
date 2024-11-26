import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-amber-500 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-indigo-500 transition-colors" />
      )}
    </button>
  );
}