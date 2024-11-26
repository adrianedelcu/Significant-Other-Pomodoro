import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function Timer({ minutes, seconds, isRunning, onStart, onPause, onReset }: TimerProps) {
  return (
    <div className="text-center">
      <div className="text-8xl font-light tracking-widest mb-8 text-gray-900 dark:text-white transition-colors">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={isRunning ? onPause : onStart}
          className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={onReset}
          className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Reset"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}