class TimerManager {
  constructor(workerPath = '/shared-timer-worker.js') {
    this.worker = null;
    this.workerPath = workerPath;
    this.callbacks = new Map();
    this.isConnected = false;
    this.init();
  }

  init() {
    try {
      this.worker = new SharedWorker(this.workerPath);
      this.worker.port.start();
      
      this.worker.port.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.port.onerror = (error) => {
        console.error('SharedWorker error:', error);
      };

      this.isConnected = true;
    } catch (error) {
      console.error('Failed to initialize SharedWorker:', error);
      throw new Error('SharedWorker not supported or failed to initialize');
    }
  }

  handleWorkerMessage(data) {
    const { action, taskName, timestamp } = data;

    switch (action) {
      case 'TIMER_TICK':
        const callback = this.callbacks.get(taskName);
        if (callback) {
          callback(taskName, timestamp);
        }
        break;
      case 'TASK_CLEARED':
        // Optionally handle task cleared event
        break;
      case 'ALL_TASKS_CLEARED':
        this.callbacks.clear();
        break;
    }
  }

  /**
   * Add a timer task
   * @param {string} taskName - Unique name for the task
   * @param {number} intervalTime - Interval in milliseconds
   * @param {Function} callback - Function to call on each interval
   * @param {boolean} canRepeat - Whether the task should repeat (default: true)
   */
  addTimerTask(taskName, intervalTime, callback, canRepeat = true) {
    if (!this.isConnected) {
      throw new Error('TimerManager is not connected to SharedWorker');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (typeof intervalTime !== 'number' || intervalTime <= 0) {
      throw new Error('Interval time must be a positive number');
    }

    // Store the callback
    this.callbacks.set(taskName, callback);

    // Send message to worker
    this.worker.port.postMessage({
      action: 'ADD_TASK',
      taskName,
      intervalTime,
      canRepeat
    });
  }

  /**
   * Clear a specific timer task
   * @param {string} taskName - Name of the task to clear
   */
  clearTimerTask(taskName) {
    if (!this.isConnected) {
      throw new Error('TimerManager is not connected to SharedWorker');
    }

    this.callbacks.delete(taskName);
    this.worker.port.postMessage({
      action: 'CLEAR_TASK',
      taskName
    });
  }

  /**
   * Remove all timer tasks
   */
  removeAllTimerTasks() {
    if (!this.isConnected) {
      throw new Error('TimerManager is not connected to SharedWorker');
    }

    this.callbacks.clear();
    this.worker.port.postMessage({
      action: 'REMOVE_ALL'
    });
  }

  /**
   * Check if worker is connected
   * @param {string} taskName - Optional task name for ping
   * @returns {boolean} Connection status
   */
  ping(taskName = 'health-check') {
    if (!this.isConnected) {
      return false;
    }

    this.worker.port.postMessage({
      action: 'PING',
      taskName
    });
    return true;
  }

  /**
   * Get list of active task names
   * @returns {Array<string>} Array of task names
   */
  getActiveTasks() {
    return Array.from(this.callbacks.keys());
  }

  /**
   * Check if a task exists
   * @param {string} taskName - Name of the task
   * @returns {boolean} Whether the task exists
   */
  hasTask(taskName) {
    return this.callbacks.has(taskName);
  }
}

// Also support CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimerManager;
}

export { TimerManager as default };
//# sourceMappingURL=timer-manager.esm.js.map
