# 📡 API Reference

> Complete API documentation for Sentiment Aura

## 📋 Overview

This document provides comprehensive API documentation for both the backend REST endpoints and the WebSocket connections used in Sentiment Aura.

## 🌐 Backend REST API

### Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com/api
```

### Authentication
Currently no authentication required (future enhancement)

---

## 📍 Endpoints

### `POST /process_text`

Analyzes text for sentiment and extracts keywords.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "text": "string (required, min: 10 chars, max: 5000 chars)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/process_text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am absolutely thrilled about this amazing opportunity! The team has done exceptional work."
  }'
```

#### Response

**Success Response (200 OK):**
```json
{
  "sentiment": {
    "score": 0.92,
    "type": "positive",
    "intensity": "strong"
  },
  "keywords": ["thrilled", "amazing", "opportunity", "exceptional", "team"]
}
```

**Response Fields:**

| Field | Type | Description | Possible Values |
|-------|------|-------------|-----------------|
| `sentiment.score` | float | Sentiment strength (0=negative, 1=positive) | 0.0 - 1.0 |
| `sentiment.type` | string | Sentiment category | "positive", "negative", "neutral" |
| `sentiment.intensity` | string | Emotional intensity | "weak", "moderate", "strong" |
| `keywords` | array | Key terms extracted | Array of strings (3-7 items) |

#### Error Responses

