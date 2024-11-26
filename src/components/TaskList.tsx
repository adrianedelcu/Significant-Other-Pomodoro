import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, X } from 'lucide-react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) {
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
          aria-label="Add task"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-gray-700 group transition-colors"
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5"
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed ? (
                <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={20} />
              ) : (
                <Circle size={20} />
              )}
            </button>
            <div className={`flex-1 min-w-0 ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
              <p className="break-words whitespace-pre-wrap pr-2">{task.text}</p>
            </div>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
              aria-label="Delete task"
            >
              <X size={18} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No tasks yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}