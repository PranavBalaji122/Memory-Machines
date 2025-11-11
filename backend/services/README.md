# 🧠 Services Layer

> Business logic for sentiment analysis and LLM integration

## 📋 Overview

The services layer contains the core business logic for the Sentiment Aura backend. This includes LLM API integration, prompt engineering, response parsing, and error handling.

## 📁 Module Structure

### 🤖 llm_service.py

**Purpose**: Handles all interactions with LLM providers (OpenAI/Anthropic/Gemini)

**Key Components**:

#### `LLMService` Class
Main service class that provides a unified interface for different LLM providers.

```python
class LLMService:
    def __init__(self):
        """Initialize with appropriate provider based on available API keys"""
        
    async def analyze_sentiment(self, text: str) -> dict:
        """Main method for sentiment analysis"""
        
    async def _call_openai(self, text: str) -> dict:
        """OpenAI-specific implementation"""
        
    async def _call_anthropic(self, text: str) -> dict:
        """Anthropic-specific implementation"""
        
    async def _call_gemini(self, text: str) -> dict:
        """Google Gemini-specific implementation"""
```

**Key Features**:
- **Provider Auto-detection**: Automatically selects provider based on available API keys
- **Unified Interface**: Same method signature regardless of provider
- **Error Handling**: Robust error handling with retries
- **Response Parsing**: Consistent response format across providers
- **Timeout Protection**: Prevents hanging requests

**Key Function**: `async def analyze_sentiment(text: str) -> dict`

This is the main entry point that:
1. Validates input text
2. Constructs appropriate prompt
3. Calls the LLM API
4. Parses the response
5. Returns structured data

**Return Format**:
```python
{
    "sentiment": {
        "score": 0.85,      # Float 0-1
        "type": "positive",  # positive/negative/neutral
        "intensity": "strong" # weak/moderate/strong
    },
    "keywords": ["innovation", "excited", "future"]
}
```

### 📝 prompt_templates.py

**Purpose**: Stores and manages prompt templates for LLM interactions

**Key Components**:

#### Prompt Templates
```python
SENTIMENT_ANALYSIS_PROMPT = """
Analyze the sentiment and extract keywords from this text:
"{text}"

Return JSON:
{
  "sentiment": {
    "score": 0-1,
    "type": "positive/negative/neutral",
    "intensity": "weak/moderate/strong"
  },
  "keywords": ["word1", "word2", ...]
}
"""
```

**Template Features**:
- **Structured Output**: Forces JSON response format
- **Clear Instructions**: Unambiguous requirements
- **Consistent Format**: Same structure across providers
- **Flexibility**: Easy to modify without changing code

**Note**: Prompt quality is NOT the primary focus per requirements. The emphasis is on structured output and consistent formatting.

## 🔄 LLM Provider Implementations

### OpenAI Implementation

```python
async def _call_openai(self, text: str) -> dict:
    """
    Call OpenAI API for sentiment analysis
    Uses GPT-3.5-turbo or GPT-4
    """
    client = AsyncOpenAI(api_key=self.api_key)
    
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a sentiment analysis expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,  # Low temperature for consistency
        max_tokens=150,
        response_format={"type": "json_object"}  # Force JSON response
    )
    
    return self._parse_response(response.choices[0].message.content)
```

**Configuration**:
- **Model**: `gpt-3.5-turbo` (fast) or `gpt-4` (accurate)
- **Temperature**: 0.3 for consistent results
- **Max Tokens**: 150 to limit response size
- **Response Format**: JSON mode for structured output

### Anthropic Implementation

```python
async def _call_anthropic(self, text: str) -> dict:
    """
    Call Anthropic Claude API for sentiment analysis
    Uses Claude 3 Sonnet or Opus
    """
    client = AsyncAnthropic(api_key=self.api_key)
    
    response = await client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=150,
        temperature=0.3,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return self._parse_response(response.content[0].text)
```

**Configuration**:
- **Model**: `claude-3-sonnet` (balanced) or `claude-3-opus` (powerful)
- **Temperature**: 0.3 for consistency
- **Max Tokens**: 150 for concise responses

### Google Gemini Implementation

