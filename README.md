# Shared Timer Manager

Manage multiple timer tasks with a single SharedWebWorker. Perfect for handling recurring tasks like token refresh, inactivity detection, and sleep mode across your application.

## Features

- ✅ **Single SharedWebWorker** - All timers run in one worker, reducing overhead
- ✅ **Named Task Management** - Easy to manage with unique task identifiers
- ✅ **Repeating & One-time Tasks** - Flexible timer control
- ✅ **Cross-tab Synchronization** - Shared timers across browser tabs
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Zero Dependencies** - Lightweight and fast
- ✅ **Framework Agnostic** - Works with React, Vue, Angular, Svelte, and vanilla JS

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

// Clear a specific task
timerManager.clearTimerTask('token-refresh');

// Remove all tasks
timerManager.removeAllTimerTasks();
```

## API Reference

### Constructor

#### `new TimerManager(workerPath)`

Creates a new TimerManager instance.

**Parameters:**
- `workerPath` (string, optional): Path to the shared worker file. Default: `'/shared-timer-worker.js'`

**Example:**
```javascript
const timerManager = new TimerManager('/workers/shared-timer-worker.js');
```

---

### Methods

#### `addTimerTask(taskName, intervalTime, callback, canRepeat)`

Adds a new timer task.

**Parameters:**
- `taskName` (string): Unique identifier for the task
- `intervalTime` (number): Interval in milliseconds
- `callback` (function): Function to execute on each interval. Receives `(taskName, timestamp)` as arguments
- `canRepeat` (boolean, optional): Whether the task should repeat. Default: `true`

**Example:**
```javascript
timerManager.addTimerTask('my-task', 5000, (name, timestamp) => {
  console.log(`${name} executed at ${timestamp}`);
}, true);
```

---

#### `clearTimerTask(taskName)`

Clears a specific timer task.

**Parameters:**
- `taskName` (string): Name of the task to clear

**Example:**
```javascript
timerManager.clearTimerTask('my-task');
```

---

#### `removeAllTimerTasks()`

Removes all timer tasks.

**Example:**
```javascript
timerManager.removeAllTimerTasks();
```

---

#### `hasTask(taskName)`

Check if a task exists.

**Parameters:**
- `taskName` (string): Name of the task

**Returns:**
- `boolean`: Whether the task exists

**Example:**
```javascript
if (timerManager.hasTask('token-refresh')) {
  console.log('Token refresh task is active');
}
```

---

#### `getActiveTasks()`

Get list of active task names.

**Returns:**
- `Array<string>`: Array of active task names

**Example:**
```javascript
const tasks = timerManager.getActiveTasks();
console.log('Active tasks:', tasks); // ['token-refresh', 'inactivity-logout']
```

---

#### `ping(taskName)`

Check if the worker is connected (health check).

**Parameters:**
- `taskName` (string, optional): Task name for ping. Default: `'health-check'`

**Returns:**
- `boolean`: Connection status

**Example:**
```javascript
const isConnected = timerManager.ping();
```

---

## Common Use Cases

### Access Token Refresh

Automatically refresh authentication tokens at regular intervals:

```javascript
timerManager.addTimerTask(
  'token-refresh',
  15 * 60 * 1000, // Every 15 minutes
  async () => {
    try {
      await refreshAccessToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  },
  true
);
```

### Inactivity Logout

Log out users after a period of inactivity:

```javascript
function setupInactivityTimer() {
  timerManager.addTimerTask(
    'inactivity-logout',
    5 * 60 * 1000, // 5 minutes
    () => {
      console.log('User inactive - logging out');
      logout();
    },
    false
  );
}

// Reset timer on user activity
const resetTimer = () => {
  timerManager.clearTimerTask('inactivity-logout');
  setupInactivityTimer();
};

document.addEventListener('mousemove', resetTimer);
document.addEventListener('keydown', resetTimer);
document.addEventListener('click', resetTimer);

// Initialize
setupInactivityTimer();
```

### Sleep Mode

Reduce backend requests after inactivity:

```javascript
function setupSleepMode() {
  timerManager.addTimerTask(
    'sleep-mode',
    5 * 60 * 1000, // 5 minutes
    () => {
      console.log('Activating sleep mode');
      activateSleepMode();
      // Stop non-critical API polling
      stopBackgroundSync();
    },
    false
  );
}

// Reset on user activity
const resetSleepMode = () => {
  if (timerManager.hasTask('sleep-mode')) {
    timerManager.clearTimerTask('sleep-mode');
    deactivateSleepMode();
    setupSleepMode();
  }
};

window.addEventListener('focus', resetSleepMode);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    resetSleepMode();
  }
});

setupSleepMode();
```

---

## Framework Integration

### React

Create a custom hook for easy integration:

```javascript
// hooks/useTimerManager.js
import { useEffect, useRef } from 'react';
import TimerManager from 'shared-timer-manager';

