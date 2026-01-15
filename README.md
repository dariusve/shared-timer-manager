# Shared Timer Manager

Manage multiple timer tasks with a single SharedWebWorker. Perfect for Vue, React, or vanilla JavaScript applications.

## Features

- ✅ Single SharedWebWorker for all timers
- ✅ Named task management
- ✅ Repeating and one-time tasks
- ✅ Cross-tab synchronization
- ✅ TypeScript support
- ✅ Zero dependencies

## Installation

```bash
npm install shared-timer-manager
```

## Quick Start

### 1. Copy the worker file to your public directory

```bash
cp node_modules/shared-timer-manager/dist/shared-timer-worker.js public/
```

### 2. Use in your application

```javascript
import TimerManager from 'shared-timer-manager';

// Initialize
const timerManager = new TimerManager('/shared-timer-worker.js');

// Add a repeating task
timerManager.addTimerTask(
  'token-refresh',
  15 * 60 * 1000, // 15 minutes
  () => {
    console.log('Refreshing token...');
    refreshToken();
  },
  true // repeats
);

// Add a one-time task
timerManager.addTimerTask(
  'inactivity-logout',
  5 * 60 * 1000, // 5 minutes
  () => {
    console.log('Logging out due to inactivity');
    logout();
  },
  false // doesn't repeat
);

// Clear a task
timerManager.clearTimerTask('token-refresh');

// Remove all tasks
timerManager.removeAllTimerTasks();
```

## API Reference

### `new TimerManager(workerPath)`

Creates a new TimerManager instance.

- **workerPath** (string): Path to the shared worker file (default: '/shared-timer-worker.js')

### `addTimerTask(taskName, intervalTime, callback, canRepeat)`

Adds a new timer task.

- **taskName** (string): Unique identifier for the task
- **intervalTime** (number): Interval in milliseconds
- **callback** (function): Function to execute on each interval
- **canRepeat** (boolean): Whether the task should repeat (default: true)

### `clearTimerTask(taskName)`

Clears a specific timer task.

- **taskName** (string): Name of the task to clear

### `removeAllTimerTasks()`

Removes all timer tasks.

### `hasTask(taskName)`

Check if a task exists.

- **taskName** (string): Name of the task
- **Returns** (boolean): Whether the task exists

### `getActiveTasks()`

Get list of active task names.

- **Returns** (Array<string>): Array of task names

## Use Cases

### Access Token Refresh
```javascript
timerManager.addTimerTask('token-refresh', 15 * 60 * 1000, refreshToken, true);
```

### Inactivity Logout
```javascript
function setupInactivityTimer() {
  timerManager.addTimerTask('inactivity', 5 * 60 * 1000, logout, false);
}

// Reset on user activity
document.addEventListener('mousemove', () => {
  timerManager.clearTimerTask('inactivity');
  setupInactivityTimer();
});
```

### Sleep Mode
```javascript
timerManager.addTimerTask('sleep-mode', 5 * 60 * 1000, activateSleepMode, false);
```

## Vue.js Example

```javascript
// composables/useTimerManager.js
import { onUnmounted } from 'vue';
import TimerManager from 'shared-timer-manager';

const timerManager = new TimerManager('/shared-timer-worker.js');

export function useTimerManager() {
  onUnmounted(() => {
    timerManager.removeAllTimerTasks();
  });

  return {
    addTask: timerManager.addTimerTask.bind(timerManager),
    clearTask: timerManager.clearTimerTask.bind(timerManager),
    removeAll: timerManager.removeAllTimerTasks.bind(timerManager)
  };
}
```

## Browser Support

SharedWebWorker is supported in:
- Chrome/Edge 4+
- Firefox 29+
- Safari 16+

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
