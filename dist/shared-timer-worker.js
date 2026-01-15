(function () {
  'use strict';

  const tasks = new Map();
  const ports = new Set();

  self.onconnect = (e) => {
    const port = e.ports[0];
    ports.add(port);

    port.onmessage = (event) => {
      const { action, taskName, intervalTime, canRepeat } = event.data;

      switch (action) {
        case 'ADD_TASK':
          addTask(taskName, intervalTime, canRepeat);
          break;
        case 'CLEAR_TASK':
          clearTask(taskName);
          break;
        case 'REMOVE_ALL':
          removeAllTasks();
          break;
        case 'PING':
          port.postMessage({ action: 'PONG', taskName });
          break;
      }
    };

    port.start();
  };

  function addTask(taskName, intervalTime, canRepeat) {
    // Clear existing task if it exists
    if (tasks.has(taskName)) {
      clearInterval(tasks.get(taskName).timerId);
    }

    const timerId = setInterval(() => {
      // Notify all connected ports
      ports.forEach(port => {
        port.postMessage({
          action: 'TIMER_TICK',
          taskName,
          timestamp: Date.now()
        });
      });

      // If not repeating, clear after first execution
      if (!canRepeat) {
        clearTask(taskName);
      }
    }, intervalTime);

    tasks.set(taskName, { timerId, intervalTime, canRepeat });
  }

  function clearTask(taskName) {
    const task = tasks.get(taskName);
    if (task) {
      clearInterval(task.timerId);
      tasks.delete(taskName);
      
      // Notify all ports that task was cleared
      ports.forEach(port => {
        port.postMessage({
          action: 'TASK_CLEARED',
          taskName
        });
      });
    }
  }

  function removeAllTasks() {
    tasks.forEach((task, taskName) => {
      clearInterval(task.timerId);
    });
    tasks.clear();
    
    // Notify all ports
    ports.forEach(port => {
      port.postMessage({
        action: 'ALL_TASKS_CLEARED'
      });
    });
  }

  // ============================================
  // timer-manager.js
  // This is the main package file

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

        this.worker.onerror = (error) => {
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
     * @param {boolean} canRepeat - Whether the task should repeat
     */
    addTimerTask(taskName, intervalTime, callback, canRepeat = true) {
      if (!this.isConnected) {
        throw new Error('TimerManager is not connected to SharedWorker');
      }

      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
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
  }

  // Also support CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerManager;
  }

  return TimerManager;

})();
//# sourceMappingURL=shared-timer-worker.js.map
