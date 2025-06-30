# @petit-kit/magasin

A lightweight, reactive state management library with plugin support and automatic dependency tracking.

## Features

- 🚀 **Lightweight** - Minimal footprint with zero external dependencies
- 🔄 **Reactive** - Automatic updates when state changes
- 🔌 **Plugin System** - Extensible with custom plugins
- 📦 **Persistence** - Built-in localStorage plugin
- 🎯 **Dependency Tracking** - Automatic updates based on dependencies
- 🎨 **TypeScript** - Full TypeScript support
- 🌐 **Universal** - Works in browser and Node.js environments

## Installation

```bash
npm install @petit-kit/magasin
```

## Quick Start

```javascript
import magasin from '@petit-kit/magasin';

// Set a value
magasin.set('user', { name: 'John', age: 30 });

// Get a value
const user = magasin.get('user');

// Subscribe to changes
const unsubscribe = magasin.subscribe('user', (user) => {
  console.log('User updated:', user);
});

// Create a reactive reference
const userRef = magasin.ref('user');
userRef.set({ name: 'Jane', age: 25 });
```

## API Reference

### Core Methods

#### `magasin.set(key, value, deps?)`
Sets a value in the store. Supports functions, promises, and dependency tracking.

```javascript
// Simple value
magasin.set('count', 42);

// Function value
magasin.set('doubleCount', (current) => current * 2);

// With dependencies
magasin.set('fullName', (current) => `${firstName} ${lastName}`, ['firstName', 'lastName']);

// Promise support
magasin.set('userData', fetch('/api/user').then(r => r.json()));
```

#### `magasin.get(key)`
Retrieves a value from the store.

```javascript
const value = magasin.get('count');
const allStore = magasin.get(); // Returns entire store
```

#### `magasin.ref(key)`
Creates a reactive reference object with get, set, and subscribe methods.

```javascript
const countRef = magasin.ref('count');

// Get current value
const current = countRef.get();

// Set new value
countRef.set(100);

// Subscribe to changes
const unsubscribe = countRef.subscribe((value) => {
  console.log('Count changed:', value);
});
```

#### `magasin.subscribe(key, callback, broadcast?)`
Subscribes to changes for a specific key.

```javascript
const unsubscribe = magasin.subscribe('user', (user) => {
  console.log('User changed:', user);
}, true); // broadcast = true (default) calls callback immediately with current value
```

#### `magasin.default(key, value)`
Sets a default value that will be used when the key doesn't exist.

```javascript
magasin.default('theme', 'dark');
magasin.default('language', 'en');
```

#### `magasin.clear(key?)`
Clears specific key or entire store.

```javascript
magasin.clear('user'); // Clear specific key
magasin.clear(); // Clear entire store
```

#### `magasin.reset()`
Resets the store to default values.

```javascript
magasin.reset();
```

#### `magasin.broadcast(key?)`
Manually triggers subscriptions for a key or all keys.

```javascript
magasin.broadcast('user'); // Broadcast specific key
magasin.broadcast(); // Broadcast all keys
```

### Plugin System

Magasin supports plugins for extending functionality. Plugins are initialized when creating a new Magasin instance.

```javascript
import { Magasin } from '@petit-kit/magasin';
import localStoragePlugin from '@petit-kit/magasin/localStorage';

const store = new Magasin({
  id: 'my-app',
  plugins: [localStoragePlugin]
});
```

#### Built-in Plugins

##### localStorage Plugin
Automatically persists store data to localStorage.

```javascript
import { Magasin, localStorage } from '@petit-kit/magasin';

const store = new Magasin({
  id: 'my-app',
  plugins: [localStorage]
});

// Data is automatically saved to localStorage
store.set('user', { name: 'John' });

// Data is automatically loaded from localStorage on init
```

Plugin options:
- `id` - Storage key for localStorage
- `autoSave` - Automatically save on every set (default: true)

## Advanced Usage

### Dependency Tracking

Magasin automatically tracks dependencies and updates computed values when dependencies change.

```javascript
// Set base values
magasin.set('firstName', 'John');
magasin.set('lastName', 'Doe');

// Set computed value with dependencies
magasin.set('fullName', (current) => {
  const firstName = magasin.get('firstName');
  const lastName = magasin.get('lastName');
  return `${firstName} ${lastName}`;
}, ['firstName', 'lastName']);

// When firstName changes, fullName automatically updates
magasin.set('firstName', 'Jane');
// fullName is now "Jane Doe"
```

### Function Values

You can use functions as values, which will be executed with the current value.

```javascript
magasin.set('count', 5);
magasin.set('doubleCount', (current) => current * 2);
// doubleCount is now 10

magasin.set('count', 8);
// doubleCount automatically becomes 16
```

### Promise Support

Magasin handles promises automatically.

```javascript
magasin.set('userData', fetch('/api/user').then(r => r.json()));

// Subscribe to get the resolved value
magasin.subscribe('userData', (data) => {
  console.log('User data loaded:', data);
});
```

### Custom Plugins

Create custom plugins by implementing the plugin interface.

```javascript
const customPlugin = (magasin, settings) => {
  return {
    init: () => {
      // Initialize plugin
      console.log('Plugin initialized');
    },
    set: (key, value) => {
      // Called when a value is set
      console.log(`Setting ${key}:`, value);
    },
    clear: () => {
      // Called when store is cleared
      console.log('Store cleared');
    },
    reset: () => {
      // Called when store is reset
      console.log('Store reset');
    }
  };
};

const store = new Magasin({
  plugins: [customPlugin]
});
```

## Examples

### Todo App

```javascript
import magasin from '@petit-kit/magasin';

// Initialize with defaults
magasin.default('todos', []);
magasin.default('filter', 'all');

// Add todo
magasin.set('todos', (current) => [
  ...current,
  { id: Date.now(), text: 'New todo', completed: false }
]);

// Toggle todo
magasin.set('todos', (current) =>
  current.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  )
);

// Computed filtered todos
magasin.set('filteredTodos', (current) => {
  const todos = magasin.get('todos');
  const filter = magasin.get('filter');
  
  switch (filter) {
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'active':
      return todos.filter(todo => !todo.completed);
    default:
      return todos;
  }
}, ['todos', 'filter']);

// Subscribe to changes
magasin.subscribe('filteredTodos', (todos) => {
  renderTodos(todos);
});
```

### Form State Management

```javascript
import magasin from '@petit-kit/magasin';

// Form fields
magasin.set('form.email', '');
magasin.set('form.password', '');
magasin.set('form.confirmPassword', '');

// Validation
magasin.set('form.isValid', (current) => {
  const email = magasin.get('form.email');
  const password = magasin.get('form.password');
  const confirmPassword = magasin.get('form.confirmPassword');
  
  return email.includes('@') && 
         password.length >= 8 && 
         password === confirmPassword;
}, ['form.email', 'form.password', 'form.confirmPassword']);

// Subscribe to validation changes
magasin.subscribe('form.isValid', (isValid) => {
  submitButton.disabled = !isValid;
});
```

## License

MIT © [@petitssoldats](https://github.com/petitssoldats)
