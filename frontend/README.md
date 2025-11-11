# 🎨 Sentiment Aura - Frontend

> React application for real-time audio transcription and emotional visualization

## 📋 Purpose

The frontend of Sentiment Aura is a React-based web application that:
- Captures live audio from the user's microphone
- Streams audio to Deepgram for real-time transcription
- Displays transcriptions with smooth animations
- Visualizes emotional sentiment as generative Perlin noise art
- Presents keywords extracted from speech in an elegant UI

## 🛠️ Tech Stack

- **React 18** - Modern UI framework with hooks
- **react-p5** - Processing/p5.js wrapper for generative art
- **Web Audio API** - Browser-native audio capture
- **WebSocket** - Real-time bidirectional communication with Deepgram
- **axios** - Promise-based HTTP client for backend API calls

## 🚀 Setup & Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the frontend directory:

```env
# Deepgram API key for transcription
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8000
```

## 🧩 Key Components

### Core Components

- **`TranscriptDisplay`** - Shows real-time transcription with auto-scroll
- **`KeywordsDisplay`** - Presents extracted keywords with smooth animations
- **`Controls`** - Recording controls with visual feedback
- **`AuraVisualization`** - Generative art canvas responding to emotions

### Component Architecture

```
App.jsx
├── Controls
├── TranscriptDisplay
├── KeywordsDisplay
└── AuraVisualization
```

## 📊 Data Flow

1. **🎤 Audio Capture**
   - User clicks "Start Recording"
   - Browser requests microphone permission
   - Audio stream captured via Web Audio API

2. **📡 WebSocket Streaming**
   - Audio streamed to Deepgram WebSocket endpoint
   - Continuous audio chunks sent in real-time
   - Connection managed by `useDeepgram` hook

3. **📝 Transcription Display**
   - Deepgram returns interim and final transcripts
   - Text displayed immediately in `TranscriptDisplay`
   - Auto-scrolling keeps latest text visible

4. **🧠 Sentiment Analysis**
   - Final transcripts sent to backend `/process_text`
   - Backend calls LLM API for sentiment extraction
   - Response includes sentiment scores and keywords

5. **🎨 Visual Updates**
   - Sentiment data updates visualization parameters
   - Keywords appear with staggered fade-in animations
   - Perlin noise field adapts colors and flow to emotion

## 🔧 Development Notes

### Local Development
- **Port**: 3000 (default Create React App port)
- **Hot Reload**: Enabled - changes reflect instantly
- **Browser DevTools**: React DevTools extension recommended

### Performance Optimizations
- Debounced API calls (only for final transcripts)
- Memoized components to prevent unnecessary re-renders
- Efficient state management with React hooks
- Optimized p5.js rendering at 60fps

### Browser Requirements
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Microphone access required
- WebSocket support required
- Web Audio API support required

## 🎯 Key Features

### Real-time Transcription
- Live speech-to-text with < 500ms latency
- Interim results for immediate feedback
- Final transcripts for processing

### Smooth Animations
- Staggered keyword appearance (NOT instant pop-in)
- Smooth color transitions in visualization
- Graceful loading states
- Polished error handling

### Responsive Design
- Mobile-friendly layout
- Adaptive canvas sizing
- Touch-enabled controls

## 📝 Scripts

```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

## 🐛 Common Issues

### Microphone Access Denied
```javascript
// Check permissions in browser settings
// Ensure HTTPS in production (required for getUserMedia)
```

### WebSocket Connection Failed
```javascript
// Verify Deepgram API key
// Check network connectivity
// Review CORS settings
```

### Visualization Not Updating
```javascript
// Check console for p5.js errors
// Verify prop passing in React DevTools
// Ensure sentiment data format is correct
```

## 📂 Directory Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── App.jsx            # Main application component
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── styles/           # CSS files
├── package.json          # Dependencies and scripts
└── .env                  # Environment variables (create this)
```

## 🎨 Styling Philosophy

- Modern, minimalist design
- Dark theme for better visualization contrast
- Smooth transitions and animations
- Accessibility-first approach
- Responsive across all devices

---

*Part of the Sentiment Aura full-stack application*
