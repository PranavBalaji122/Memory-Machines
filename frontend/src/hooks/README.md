# 🪝 Custom React Hooks

> Reusable stateful logic for the Sentiment Aura application

## 📋 Overview

This directory contains custom React hooks that encapsulate complex logic and side effects. These hooks promote code reuse, separation of concerns, and cleaner component code.

## 🎯 Hook Documentation

### 🎙️ useDeepgram.js

**Purpose**: Manages WebSocket connection to Deepgram API for real-time transcription

**Features**:
- Establishes and maintains WebSocket connection
- Streams audio data to Deepgram
- Receives and parses transcription results
- Handles reconnection on disconnect
- Manages connection state

**Returns**:
```javascript
{
  transcript: string,           // Current transcript text
  isConnected: boolean,        // WebSocket connection status
  error: Error | null,         // Any connection errors
  connect: (stream) => void,   // Connect with audio stream
  disconnect: () => void        // Disconnect WebSocket
}
```

**Usage Example**:
```javascript
const {
  transcript,
  isConnected,
  error,
  connect,
  disconnect
} = useDeepgram({
  onTranscript: (data) => console.log('New transcript:', data),
  apiKey: 'your-deepgram-api-key'
});
```

**WebSocket Message Format**:
```javascript
// Incoming from Deepgram
{
  "channel": {
    "alternatives": [{
      "transcript": "Hello world",
      "confidence": 0.98
    }]
  },
  "is_final": true,
  "speech_final": true
}
```

**Key Implementation Details**:
- Auto-reconnect with exponential backoff
- Binary audio data streaming
- JSON message parsing
- Connection state management

---

### 🎤 useAudioCapture.js

**Purpose**: Manages Web Audio API and microphone access

**Features**:
- Requests microphone permissions
- Captures audio stream from user's microphone
- Converts audio to proper format for Deepgram
- Handles permission denials gracefully
- Cleans up resources on unmount

**Returns**:
```javascript
{
  stream: MediaStream | null,    // Active audio stream
  startCapture: () => Promise,   // Start capturing audio
  stopCapture: () => void,       // Stop capturing audio
  error: Error | null            // Capture errors
}
```

**Usage Example**:
```javascript
const {
  stream,
  startCapture,
  stopCapture,
  error
} = useAudioCapture();

// Start recording
const audioStream = await startCapture();
// Use stream with Deepgram
```

**Audio Configuration**:
```javascript
{
  audio: {
    channelCount: 1,      // Mono audio
    sampleRate: 16000,    // 16kHz for Deepgram
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
}
```

**Permission Handling**:
- Detects browser support for getUserMedia
- Handles permission prompts
- Provides clear error messages
- Falls back gracefully on older browsers

---

### 🧠 useSentimentProcessor.js

**Purpose**: Makes API calls to backend for sentiment analysis

**Features**:
- Sends transcribed text to backend `/process_text` endpoint
- Manages sentiment and keyword state
- **Debounces requests** - only processes "is_final" transcripts
- Handles loading and error states
- Caches recent results

**Returns**:
```javascript
{
  sentiment: {                   // Current sentiment data
    score: number,               // 0-1 sentiment score
    type: string,               // 'positive', 'negative', 'neutral'
    intensity: string           // 'weak', 'moderate', 'strong'
  } | null,
  keywords: string[],           // Extracted keywords
  isProcessing: boolean,        // Loading state
  error: Error | null,         // Processing errors
  processText: (text) => void  // Process text function
}
```

**Usage Example**:
```javascript
const {
  sentiment,
  keywords,
  isProcessing,
  error,
  processText
} = useSentimentProcessor();

// Process final transcript
if (transcript.is_final) {
  processText(transcript.text);
}
```

**API Request Format**:
```javascript
// POST to backend
{
  "text": "The transcribed speech text"
}

// Response from backend
{
  "sentiment": {
    "score": 0.85,
    "type": "positive",
    "intensity": "strong"
  },
  "keywords": ["innovation", "excited", "future"]
}
```

**Debouncing Strategy**:
- Only processes final transcripts (is_final: true)
- Minimum 500ms between requests
- Cancels pending requests on new input
- Queues requests during processing

---

## 🏗️ Hook Architecture Patterns

### State Management Pattern
```javascript
const useCustomHook = (config) => {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Effect for side effects
  useEffect(() => {
    // Cleanup function
    return () => {
      // Clean up resources
    };
  }, [dependencies]);
  
  // Return consistent interface
  return { state, loading, error, actions };
};
```

### WebSocket Pattern
```javascript
const useWebSocket = (url) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  
  const connect = useCallback(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => setConnected(true);
    ws.current.onclose = () => handleReconnect();
  }, [url]);
  
  return { connected, connect, disconnect };
};
```

### API Call Pattern
```javascript
const useApiCall = (endpoint) => {
  const [data, setData] = useState(null);
  const abortController = useRef(null);
  
  const fetchData = useCallback(async (params) => {
    abortController.current = new AbortController();
    
    try {
      const response = await fetch(endpoint, {
        signal: abortController.current.signal,
        ...params
      });
      setData(await response.json());
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  }, [endpoint]);
  
  return { data, fetchData };
};
```

## 🧪 Testing Hooks

### Test Structure
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import useCustomHook from './useCustomHook';

describe('useCustomHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.state).toBe(initialValue);
  });
  
  it('should handle actions', async () => {
    const { result } = renderHook(() => useCustomHook());
    await act(async () => {
      result.current.action();
    });
    expect(result.current.state).toBe(expectedValue);
  });
});
```

## 🎯 Best Practices

### DO's
- ✅ Prefix hook names with "use"
- ✅ Return consistent data structures
- ✅ Handle loading and error states
- ✅ Clean up side effects in return functions
- ✅ Use useCallback for stable function references
- ✅ Document complex logic with comments

### DON'Ts
- ❌ Don't call hooks conditionally
- ❌ Don't call hooks in loops
- ❌ Don't forget cleanup functions
- ❌ Don't expose implementation details
- ❌ Don't mutate state directly

## 🔍 Debugging Tips

1. **useDebugValue** for DevTools:
```javascript
useDebugValue(isConnected ? 'Connected' : 'Disconnected');
```

2. **Console logging state changes**:
```javascript
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

3. **Track re-renders**:
```javascript
const renderCount = useRef(0);
renderCount.current++;
```

---

*Powering the stateful logic of Sentiment Aura*