```python
async def _call_gemini(self, text: str) -> dict:
    """
    Call Google Gemini API for sentiment analysis
    Uses Gemini Pro model
    """
    genai.configure(api_key=self.api_key)
    model = genai.GenerativeModel('gemini-pro')
    
    response = await model.generate_content_async(
        prompt,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 150,
        }
    )
    
    return self._parse_response(response.text)
```

**Configuration**:
- **Model**: `gemini-pro`
- **Temperature**: 0.3
- **Max Output Tokens**: 150

## 🛡️ Error Handling Strategy

### Retry Logic
```python
MAX_RETRIES = 3
RETRY_DELAY = 1.0  # seconds

for attempt in range(MAX_RETRIES):
    try:
        response = await api_call()
        return response
    except Exception as e:
        if attempt < MAX_RETRIES - 1:
            await asyncio.sleep(RETRY_DELAY * (attempt + 1))
        else:
            raise
```

### Error Types

| Error Type | Handling Strategy |
|------------|------------------|
| API Key Invalid | Log error, return 503 |
| Rate Limit | Exponential backoff |
| Timeout | Retry with longer timeout |
| Parse Error | Return default structure |
| Network Error | Retry up to 3 times |

### Timeout Handling
```python
async with timeout(10):  # 10 second timeout
    response = await llm_api_call()
```

## 📊 Response Parsing

### JSON Extraction
```python
def _parse_response(self, response_text: str) -> dict:
    """
    Extract JSON from LLM response
    Handles various response formats
    """
    # Try direct JSON parsing
    try:
        return json.loads(response_text)
    except:
        # Extract JSON from markdown code blocks
        json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Fallback parsing logic...
```

### Validation & Defaults
```python
def _validate_response(self, data: dict) -> dict:
    """
    Validate and normalize response data
    """
    # Ensure required fields exist
    if "sentiment" not in data:
        data["sentiment"] = self._default_sentiment()
    
    if "keywords" not in data:
        data["keywords"] = []
    
    # Validate score range
    score = data["sentiment"].get("score", 0.5)
    data["sentiment"]["score"] = max(0, min(1, score))
    
    return data
```

## 🚀 Performance Optimizations

### Connection Pooling
- Reuse HTTP connections across requests
- Maintain persistent client instances
- Reduces connection overhead

### Async Operations
- All API calls are async
- Non-blocking I/O operations
- Concurrent request handling

### Caching Strategy (Future)
```python
# Cache recent analyses
cache = {}
cache_key = hashlib.md5(text.encode()).hexdigest()
if cache_key in cache:
    return cache[cache_key]
```

## 🧪 Testing Services

### Unit Tests
```python
async def test_sentiment_analysis():
    service = LLMService()
    result = await service.analyze_sentiment("I love this!")
    
    assert result["sentiment"]["type"] == "positive"
    assert result["sentiment"]["score"] > 0.7
    assert len(result["keywords"]) > 0
```

### Mock Responses
```python
# For testing without API calls
MOCK_RESPONSES = {
    "positive": {
        "sentiment": {"score": 0.9, "type": "positive", "intensity": "strong"},
        "keywords": ["love", "great", "amazing"]
    },
    "negative": {
        "sentiment": {"score": 0.2, "type": "negative", "intensity": "moderate"},
        "keywords": ["frustrating", "difficult", "problem"]
    }
}
```

## 📈 Monitoring & Metrics

### Tracked Metrics
- API call latency
- Success/failure rates
- Token usage
- Cost per request
- Cache hit rate

### Logging
```python
import logging

logger = logging.getLogger(__name__)
logger.info(f"Analyzing text: {text[:50]}...")
logger.error(f"API call failed: {error}")
```

## 🔮 Future Enhancements

1. **Multi-language Support**: Detect and analyze in multiple languages
2. **Custom Fine-tuning**: Use fine-tuned models for better accuracy
3. **Streaming Responses**: Stream results for long texts
4. **Context Awareness**: Maintain conversation context
5. **Emotion Categories**: More nuanced emotion detection
6. **Confidence Scores**: Return confidence levels for predictions

---

*The intelligent core of Sentiment Aura's analysis engine*
