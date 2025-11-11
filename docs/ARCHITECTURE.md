# 🏗️ System Architecture

> Detailed technical architecture of the Sentiment Aura application

## 📋 System Overview

Sentiment Aura is a full-stack web application built with a three-tier architecture that processes live audio, performs real-time transcription, analyzes sentiment using AI, and visualizes emotions through generative art.

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Controls │ │Transcript│ │ Keywords │ │ Aura             │ │
│  │          │ │ Display  │ │ Display  │ │ Visualization    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    Custom React Hooks                     │ │
│  │  useAudioCapture | useDeepgram | useSentimentProcessor   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┴───────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                     API Routes                            │ │
│  │               /process_text | /health                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    LLM Service Layer                      │ │
│  │          Sentiment Analysis | Keyword Extraction          │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴───────────────────────────────────────┐
│                      External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Deepgram   │  │   OpenAI/    │  │    Other     │        │
│  │  WebSocket   │  │   Anthropic  │  │   Services   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Component Responsibilities

### Frontend (React)

**Primary Responsibilities:**
- Audio capture from user's microphone
- WebSocket management for real-time streaming
- UI rendering and user interaction
- State management for application data
- Real-time visualization rendering

**Key Components:**

| Component | Responsibility |
|-----------|---------------|
| `App.jsx` | Main orchestrator, global state management |
| `Controls` | Recording controls, user permissions |
| `TranscriptDisplay` | Real-time transcription display |
| `KeywordsDisplay` | Animated keyword presentation |
| `AuraVisualization` | Perlin noise generative art |

**Custom Hooks:**

| Hook | Purpose |
|------|---------|
| `useAudioCapture` | Microphone access, audio stream management |
| `useDeepgram` | WebSocket connection, transcription handling |
| `useSentimentProcessor` | Backend API calls, sentiment state |

### Backend (FastAPI)

**Primary Responsibilities:**
- Secure proxy for LLM API calls
- Text processing and analysis orchestration
- Response formatting and validation
- Error handling and retry logic
- CORS and security management

**Key Modules:**

| Module | Responsibility |
|--------|---------------|
| `main.py` | Application entry, server configuration |
| `api/routes.py` | Endpoint definitions, request handling |
| `services/llm_service.py` | LLM integration, API calls |
| `config/settings.py` | Configuration management |

### External APIs

**Deepgram:**
- Real-time speech-to-text via WebSocket
- Interim and final transcript delivery
- Low-latency audio processing

**LLM Provider (OpenAI/Anthropic/Gemini):**
- Sentiment analysis
- Keyword extraction
- Structured JSON responses

## 🔄 Data Flow (Step-by-Step)

### 1. Audio Capture
```javascript
// Frontend: useAudioCapture hook
getUserMedia({ audio: constraints }) 
  → MediaStream 
  → AudioContext (16kHz, mono)
```

### 2. WebSocket Streaming
```javascript
// Frontend: useDeepgram hook
WebSocket → wss://api.deepgram.com/v1/listen
  → Stream audio chunks (Linear16)
  → Receive transcription JSON
```

### 3. Transcription Display
```javascript
// Frontend: TranscriptDisplay component
Deepgram Response:
{
  "channel": {...},
  "is_final": true,
  "text": "transcribed speech"
}
→ Update transcript state
→ Render with auto-scroll
```

### 4. Sentiment Processing
```javascript
// Frontend → Backend
if (transcript.is_final) {
  POST /process_text
  Body: { "text": "final transcript" }
}
```

### 5. LLM Analysis
```python
# Backend: llm_service.py
prompt = format_prompt(text)
response = await llm_api.call(prompt)
parsed = parse_json(response)
return {
  "sentiment": {...},
  "keywords": [...]
}
```

### 6. Visualization Update
```javascript
// Frontend: AuraVisualization
sentiment → color palette, flow speed
keywords → particle effects
→ Perlin noise field parameters
→ 60fps canvas rendering
```

## 🔀 Async Management

### WebSocket Connection
```javascript
// Reconnection logic with exponential backoff
const reconnect = async (attempt = 0) => {
  const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
  await sleep(delay);
  connect();
};
```

### Request Debouncing
```javascript
// Only process final transcripts
const debouncedProcess = debounce((text) => {
  if (isFinal) processText(text);
}, 500);
```

### Loading States
```javascript
// Multiple loading states
const [isConnecting, setIsConnecting] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);
const [isTranscribing, setIsTranscribing] = useState(false);
```

