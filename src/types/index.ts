export type SessionType = 'work' | 'break';
export type SessionStatus = 'active' | 'archived' | 'trashed';

export interface Session {
  id: string;
  type: SessionType;
  startTime: string;
  duration: number;
  goal?: string;
  archived?: boolean;
  deletedAt?: string;
  status: SessionStatus;
}

export interface TabProps {
  active: string;
  onChange: (tab: string) => void;
}

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  sessionStart: string | null;
  currentGoal: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}