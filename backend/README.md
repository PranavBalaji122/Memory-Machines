# ⚙️ Sentiment Aura - Backend

> FastAPI proxy server for secure LLM API calls and sentiment analysis

## 📋 Purpose

The backend of Sentiment Aura serves as a secure proxy server that:
- Manages API keys securely (never exposed to frontend)
- Makes structured calls to LLM providers (OpenAI/Anthropic/Gemini)
- Processes and formats sentiment analysis responses
- Handles error cases and provides graceful degradation
- Implements proper CORS for frontend communication

## 🛠️ Tech Stack

- **FastAPI** - Modern, fast Python web framework
- **Python 3.9+** - Required for type hints and modern features
- **httpx/requests** - Async HTTP client for API calls
- **python-dotenv** - Environment variable management
- **uvicorn** - ASGI server for FastAPI
- **pydantic** - Data validation using Python type hints

## 🚀 Setup & Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The server will start at `http://localhost:8000`

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Choose one LLM provider (uncomment the one you want to use)

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# OR Anthropic (Claude)
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OR Google (Gemini)
# GEMINI_API_KEY=your_gemini_api_key_here

# Optional configurations
CORS_ORIGINS=["http://localhost:3000"]
MAX_TIMEOUT=10
MAX_RETRIES=3
```

## 🔑 Why a Backend?

**Security**: API keys are never exposed to the browser
**Processing**: Complex prompt engineering and response parsing
**Flexibility**: Easy to switch between LLM providers
**Caching**: Potential for response caching (future enhancement)
**Rate Limiting**: Control and monitor API usage
**Error Handling**: Centralized error management

## 📡 API Endpoints

### `POST /process_text`

Analyzes text for sentiment and extracts keywords.

**Request:**
```json
{
  "text": "I'm really excited about this new project!"
}
```

**Response:**
```json
{
  "sentiment": {
    "score": 0.92,
    "type": "positive",
    "intensity": "strong"
  },
  "keywords": ["excited", "new", "project"]
}
```

**Status Codes:**
- `200 OK` - Successful analysis
- `400 Bad Request` - Invalid request format
- `500 Internal Server Error` - LLM API error
- `503 Service Unavailable` - Service timeout

### `GET /health`

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "1.0.0"
}
```

## 🏗️ Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create this)
├── api/
│   ├── __init__.py
│   └── routes.py          # API endpoint definitions
├── services/
│   ├── __init__.py
│   ├── llm_service.py     # LLM API integration
│   └── prompt_templates.py # Prompt engineering
└── config/
    ├── __init__.py
    └── settings.py        # Configuration management
```

## 🔄 Request Flow

1. **Receive Text**: Frontend sends transcribed text
2. **Validate**: Check text length and format
3. **Process**: Send to LLM with structured prompt
4. **Parse**: Extract sentiment and keywords from response
5. **Format**: Structure data according to schema
6. **Return**: Send formatted JSON to frontend

## ⚡ Performance Optimizations

- **Async Operations**: All I/O operations are async
- **Connection Pooling**: Reuse HTTP connections
- **Request Timeout**: Prevent hanging requests
- **Response Caching**: Cache recent analyses (optional)
- **Batch Processing**: Group multiple requests (future)

## 🛡️ Error Handling

The backend implements multiple layers of error handling:

1. **Input Validation**: Pydantic models validate all inputs
2. **API Failures**: Retry logic with exponential backoff
3. **Timeout Protection**: Maximum 10-second timeout
4. **Graceful Degradation**: Return last known good state
5. **Detailed Logging**: Track all errors for debugging

## 📊 LLM Provider Configuration

### OpenAI (GPT-4/GPT-3.5)
```python
model = "gpt-3.5-turbo"  # or "gpt-4"
temperature = 0.3  # Lower for consistent results
max_tokens = 150  # Limit response length
```

### Anthropic (Claude)
```python
model = "claude-3-sonnet"  # or "claude-3-opus"
max_tokens = 150
temperature = 0.3
```

### Google (Gemini)
```python
model = "gemini-pro"
temperature = 0.3
max_output_tokens = 150
```

## 🧪 Testing

```bash
# Run tests
pytest

# Test specific endpoint
curl -X POST http://localhost:8000/process_text \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test message"}'
```

## 📝 Development Notes

### Local Development
- Hot reload enabled with uvicorn
- Swagger docs at `http://localhost:8000/docs`
- ReDoc at `http://localhost:8000/redoc`

### CORS Configuration
- Default allows `http://localhost:3000`
- Update for production domains
- Configure in `config/settings.py`

### Rate Limiting
- Implement rate limiting for production
- Consider using Redis for distributed limiting
- Monitor API usage costs

## 🐛 Common Issues

### LLM API Key Invalid
```python
# Check your .env file
# Ensure API key is correctly set
# Verify key has proper permissions
```

### CORS Errors
```python
# Update CORS_ORIGINS in settings.py
# Ensure frontend URL is whitelisted
```

### Timeout Errors
```python
# Increase MAX_TIMEOUT if needed
# Check network connectivity
# Verify LLM service status
```

## 🚀 Deployment Considerations

### Production Setup
- Use environment variables (not .env file)
- Enable HTTPS with SSL certificates
- Implement proper logging
- Set up monitoring and alerts
- Use production ASGI server (Gunicorn)

### Scaling
- Horizontal scaling with load balancer
- Implement caching layer (Redis)
- Database for analytics (PostgreSQL)
- Queue for async processing (Celery)

## 📈 Future Enhancements

- **Multi-language Support**: Analyze text in different languages
- **Emotion Detection**: More nuanced emotional categories
- **Context Awareness**: Maintain conversation context
- **Custom Models**: Fine-tuned models for specific domains
- **Analytics Dashboard**: Track usage and performance
- **Webhook Support**: Real-time notifications

---

*The intelligent backend powering Sentiment Aura's analysis*