### Error Boundaries
```javascript
// Component-level error handling
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    logError(error, info);
    this.setState({ hasError: true });
  }
}
```

## ⚡ Performance Considerations

### Frontend Optimizations

**Audio Processing:**
- Buffer size: 4096 samples (optimal latency/performance)
- Sample rate: 16kHz (Deepgram optimal)
- Mono channel (reduced bandwidth)

**Rendering:**
- React.memo for expensive components
- useMemo for complex calculations
- RequestAnimationFrame for smooth animations
- 60fps target for visualization

**State Management:**
- Batched state updates
- Immutable data patterns
- Selective re-renders

### Backend Optimizations

**Async Operations:**
- All I/O operations are async
- Connection pooling for HTTP clients
- Concurrent request handling

**Caching Strategy:**
```python
# Future implementation
cache_key = hashlib.md5(text.encode()).hexdigest()
if cache_key in cache:
    return cache[cache_key]
```

**Request Optimization:**
- Debounced API calls (500ms)
- Maximum text length (5000 chars)
- Request timeout (10 seconds)

### Network Optimization

**WebSocket:**
- Binary data transfer (Linear16)
- Compression enabled
- Keep-alive pings

**HTTP:**
- Gzip compression
- Connection reuse
- Appropriate timeout values

## 🏛️ Design Patterns

### Frontend Patterns

**Custom Hooks Pattern:**
- Encapsulate complex logic
- Reusable across components
- Separation of concerns

**Provider Pattern:**
- Global state management
- Context API for cross-component data

**Observer Pattern:**
- WebSocket event handling
- Real-time data updates

### Backend Patterns

**Service Layer Pattern:**
- Business logic separation
- Provider abstraction
- Testable units

**Factory Pattern:**
- LLM provider selection
- Dynamic client creation

**Strategy Pattern:**
- Different LLM implementations
- Swappable algorithms

## 🔐 Security Architecture

### Frontend Security
- HTTPS only in production
- Secure WebSocket (wss://)
- No API keys in client code
- Input sanitization

### Backend Security
- API key management via environment variables
- CORS configuration
- Rate limiting (future)
- Input validation with Pydantic
- Error message sanitization

### Data Flow Security
```
Frontend → [Sanitize] → Backend → [Validate] → LLM API
         ← [Format]   ← Backend ← [Parse]    ← LLM API
```

## 📊 Scalability Considerations

### Horizontal Scaling
```
Load Balancer
    ├── Backend Instance 1
    ├── Backend Instance 2
    └── Backend Instance N
```

### Caching Layers
```
Request → Cache Check → Cache Hit → Return
              ↓
          Cache Miss → LLM API → Update Cache
```

### Future Enhancements

**Message Queue:**
```
Frontend → Queue → Workers → LLM API
                ↓
            Database
```

**WebSocket Scaling:**
```
WebSocket Server Cluster
    ├── Node 1 (Sticky Sessions)
    ├── Node 2
    └── Node N
```

## 🧪 Testing Architecture

### Unit Testing
- Component testing with React Testing Library
- Hook testing with renderHook
- Service testing with pytest

### Integration Testing
- API endpoint testing
- WebSocket connection testing
- End-to-end user flows

### Performance Testing
- Load testing with Locust
- WebSocket stress testing
- Visualization frame rate monitoring

## 📈 Monitoring Architecture

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics

### Infrastructure Monitoring
- Server health checks
- API latency tracking
- WebSocket connection metrics

### Business Metrics
- Transcription accuracy
- Sentiment analysis quality
- User engagement metrics

## 🔄 Deployment Architecture

### Development
```
Local Development
├── Frontend: npm start (port 3000)
├── Backend: python main.py (port 8000)
└── Services: Local API keys
```

### Production
```
Production Environment
├── Frontend: CDN (CloudFront/Vercel)
├── Backend: Container (Docker/K8s)
└── Services: Managed secrets
```

## 🎨 Visualization Architecture

### Perlin Noise Implementation
```javascript
// Noise field generation
for (let particle of particles) {
  const angle = noise(particle.x * scale, particle.y * scale, time);
  particle.vx += cos(angle) * force;
  particle.vy += sin(angle) * force;
}
```

### Sentiment Mapping
```javascript
sentiment.type → color palette
sentiment.score → energy/speed
sentiment.intensity → particle count
keywords → additional visual elements
```

---

*Technical architecture powering the Sentiment Aura experience*
