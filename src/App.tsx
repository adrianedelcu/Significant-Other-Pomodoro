import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { ModeSelector } from './components/ModeSelector';
import { History } from './components/History';
import { TabNavigation } from './components/TabNavigation';
import { TaskList } from './components/TaskList';
import { LinePopup } from './components/LinePopup';
import { ThemeToggle } from './components/ThemeToggle';
import { Timer as TimerIcon, ListTodo } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Session, SessionType, TimerState, Task } from './types';

const WORK_TIME = 10; // 10 seconds for testing
const BREAK_TIME = 10; // 10 seconds for testing

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [mode, setMode] = useState<SessionType>('work');
  const [showLinePopup, setShowLinePopup] = useState(false);
  const [workTimer, setWorkTimer] = useState<TimerState>({
    timeLeft: WORK_TIME,
    isRunning: false,
    sessionStart: null,
    currentGoal: ''
  });
  const [breakTimer, setBreakTimer] = useState<TimerState>({
    timeLeft: BREAK_TIME,
    isRunning: false,
    sessionStart: null,
    currentGoal: ''
  });
  const [sessions, setSessions] = useLocalStorage<Session[]>('pomodoro-sessions', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);

  const currentTimer = mode === 'work' ? workTimer : breakTimer;
  const setCurrentTimer = mode === 'work' ? setWorkTimer : setBreakTimer;

  const resetTimer = useCallback((timerMode: SessionType) => {
    const initialTime = timerMode === 'work' ? WORK_TIME : BREAK_TIME;
    const setTimer = timerMode === 'work' ? setWorkTimer : setBreakTimer;
    
    setTimer({
      timeLeft: initialTime,
      isRunning: false,
      sessionStart: null,
      currentGoal: ''
    });
  }, []);

  const handleModeChange = (newMode: SessionType) => {
    setMode(newMode);
  };

  const handleStart = () => {
    setCurrentTimer(prev => ({
      ...prev,
      isRunning: true,
      sessionStart: prev.sessionStart || new Date().toISOString(),
    }));
  };

  const handlePause = () => {
    setCurrentTimer(prev => ({ ...prev, isRunning: false }));
  };

  const handleGoalChange = (goal: string) => {
    setCurrentTimer(prev => ({ ...prev, currentGoal: goal }));
  };

  const handleUpdateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(session => 
      session.id === id ? { ...session, ...updates } : session
    ));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  useEffect(() => {
    let interval: number;

    if (currentTimer.isRunning && currentTimer.timeLeft > 0) {
      interval = window.setInterval(() => {
        setCurrentTimer(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (currentTimer.timeLeft === 0 && currentTimer.sessionStart) {
      const newSession: Session = {
        id: Date.now().toString(),
        type: mode,
        startTime: currentTimer.sessionStart,
        duration: mode === 'work' ? WORK_TIME : BREAK_TIME,
        goal: currentTimer.currentGoal,
        status: 'active'
      };
      setSessions(prev => [newSession, ...prev]);
      setShowLinePopup(true);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
          body: `${mode === 'work' ? 'Work' : 'Break'} session completed!`,
        });
      }
      resetTimer(mode);
    }

    return () => {
      clearInterval(interval);
    };
  }, [currentTimer.isRunning, currentTimer.timeLeft, mode, resetTimer, currentTimer.sessionStart, 
      currentTimer.currentGoal, setSessions]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const minutes = Math.floor(currentTimer.timeLeft / 60);
  const seconds = currentTimer.timeLeft % 60;

  const workSessionStarted = workTimer.sessionStart !== null;
  const breakSessionStarted = breakTimer.sessionStart !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
          <div className="flex items-center justify-center mb-8">
            <TimerIcon className="text-indigo-600 dark:text-indigo-400 mr-2 transition-colors" size={28} />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
              Pomodoro Timer
            </h1>
          </div>

          <TabNavigation active={activeTab} onChange={setActiveTab} />

          {activeTab === 'timer' ? (
            <>
              <div className="flex justify-center mb-8">
                <ModeSelector 
                  currentMode={mode} 
                  onModeChange={handleModeChange}
                  workActive={workTimer.isRunning}
                  breakActive={breakTimer.isRunning}
                  workSessionStarted={workSessionStarted}
                  breakSessionStarted={breakSessionStarted}
                />
              </div>

              {mode === 'work' && (
                <div className="mb-6">
                  <input
                    type="text"
                    value={currentTimer.currentGoal}
                    onChange={(e) => handleGoalChange(e.target.value)}
                    placeholder="What's your goal for this session Minami?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    disabled={currentTimer.isRunning}
                  />
                </div>
              )}

              <Timer
                minutes={minutes}
                seconds={seconds}
                isRunning={currentTimer.isRunning}
                onStart={handleStart}
                onPause={handlePause}
                onReset={() => resetTimer(mode)}
              />

              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
                {mode === 'work' ? 'Focus on your task' : 'Take a short break'}
                {mode === 'work' && breakTimer.isRunning && (
                  <p className="text-indigo-600 dark:text-indigo-400 mt-2 transition-colors">
                    Break timer running in background
                  </p>
                )}
                {mode === 'break' && workTimer.isRunning && (
                  <p className="text-indigo-600 dark:text-indigo-400 mt-2 transition-colors">
                    Work timer running in background
                  </p>
                )}
              </div>
            </>
          ) : (
            <History 
              sessions={sessions}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
            />
          )}
        </div>

        {activeTab === 'timer' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
            <div className="flex items-center justify-center mb-8">
              <ListTodo className="text-indigo-600 dark:text-indigo-400 mr-2 transition-colors" size={28} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
                To-do List
              </h2>
            </div>
            <TaskList
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 py-4">
        <div className="max-w-3xl mx-auto flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      <LinePopup show={showLinePopup} onClose={() => setShowLinePopup(false)} />
    </div>
  );
}

export default App;