**400 Bad Request:**
```json
{
  "error": "Text cannot be empty or just whitespace",
  "status_code": 400,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to analyze sentiment: LLM API error",
  "status_code": 500,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**503 Service Unavailable:**
```json
{
  "error": "Sentiment analysis service is currently unavailable",
  "status_code": 503,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**504 Gateway Timeout:**
```json
{
  "error": "Request timeout - the analysis took too long",
  "status_code": 504,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

### `GET /health`

Health check endpoint for monitoring service status.

#### Request

**Example:**
```bash
curl http://localhost:8000/health
```

#### Response

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "api": "operational",
    "llm": "operational"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall health status |
| `timestamp` | string | Current UTC timestamp |
| `version` | string | API version |
| `services.api` | string | API service status |
| `services.llm` | string | LLM service status |

---

### `GET /`

Root endpoint providing API information.

#### Response

```json
{
  "name": "Sentiment Aura API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "docs": "/docs",
    "health": "/health",
    "process": "/process_text"
  }
}
```

---

### `GET /api/stats`

Get analysis statistics (placeholder for future implementation).

#### Response

```json
{
  "total_requests": 0,
  "average_sentiment_score": 0.5,
  "most_common_keywords": ["placeholder", "data"],
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

### `GET /api/supported-languages`

Get list of supported languages for sentiment analysis.

#### Response

```json
{
  "languages": [
    {"code": "en", "name": "English", "supported": true},
    {"code": "es", "name": "Spanish", "supported": false},
    {"code": "fr", "name": "French", "supported": false}
  ],
  "default": "en",
  "note": "Multi-language support coming soon"
}
```

---

### `GET /api/models`

Get information about available LLM models.

#### Response

```json
{
  "models": [
    {
      "provider": "openai",
      "name": "gpt-3.5-turbo",
      "description": "Fast and efficient for sentiment analysis",
      "available": true
    },
    {
      "provider": "anthropic",
      "name": "claude-3-sonnet",
      "description": "Balanced performance and accuracy",
      "available": true
    }
  ],
  "active_model": "gpt-3.5-turbo"
}
```

---

## 🔌 WebSocket API (Deepgram)

### Connection Endpoint

```
wss://api.deepgram.com/v1/listen
```

### Connection Parameters

**Query Parameters:**
```
encoding=linear16        # Audio encoding format
sample_rate=16000       # 16kHz sample rate
channels=1              # Mono audio
interim_results=true    # Get partial transcripts
punctuate=true         # Add punctuation
language=en-US         # Language code
model=nova-2           # Deepgram model
```

### Authentication

**Headers:**
```
Authorization: Token YOUR_DEEPGRAM_API_KEY
```

Or via URL:
```
wss://api.deepgram.com/v1/listen?token=YOUR_API_KEY
```

### Audio Format

**Required Format:**
- Encoding: Linear16 (PCM)
- Sample Rate: 16000 Hz
- Channels: 1 (Mono)
- Bit Depth: 16-bit

### Message Flow

#### Client → Server (Audio Data)

Send raw audio bytes:
```javascript
// Convert Float32Array to Int16Array
const int16Data = convertFloat32ToInt16(audioBuffer);
websocket.send(int16Data.buffer);
```

#### Server → Client (Transcription)

**Interim Result:**
```json
{
  "channel": {
    "alternatives": [{
      "transcript": "hello world",
      "confidence": 0.98,
      "words": [{
        "word": "hello",
        "start": 0.24,
        "end": 0.56,
        "confidence": 0.99
      }]
    }]
  },
  "is_final": false,
  "speech_final": false,
  "channel_index": [0, 1],
  "metadata": {
    "request_id": "abc-123",
    "model_info": {
      "name": "nova-2",
      "version": "2024.01.15"
    }
  }
}
```

**Final Result:**
```json
{
  "channel": {
    "alternatives": [{
      "transcript": "Hello world, this is the final transcript.",
      "confidence": 0.98
    }]
  },
  "is_final": true,
  "speech_final": true
}
```

### WebSocket Events

#### Connection Events

```javascript
// Connection opened
ws.onopen = () => {
  console.log('Connected to Deepgram');
};

// Connection closed
ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
};

// Connection error
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

#### Close Codes

| Code | Meaning | Action |
|------|---------|--------|
| 1000 | Normal closure | No action needed |
| 1001 | Going away | Reconnect if needed |
| 1006 | Abnormal closure | Retry with backoff |
| 1008 | Policy violation | Check API key |
| 1011 | Server error | Retry later |

### Error Handling

**Invalid API Key:**
```json
{
  "type": "Error",
  "message": "Invalid API key",
  "code": "INVALID_AUTH"
}
```

**Rate Limit:**
```json
{
  "type": "Error",
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retry_after": 60
}
```

---

## 📊 Rate Limiting

### Current Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/process_text` | 100 requests | 1 minute |
| `/health` | Unlimited | - |
| WebSocket | 1 concurrent connection | Per API key |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642267200
```

---

## 🔍 Error Codes Reference

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Access denied to resource |
| 404 | Not Found | Endpoint doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 502 | Bad Gateway | LLM API unavailable |
| 503 | Service Unavailable | Service temporarily down |
| 504 | Gateway Timeout | Request timeout |

### Application Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `TEXT_TOO_SHORT` | Text less than 10 chars | Provide longer text |
| `TEXT_TOO_LONG` | Text exceeds 5000 chars | Shorten text |
| `INVALID_FORMAT` | Invalid request format | Check JSON structure |
| `LLM_ERROR` | LLM API failed | Retry request |
| `PARSE_ERROR` | Failed to parse response | Contact support |

---

## 🧪 Testing the API

### Using cURL

```bash
# Test sentiment analysis
curl -X POST http://localhost:8000/process_text \
  -H "Content-Type: application/json" \
  -d '{"text": "This is amazing!"}'

# Test health endpoint
curl http://localhost:8000/health

# Test with verbose output
curl -v -X POST http://localhost:8000/process_text \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing the API"}'
```

### Using Postman

1. Import the OpenAPI schema from `/docs`
2. Set base URL to `http://localhost:8000`
3. Add `Content-Type: application/json` header
4. Send test requests

### Using JavaScript

```javascript
// Fetch API
const response = await fetch('http://localhost:8000/process_text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'This is a test message'
  })
});

const data = await response.json();
console.log(data);

// Axios
import axios from 'axios';

const result = await axios.post('http://localhost:8000/process_text', {
  text: 'This is a test message'
});
console.log(result.data);
```

### Using Python

```python
import requests

response = requests.post(
    'http://localhost:8000/process_text',
    json={'text': 'This is a test message'}
)

print(response.json())
```

---

## 📚 API Documentation Tools

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

### Client SDK Generation

Use the OpenAPI schema to generate client SDKs:

```bash
# Generate TypeScript client
npx openapi-typescript http://localhost:8000/openapi.json --output ./api-types.ts

# Generate Python client
pip install openapi-python-client
openapi-python-client generate --url http://localhost:8000/openapi.json
```

---

## 🔒 Security Best Practices

### API Security

1. **Always use HTTPS in production**
2. **Validate all input data**
3. **Sanitize error messages**
4. **Implement rate limiting**
5. **Use environment variables for secrets**

### CORS Configuration

```python
# Restrictive CORS for production
CORS_ORIGINS = ["https://yourdomain.com"]

# Permissive for development only
CORS_ORIGINS = ["http://localhost:3000"]
```

### Request Validation

All requests are validated using Pydantic models:
- Type checking
- Length constraints
- Format validation
- Sanitization

---

*Complete API reference for Sentiment Aura integration*