export function useTimerManager() {
  const timerManagerRef = useRef(null);

  useEffect(() => {
    timerManagerRef.current = new TimerManager('/shared-timer-worker.js');

    return () => {
      timerManagerRef.current?.removeAllTimerTasks();
    };
  }, []);

  return timerManagerRef.current;
}

// Usage in component
function App() {
  const timerManager = useTimerManager();

  useEffect(() => {
    if (timerManager) {
      timerManager.addTimerTask('token-refresh', 15 * 60 * 1000, () => {
        refreshToken();
      }, true);
    }
  }, [timerManager]);

  return <div>My App</div>;
}
```

### Vue 3 (Composition API)

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
    addTask: (name, interval, callback, repeat = true) => 
      timerManager.addTimerTask(name, interval, callback, repeat),
    clearTask: (name) => timerManager.clearTimerTask(name),
    removeAll: () => timerManager.removeAllTimerTasks(),
    hasTask: (name) => timerManager.hasTask(name),
    getActiveTasks: () => timerManager.getActiveTasks()
  };
}

// Usage in component
<script setup>
import { onMounted } from 'vue';
import { useTimerManager } from '@/composables/useTimerManager';

const { addTask, clearTask } = useTimerManager();

onMounted(() => {
  addTask('token-refresh', 15 * 60 * 1000, () => {
    console.log('Refreshing token...');
  });
});
</script>
```

### Angular

```typescript
// services/timer-manager.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import TimerManager from 'shared-timer-manager';

@Injectable({
  providedIn: 'root'
})
export class TimerManagerService implements OnDestroy {
  private timerManager: TimerManager;

  constructor() {
    this.timerManager = new TimerManager('/shared-timer-worker.js');
  }

  addTask(name: string, interval: number, callback: Function, repeat = true): void {
    this.timerManager.addTimerTask(name, interval, callback as any, repeat);
  }

  clearTask(name: string): void {
    this.timerManager.clearTimerTask(name);
  }

  removeAllTasks(): void {
    this.timerManager.removeAllTimerTasks();
  }

  hasTask(name: string): boolean {
    return this.timerManager.hasTask(name);
  }

  getActiveTasks(): string[] {
    return this.timerManager.getActiveTasks();
  }

  ngOnDestroy(): void {
    this.timerManager.removeAllTimerTasks();
  }
}

// Usage in component
export class AppComponent {
  constructor(private timerService: TimerManagerService) {
    this.timerService.addTask('token-refresh', 15 * 60 * 1000, () => {
      console.log('Refreshing token...');
    }, true);
  }
}
```

### Svelte

```javascript
// stores/timerStore.js
import { onDestroy } from 'svelte';
import TimerManager from 'shared-timer-manager';

const timerManager = new TimerManager('/shared-timer-worker.js');

export function useTimer() {
  onDestroy(() => {
    timerManager.removeAllTimerTasks();
  });

  return timerManager;
}

// Usage in component
<script>
  import { onMount } from 'svelte';
  import { useTimer } from './stores/timerStore';
  
  const timer = useTimer();
  
  onMount(() => {
    timer.addTimerTask('my-task', 5000, () => {
      console.log('Timer tick!');
    }, true);
  });
</script>
```

### Vanilla JavaScript

```javascript
import TimerManager from 'shared-timer-manager';

const timerManager = new TimerManager('/shared-timer-worker.js');

// Add tasks
timerManager.addTimerTask('periodic-sync', 30000, () => {
  syncData();
}, true);

// Clear when needed
document.getElementById('stop-btn').addEventListener('click', () => {
  timerManager.clearTimerTask('periodic-sync');
});
```

---

## Browser Support

SharedWebWorker is supported in:
- ✅ Chrome/Edge 4+
- ✅ Firefox 29+
- ✅ Safari 16+
- ❌ Internet Explorer (not supported)

**Note:** For browsers that don't support SharedWebWorker, consider implementing a fallback using regular `setInterval` or Web Workers.

---

## TypeScript Support

This package includes TypeScript definitions. No additional types package needed!

```typescript
import TimerManager from 'shared-timer-manager';

const timerManager: TimerManager = new TimerManager('/shared-timer-worker.js');

timerManager.addTimerTask(
  'my-task',
  5000,
  (taskName: string, timestamp: number) => {
    console.log(`Task ${taskName} executed at ${timestamp}`);
  },
  true
);
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT © [Dario Espina]

---

## Support

If you encounter any issues or have questions:
- 📝 [Open an issue](https://github.com/dariusve/shared-timer-manager/issues)
- 💬 [Start a discussion](https://github.com/dariusve/shared-timer-manager/discussions)

---

## Changelog

### 1.0.0
- Initial release
- Support for multiple timer tasks with single SharedWebWorker
- Cross-tab synchronization
- TypeScript support
- Framework-agnostic implementation