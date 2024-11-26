import React from 'react';
import { type SessionType } from '../types';

interface ModeSelectorProps {
  currentMode: SessionType;
  onModeChange: (mode: SessionType) => void;
  workActive: boolean;
  breakActive: boolean;
  workSessionStarted: boolean;
  breakSessionStarted: boolean;
}

export function ModeSelector({ 
  currentMode, 
  onModeChange, 
  workActive, 
  breakActive,
  workSessionStarted,
  breakSessionStarted
}: ModeSelectorProps) {
  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg transition-colors">
      <button
        onClick={() => onModeChange('work')}
        className={`px-4 py-2 rounded-md transition-colors relative ${
          currentMode === 'work'
            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Work
        {workActive && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
        {workSessionStarted && !workActive && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
      <button
        onClick={() => onModeChange('break')}
        className={`px-4 py-2 rounded-md transition-colors relative ${
          currentMode === 'break'
            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Break
        {breakActive && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
        {breakSessionStarted && !breakActive && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
}