# 📁 Frontend Source Code

> Main source directory for the Sentiment Aura React application

## 📋 Overview

This directory contains all the source code for the Sentiment Aura frontend application. The code is organized into logical subdirectories for components, hooks, utilities, and styles.

## 🎯 Entry Point

**`App.jsx`** - The main component that orchestrates all functionality:
- Manages global application state
- Coordinates data flow between components
- Handles WebSocket connections for audio streaming
- Processes sentiment analysis responses
- Controls the overall layout and component rendering

## 📂 Directory Structure

```
src/
├── App.jsx              # Main application component
├── index.js             # React DOM render entry
├── components/          # Reusable UI components
│   ├── TranscriptDisplay.jsx
│   ├── KeywordsDisplay.jsx
│   ├── Controls.jsx
│   └── AuraVisualization.jsx
├── hooks/              # Custom React hooks
│   ├── useDeepgram.js
│   ├── useAudioCapture.js
│   └── useSentimentProcessor.js
├── utils/              # Helper functions
│   └── audioUtils.js
└── styles/            # CSS modules and global styles
    └── App.css
```

## 🧩 Component Responsibilities

### UI Components (`components/`)
- **Visual presentation** of data
- **User interaction** handling
- **Animation** and transitions
- **Responsive design** implementation

### Custom Hooks (`hooks/`)
- **State management** for specific features
- **Side effect** handling (API calls, WebSocket)
- **Data transformation** and processing
- **Reusable logic** extraction

### Utilities (`utils/`)
- **Audio processing** functions
- **Data formatting** helpers
- **Validation** utilities
- **Constants** and configuration

### Styles (`styles/`)
- **Global styles** and resets
- **Theme variables** (colors, spacing)
- **Animation keyframes**
- **Responsive breakpoints**

## 🔄 Data Flow Architecture

```
User Input (Microphone)
    ↓
useAudioCapture (hook)
    ↓
useDeepgram (WebSocket)
    ↓
TranscriptDisplay (component)
    ↓
useSentimentProcessor (API call)
    ↓
KeywordsDisplay + AuraVisualization
```

## 🎨 Component Communication

Components communicate through:
1. **Props** - Parent to child data passing
2. **Callbacks** - Child to parent event handling
3. **Context** - Global state when needed
4. **Hooks** - Shared stateful logic

## 🚀 Development Best Practices

### Component Guidelines
- Keep components small and focused
- Use functional components with hooks
- Implement proper prop validation
- Include JSDoc comments for complex logic

### Hook Guidelines
- Prefix custom hooks with `use`
- Return consistent data structures
- Handle loading and error states
- Clean up side effects properly

### Performance Considerations
- Use `React.memo` for expensive components
- Implement `useMemo` for complex calculations
- Apply `useCallback` for stable function references
- Debounce frequent API calls

## 🧪 Testing Strategy

Each component and hook should have:
- Unit tests for logic
- Integration tests for data flow
- Snapshot tests for UI consistency
- Mock WebSocket/API responses

## 🔍 Code Quality

### Linting Rules
- ESLint configuration in package.json
- Prettier for consistent formatting
- No console.logs in production
- Proper error boundaries

### Type Safety
- PropTypes for component props
- JSDoc comments for functions
- Consistent naming conventions
- Clear variable names

## 📝 Import Organization

Standard import order:
```javascript
// 1. React and core libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import axios from 'axios';
import Sketch from 'react-p5';

// 3. Custom hooks
import useDeepgram from './hooks/useDeepgram';

// 4. Components
import TranscriptDisplay from './components/TranscriptDisplay';

// 5. Utilities and helpers
import { processAudioData } from './utils/audioUtils';

// 6. Styles
import './styles/App.css';
```

## 🐛 Debugging Tips

1. **React DevTools** - Inspect component tree and props
2. **Network Tab** - Monitor WebSocket frames and API calls
3. **Console Logging** - Strategic placement for data flow tracking
4. **Performance Profiler** - Identify rendering bottlenecks

---

*The heart of the Sentiment Aura frontend application*
