
export enum BotState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  FINISHED = 'FINISHED',
}

export enum LogType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARN = 'WARN',
  ERROR = 'ERROR',
  ACTION = 'ACTION',
}

export interface LogEntry {
  id: number;
  type: LogType;
  message: string;
  timestamp: string;
}

export interface Post {
  id: number;
  author: string;
  title: string;
  avatarUrl: string;
  liked: boolean;
  isProcessing: boolean;
}
