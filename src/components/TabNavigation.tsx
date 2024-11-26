import React from 'react';

export function TabNavigation({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  return (
    <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg transition-colors">
      <button
        onClick={() => onChange('timer')}
        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
          active === 'timer'
            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Timer
      </button>
      <button
        onClick={() => onChange('history')}
        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
          active === 'history'
            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        History
      </button>
    </div>
  );
}