# 🎯 Sentiment Aura - Real-time Emotional Visualization

> Transform spoken words into living art through AI-powered sentiment analysis and generative visualization

## ✨ Overview

**Sentiment Aura** is a full-stack web application that captures live audio, transcribes it in real-time, analyzes emotional sentiment using AI, and visualizes these emotions as a beautiful, fluid Perlin noise "aura" that responds dynamically to the speaker's emotional state.

### The Magic Flow
🎤 **Audio** → 📝 **Transcription** → 🧠 **AI Sentiment** → 🎨 **Visual Aura**

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python 3.9+
- API Keys:
  - Deepgram API key for transcription
  - OpenAI/Anthropic/Gemini API key for sentiment analysis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sentiment-aura
   ```

2. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   echo "REACT_APP_DEEPGRAM_API_KEY=your_deepgram_key" >> .env
   echo "REACT_APP_BACKEND_URL=http://localhost:8000" >> .env
   ```

3. **Set up the Backend**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   
   # Create .env file
   echo "OPENAI_API_KEY=your_openai_key" >> .env
   # OR
   echo "ANTHROPIC_API_KEY=your_anthropic_key" >> .env
   # OR
   echo "GEMINI_API_KEY=your_gemini_key" >> .env
   ```

4. **Run both servers**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   python main.py
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Click "Start Recording" and begin speaking!

## 🎮 Demo Instructions

1. **Grant Microphone Access**: Click "Allow" when prompted
2. **Start Recording**: Click the recording button to begin
3. **Speak Naturally**: Express different emotions as you talk
4. **Watch the Magic**: 
   - See your words appear in real-time
   - Observe keywords floating into view
   - Experience your emotional aura evolving with your sentiment
5. **Stop Recording**: Click stop when finished

## 🏗️ Architecture Overview

### Three-Part System

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│  External APIs  │
│     (React)     │◀────│    (FastAPI)    │◀────│  (Deepgram/LLM) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: Captures audio, displays transcriptions, renders visualizations
- **Backend**: Proxy server for secure API calls, processes sentiment analysis
- **External APIs**: Deepgram for transcription, LLM for sentiment extraction

## ⭐ Key Features

- **🎙️ Real-time Transcription**: Live speech-to-text using Deepgram WebSocket API
- **🧠 AI-Powered Sentiment Analysis**: Emotional understanding via OpenAI/Anthropic/Gemini
- **🎨 Perlin Noise Visualization**: Beautiful, fluid generative art that responds to emotions
- **✨ Smooth UI Animations**: Graceful transitions and polished user experience
- **📊 Keyword Extraction**: AI identifies and displays key themes from speech
- **🔄 Real-time Updates**: Instant visual feedback as sentiment changes

## 🛠️ Technologies Used

### Frontend
- **React** - Component-based UI framework
- **react-p5** - Processing/p5.js integration for generative art
- **Web Audio API** - Browser-based audio capture
- **WebSocket** - Real-time bidirectional communication
- **axios** - HTTP client for API calls

### Backend
- **FastAPI** - Modern Python web framework
- **httpx/requests** - Async HTTP client
- **python-dotenv** - Environment variable management
- **uvicorn** - ASGI server

### External Services
- **Deepgram** - Real-time speech recognition
- **OpenAI/Anthropic/Gemini** - Large language models for sentiment analysis

## 📁 Project Structure

```
sentiment-aura/
├── 📝 README.md                 # You are here!
├── 🎨 frontend/                 # React application
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   └── styles/            # CSS styling
│   └── package.json
├── ⚙️ backend/                  # FastAPI server
│   ├── api/                   # API routes
│   ├── services/              # Business logic
│   ├── config/                # Configuration
│   └── requirements.txt
└── 📚 docs/                     # Documentation
    ├── ARCHITECTURE.md         # System design details
    ├── API.md                  # API reference
    └── DEPLOYMENT.md           # Deployment guide
```

## 🐛 Troubleshooting

### Common Issues

1. **Microphone not working**
   - Ensure browser has microphone permissions
   - Check if using HTTPS in production (required for getUserMedia)

2. **WebSocket connection fails**
   - Verify Deepgram API key is correct
   - Check network connectivity
   - Ensure CORS is properly configured

3. **No sentiment data appearing**
   - Confirm backend is running on port 8000
   - Check LLM API key is valid
   - Verify backend logs for errors

4. **Visualization not updating**
   - Check browser console for p5.js errors
   - Ensure sentiment data format is correct
   - Verify React props are being passed correctly

## 📈 Performance Tips

- The app debounces API calls to process only final transcriptions
- Visualization runs at 60fps with optimized Perlin noise calculations
- State updates are batched for smooth UI performance
- Audio buffering is optimized for real-time streaming

## 🤝 Contributing

Contributions are welcome! Please read the documentation in `/docs` before making changes.

## 📄 License

MIT License - feel free to use this project for your own creative experiments!

## 🙏 Acknowledgments

- Deepgram for excellent real-time transcription
- The p5.js community for generative art inspiration
- [Sighack](https://sighack.com/post/getting-creative-with-perlin-noise-fields) for Perlin noise field techniques

---

*Built with ❤️ for real-time creative expression*
