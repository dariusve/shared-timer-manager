declare class TimerManager {
  constructor(workerPath?: string);
  
  addTimerTask(
    taskName: string,
    intervalTime: number,
    callback: (taskName: string, timestamp: number) => void,
    canRepeat?: boolean
  ): void;
  
  clearTimerTask(taskName: string): void;
  
  removeAllTimerTasks(): void;
  
  ping(taskName?: string): boolean;
  
  getActiveTasks(): string[];
  
  hasTask(taskName: string): boolean;
}

export default TimerManager;