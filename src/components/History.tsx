import React, { useState, useEffect } from 'react';
import { Clock, Brain, Coffee, Pencil, Trash2, X, Check, Archive, ArchiveRestore, ChevronDown, RotateCcw, Trash, CheckSquare } from 'lucide-react';
import type { Session, SessionStatus } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface EditingSession extends Session {
  newStartTime: string;
  newDuration: number;
  newGoal: string;
}

interface HistoryProps {
  sessions: Session[];
  onUpdateSession: (id: string, updates: Partial<Session>) => void;
  onDeleteSession: (id: string) => void;
}

const SESSIONS_PER_PAGE = 5;
const TRASH_RETENTION_DAYS = 30;
const LONG_PRESS_DURATION = 500;

export function History({ sessions, onUpdateSession, onDeleteSession }: HistoryProps) {
  const [editingSession, setEditingSession] = useState<EditingSession | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [viewStatus, setViewStatus] = useState<SessionStatus>('active');
  const [visibleSessions, setVisibleSessions] = useState(SESSIONS_PER_PAGE);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'restore' | 'delete' | 'bulk-delete' | 'permanent-delete' | 'archive' | 'bulk-archive';
    sessionId?: string;
  } | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  useEffect(() => {
    // Auto-delete sessions after 30 days
    const now = new Date();
    sessions.forEach(session => {
      if (session.status === 'trashed' && session.deletedAt) {
        const deletedAt = new Date(session.deletedAt);
        const daysSinceDelete = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceDelete >= TRASH_RETENTION_DAYS) {
          onDeleteSession(session.id);
        }
      }
    });
  }, [sessions, onDeleteSession]);

  const filteredSessions = sessions.filter(session => session.status === viewStatus);
  const hasMoreSessions = visibleSessions < filteredSessions.length;

  const handleLoadMore = () => {
    setVisibleSessions(prev => prev + SESSIONS_PER_PAGE);
  };

  const handleToggleSelect = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSessions.size === filteredSessions.slice(0, visibleSessions).length) {
      setSelectedSessions(new Set());
    } else {
      const newSelected = new Set(filteredSessions.slice(0, visibleSessions).map(s => s.id));
      setSelectedSessions(newSelected);
    }
  };

  const handleBulkAction = (action: 'archive' | 'trash' | 'restore') => {
    selectedSessions.forEach(id => {
      switch (action) {
        case 'archive':
          onUpdateSession(id, { status: 'archived' });
          break;
        case 'trash':
          onUpdateSession(id, { 
            status: 'trashed',
            deletedAt: new Date().toISOString()
          });
          break;
        case 'restore':
          onUpdateSession(id, { 
            status: 'active',
            deletedAt: undefined
          });
          break;
      }
    });
    setSelectedSessions(new Set());
    setSelectionMode(false);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case 'restore':
        if (pendingAction.sessionId) {
          onUpdateSession(pendingAction.sessionId, { 
            status: 'active',
            deletedAt: undefined
          });
        }
        break;
      case 'delete':
        if (pendingAction.sessionId) {
          onUpdateSession(pendingAction.sessionId, {
            status: 'trashed',
            deletedAt: new Date().toISOString()
          });
        }
        break;
      case 'archive':
      case 'bulk-archive':
        if (pendingAction.sessionId) {
          onUpdateSession(pendingAction.sessionId, { status: 'archived' });
        } else {
          handleBulkAction('archive');
        }
        break;
      case 'permanent-delete':
        if (pendingAction.sessionId) {
          onDeleteSession(pendingAction.sessionId);
        }
        break;
      case 'bulk-delete':
        selectedSessions.forEach(id => {
          onDeleteSession(id);
        });
        setSelectedSessions(new Set());
        setSelectionMode(false);
        break;
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const getRemainingDays = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt);
    const now = new Date();
    const daysSinceDelete = Math.floor((now.getTime() - deleteDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRASH_RETENTION_DAYS - daysSinceDelete);
  };

  const handleTouchStart = (sessionId: string) => {
    setTouchStartTime(Date.now());
    const timer = window.setTimeout(() => {
      setSelectionMode(true);
      handleToggleSelect(sessionId);
    }, LONG_PRESS_DURATION);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseDown = (sessionId: string) => {
    setTouchStartTime(Date.now());
    const timer = window.setTimeout(() => {
      setSelectionMode(true);
      handleToggleSelect(sessionId);
    }, LONG_PRESS_DURATION);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto text-gray-400 dark:text-gray-500" size={32} />
        <p className="text-gray-500 dark:text-gray-400">No sessions completed yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectionMode && selectedSessions.size === 0 && (
        <div className="flex items-center justify-center mb-6 gap-2">
          <button
            onClick={() => setViewStatus('active')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewStatus === 'active'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Clock size={16} />
            Active
          </button>
          <button
            onClick={() => setViewStatus('archived')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewStatus === 'archived'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Archive size={16} />
            Archived
          </button>
          <button
            onClick={() => setViewStatus('trashed')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewStatus === 'trashed'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Trash size={16} />
            Trash
          </button>
        </div>
      )}

      {(selectionMode || selectedSessions.size > 0) && (
        <div className="flex flex-col items-center gap-3 mb-6">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <CheckSquare size={16} />
            {selectedSessions.size === filteredSessions.slice(0, visibleSessions).length
              ? 'Deselect All'
              : 'Select All'}
          </button>

          <div className="flex items-center gap-3">
            {viewStatus === 'active' && (
              <button
                onClick={() => {
                  setPendingAction({ type: 'bulk-archive' });
                  setShowConfirmDialog(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
              >
                <Archive size={16} />
                Move to Archive ({selectedSessions.size} selected)
              </button>
            )}
            {viewStatus === 'archived' && (
              <button
                onClick={() => handleBulkAction('restore')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw size={16} />
                Restore ({selectedSessions.size})
              </button>
            )}
            {viewStatus !== 'trashed' && (
              <button
                onClick={() => handleBulkAction('trash')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                <Trash2 size={16} />
                Move to Trash ({selectedSessions.size} selected)
              </button>
            )}
            {viewStatus === 'trashed' && (
              <button
                onClick={() => {
                  setPendingAction({ type: 'bulk-delete' });
                  setShowConfirmDialog(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                <Trash2 size={16} />
                Delete Permanently ({selectedSessions.size})
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filteredSessions.slice(0, visibleSessions).map((session) => (
          <div
            key={session.id}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            onTouchStart={() => handleTouchStart(session.id)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onMouseDown={() => handleMouseDown(session.id)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {editingSession?.id === session.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {session.type === 'work' ? (
                    <Brain className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                  ) : (
                    <Coffee className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                  )}
                  <input
                    type="datetime-local"
                    value={editingSession.newStartTime}
                    onChange={(e) => setEditingSession({
                      ...editingSession,
                      newStartTime: e.target.value
                    })}
                    className="flex-1 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={editingSession.newDuration}
                    onChange={(e) => setEditingSession({
                      ...editingSession,
                      newDuration: parseInt(e.target.value) || 0
                    })}
                    min="1"
                    className="w-20 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                  <span className="text-gray-600 dark:text-gray-300">minutes</span>
                </div>
                <input
                  type="text"
                  value={editingSession.newGoal}
                  onChange={(e) => setEditingSession({
                    ...editingSession,
                    newGoal: e.target.value
                  })}
                  placeholder="What was your goal for this session?"
                  className="w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingSession(null)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={() => {
                      if (editingSession) {
                        onUpdateSession(editingSession.id, {
                          startTime: new Date(editingSession.newStartTime).toISOString(),
                          duration: editingSession.newDuration * 60,
                          goal: editingSession.newGoal
                        });
                        setEditingSession(null);
                      }
                    }}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Check size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                {(selectionMode || selectedSessions.size > 0) && (
                  <input
                    type="checkbox"
                    checked={selectedSessions.has(session.id)}
                    onChange={() => handleToggleSelect(session.id)}
                    className="mt-1.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                )}
                <div className={`flex-1 min-w-0 ${(selectionMode || selectedSessions.size > 0) ? 'ml-3' : ''}`}>
                  <div className="flex items-center gap-3">
                    {session.type === 'work' ? (
                      <Brain className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                    ) : (
                      <Coffee className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {session.type === 'work' ? 'Work Session' : 'Break Session'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {session.goal && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 ml-9 break-words whitespace-pre-wrap pr-2">
                      Goal: {session.goal}
                    </p>
                  )}
                  {session.status === 'trashed' && session.deletedAt && (
                    <p className="mt-2 text-red-500 dark:text-red-400 text-sm ml-9">
                      Will be permanently deleted in {getRemainingDays(session.deletedAt)} days
                    </p>
                  )}
                </div>
                {!selectionMode && selectedSessions.size === 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                      {Math.floor(session.duration / 60)} min
                    </span>
                    {viewStatus === 'active' && (
                      <>
                        <button
                          onClick={() => setEditingSession({
                            ...session,
                            newStartTime: new Date(session.startTime).toISOString().slice(0, 16),
                            newDuration: session.duration / 60,
                            newGoal: session.goal || ''
                          })}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          aria-label="Edit session"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPendingAction({ type: 'archive', sessionId: session.id });
                            setShowConfirmDialog(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          aria-label="Archive session"
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPendingAction({ type: 'delete', sessionId: session.id });
                            setShowConfirmDialog(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label="Move to trash"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {viewStatus === 'archived' && (
                      <>
                        <button
                          onClick={() => {
                            setPendingAction({ type: 'restore', sessionId: session.id });
                            setShowConfirmDialog(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          aria-label="Restore session"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPendingAction({ type: 'delete', sessionId: session.id });
                            setShowConfirmDialog(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label="Move to trash"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {viewStatus === 'trashed' && (
                      <>
                        <button
                          onClick={() => {
                            setPendingAction({ type: 'restore', sessionId: session.id });
                            setShowConfirmDialog(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          aria-label="Restore session"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPendingAction({ type: 'permanent-delete', sessionId: session.id });
                            setShowConfirmDialog(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMoreSessions && (
        <button
          onClick={handleLoadMore}
          className="w-full mt-4 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <ChevronDown size={16} />
          Show More
        </button>
      )}

      {!hasMoreSessions && filteredSessions.length > SESSIONS_PER_PAGE && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          No more sessions available
        </p>
      )}

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          pendingAction?.type === 'restore'
            ? 'Restore Session'
            : pendingAction?.type === 'permanent-delete'
            ? 'Delete Permanently'
            : pendingAction?.type === 'bulk-delete'
            ? 'Delete Selected Sessions'
            : pendingAction?.type === 'archive' || pendingAction?.type === 'bulk-archive'
            ? 'Archive Session'
            : 'Move to Trash'
        }
        message={
          pendingAction?.type === 'restore'
            ? 'Are you sure you want to restore this session?'
            : pendingAction?.type === 'permanent-delete'
            ? 'This action cannot be undone. Are you sure you want to permanently delete this session?'
            : pendingAction?.type === 'bulk-delete'
            ? 'This action cannot be undone. Are you sure you want to permanently delete the selected sessions?'
            : pendingAction?.type === 'archive' || pendingAction?.type === 'bulk-archive'
            ? 'Are you sure you want to archive the selected session(s)?'
            : 'Are you sure you want to move this session to trash?'
        }
        confirmText={
          pendingAction?.type === 'restore'
            ? 'Restore'
            : pendingAction?.type === 'permanent-delete' || pendingAction?.type === 'bulk-delete'
            ? 'Delete Permanently'
            : pendingAction?.type === 'archive' || pendingAction?.type === 'bulk-archive'
            ? 'Archive'
            : 'Move to Trash'
        }
        confirmColor={
          pendingAction?.type === 'restore' || pendingAction?.type === 'archive' || pendingAction?.type === 'bulk-archive'
            ? 'indigo'
            : 'red'
        }
      />
    </div>
  );
}