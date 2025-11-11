# ⚙️ Configuration Module

> Application configuration and settings management

## 📋 Overview

The configuration module centralizes all application settings, environment variables, and configuration parameters. It provides a single source of truth for application configuration.

## 📁 Module Structure

### settings.py

**Purpose**: Application configuration management

**Key Components**:

#### Settings Class
```python
class Settings:
    """Application settings loaded from environment variables"""
    
    # API Keys
    OPENAI_API_KEY: Optional[str]
    ANTHROPIC_API_KEY: Optional[str]
    GEMINI_API_KEY: Optional[str]
    
    # Server Configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = False
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # API Configuration
    MAX_TIMEOUT: int = 10  # seconds
    MAX_RETRIES: int = 3
    MAX_TEXT_LENGTH: int = 5000
    MIN_TEXT_LENGTH: int = 10
    
    # Model Selection
    DEFAULT_MODEL: str = "gpt-3.5-turbo"
```

## 🔐 Environment Variables

### Required (At least one)
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key  
- `GEMINI_API_KEY` - Google Gemini API key

### Optional Configuration
- `PORT` - Server port (default: 8000)
- `DEBUG` - Debug mode (default: False)
- `CORS_ORIGINS` - Allowed origins (default: ["http://localhost:3000"])
- `MAX_TIMEOUT` - Request timeout in seconds (default: 10)
- `MAX_RETRIES` - Maximum retry attempts (default: 3)

## 🎛️ Configuration Loading

### Environment File (.env)
```env
# API Keys (choose one or more)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# Server Settings
PORT=8000
DEBUG=True

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# API Limits
MAX_TIMEOUT=15
MAX_RETRIES=5
MAX_TEXT_LENGTH=10000
```

### Loading Priority
1. Environment variables
2. `.env` file
3. Default values

## 🔧 Configuration Categories

### Server Configuration
```python
# Development
PORT = 8000
HOST = "127.0.0.1"
DEBUG = True
RELOAD = True

# Production
PORT = 8080
HOST = "0.0.0.0"
DEBUG = False
RELOAD = False
```

### API Rate Limits
```python
# Request limits
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_PERIOD = 60  # seconds

# Token limits
MAX_TOKENS_PER_REQUEST = 150
MAX_TOKENS_PER_DAY = 100000
```

### Model Configuration
```python
# Model selection
MODELS = {
    "openai": {
        "default": "gpt-3.5-turbo",
        "alternative": "gpt-4",
        "temperature": 0.3,
        "max_tokens": 150
    },
    "anthropic": {
        "default": "claude-3-sonnet-20240229",
        "alternative": "claude-3-opus-20240229",
        "temperature": 0.3,
        "max_tokens": 150
    },
    "gemini": {
        "default": "gemini-pro",
        "temperature": 0.3,
        "max_output_tokens": 150
    }
}
```

### Timeout Settings
```python
# Timeout configuration
TIMEOUTS = {
    "api_call": 10,      # LLM API call timeout
    "total_request": 15, # Total request timeout
    "connection": 5      # Connection timeout
}
```

### Retry Configuration
```python
# Retry settings
RETRY_CONFIG = {
    "max_attempts": 3,
    "initial_delay": 1.0,  # seconds
    "exponential_base": 2,
    "max_delay": 10.0
}
```

## 🛡️ Security Configuration

### API Key Validation
```python
def validate_api_keys():
    """Ensure at least one API key is configured"""
    keys = [
        os.getenv("OPENAI_API_KEY"),
        os.getenv("ANTHROPIC_API_KEY"),
        os.getenv("GEMINI_API_KEY")
    ]
    
    if not any(keys):
        raise ValueError("No API keys configured")
```

### CORS Configuration
```python
# CORS settings
CORS_CONFIG = {
    "allow_origins": ["http://localhost:3000"],
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["*"],
    "max_age": 86400  # 24 hours
}
```

### Security Headers
```python
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
```

## 📊 Logging Configuration

```python
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default"
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "app.log",
            "formatter": "default"
        }
    },
    "root": {
        "level": "INFO" if not DEBUG else "DEBUG",
        "handlers": ["console", "file"]
    }
}
```

## 🚀 Environment-Specific Settings

### Development
```python
if ENVIRONMENT == "development":
    DEBUG = True
    RELOAD = True
    LOG_LEVEL = "DEBUG"
    CORS_ORIGINS = ["*"]
```

### Production
```python
if ENVIRONMENT == "production":
    DEBUG = False
    RELOAD = False
    LOG_LEVEL = "INFO"
    CORS_ORIGINS = ["https://yourdomain.com"]
    HTTPS_ONLY = True
```

### Testing
```python
if ENVIRONMENT == "testing":
    USE_MOCK_LLM = True
    DATABASE = "sqlite:///:memory:"
    CACHE_ENABLED = False
```

## 🔄 Dynamic Configuration

### Feature Flags
```python
FEATURES = {
    "batch_processing": False,
    "caching": True,
    "multi_language": False,
    "custom_models": False,
    "analytics": True
}
```

### Cache Configuration
```python
CACHE_CONFIG = {
    "enabled": True,
    "ttl": 300,  # 5 minutes
    "max_size": 1000,
    "backend": "memory"  # or "redis"
}
```

## 📈 Performance Tuning

```python
PERFORMANCE = {
    "connection_pool_size": 10,
    "max_connections": 100,
    "keepalive_timeout": 5,
    "request_timeout": 30,
    "worker_processes": 4,
    "threads_per_worker": 2
}
```

## 🧪 Configuration Validation

```python
def validate_configuration():
    """Validate all configuration settings"""
    
    # Check required settings
    assert PORT > 0 and PORT < 65536
    assert MAX_TIMEOUT > 0
    assert MAX_RETRIES > 0
    assert MAX_TEXT_LENGTH > MIN_TEXT_LENGTH
    
    # Check API keys
    assert any([
        OPENAI_API_KEY,
        ANTHROPIC_API_KEY,
        GEMINI_API_KEY
    ])
    
    # Validate CORS origins
    for origin in CORS_ORIGINS:
        assert origin.startswith("http")
    
    print("✅ Configuration validated successfully")
```

## 🔍 Configuration Access

```python
from config.settings import settings

# Access configuration
api_key = settings.OPENAI_API_KEY
port = settings.PORT
debug = settings.DEBUG

# Use in application
app = FastAPI(debug=settings.DEBUG)
```

---

*Centralized configuration management for Sentiment Aura*
