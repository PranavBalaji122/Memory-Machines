"""
Settings Module
Application configuration loaded from environment variables
"""

import os
import json
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    """
    Application settings with environment variable loading
    Provides centralized configuration management
    """
    
    def __init__(self):
        # API Keys - At least one must be provided
        self.GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
        self.OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
        self.ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
        self.GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
        
        # Server Configuration
        self.PORT: int = int(os.getenv("PORT", "8000"))
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.DEBUG: bool = os.getenv("DEBUG", "False").lower() in ["true", "1", "yes"]
        self.ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        
        # CORS Configuration
        cors_origins = os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
        try:
            self.CORS_ORIGINS: List[str] = json.loads(cors_origins)
        except json.JSONDecodeError:
            self.CORS_ORIGINS: List[str] = ["http://localhost:3000"]
        
        # API Configuration
        self.MAX_TIMEOUT: int = int(os.getenv("MAX_TIMEOUT", "10"))
        self.MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
        self.MAX_TEXT_LENGTH: int = int(os.getenv("MAX_TEXT_LENGTH", "5000"))
        self.MIN_TEXT_LENGTH: int = int(os.getenv("MIN_TEXT_LENGTH", "10"))
        
        # Model Selection
        self.DEFAULT_GROQ_MODEL: str = os.getenv("DEFAULT_GROQ_MODEL", "llama-3.3-70b-versatile")
        self.DEFAULT_OPENAI_MODEL: str = os.getenv("DEFAULT_OPENAI_MODEL", "gpt-3.5-turbo")
        self.DEFAULT_ANTHROPIC_MODEL: str = os.getenv("DEFAULT_ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
        self.DEFAULT_GEMINI_MODEL: str = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-pro")
        
        # Model Parameters
        self.MODEL_TEMPERATURE: float = float(os.getenv("MODEL_TEMPERATURE", "0.3"))
        self.MODEL_MAX_TOKENS: int = int(os.getenv("MODEL_MAX_TOKENS", "150"))
        
        # Rate Limiting (for future implementation)
        self.RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
        self.RATE_LIMIT_PERIOD: int = int(os.getenv("RATE_LIMIT_PERIOD", "60"))  # seconds
        
        # Caching Configuration (for future implementation)
        self.CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "False").lower() in ["true", "1", "yes"]
        self.CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes
        
        # Logging Configuration
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO" if not self.DEBUG else "DEBUG")
        self.LOG_FILE: str = os.getenv("LOG_FILE", "app.log")
        
        # Security Headers
        self.ENABLE_SECURITY_HEADERS: bool = os.getenv("ENABLE_SECURITY_HEADERS", "True").lower() in ["true", "1", "yes"]
        
        # Feature Flags
        self.ENABLE_BATCH_PROCESSING: bool = os.getenv("ENABLE_BATCH_PROCESSING", "False").lower() in ["true", "1", "yes"]
        self.ENABLE_MULTI_LANGUAGE: bool = os.getenv("ENABLE_MULTI_LANGUAGE", "False").lower() in ["true", "1", "yes"]
        self.ENABLE_ANALYTICS: bool = os.getenv("ENABLE_ANALYTICS", "False").lower() in ["true", "1", "yes"]
        
        # Performance Settings
        self.CONNECTION_POOL_SIZE: int = int(os.getenv("CONNECTION_POOL_SIZE", "10"))
        self.WORKER_PROCESSES: int = int(os.getenv("WORKER_PROCESSES", "1"))
        
        # Validate configuration on initialization
        self.validate()
    
    def validate(self):
        """
        Validate configuration settings
        Raises ValueError if configuration is invalid
        """
        # Check that at least one API key is provided
        if not any([self.GROQ_API_KEY, self.OPENAI_API_KEY, self.ANTHROPIC_API_KEY, self.GEMINI_API_KEY]):
            print("⚠️ Warning: No LLM API keys configured!")
            print("   Please set one of: GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY")
        
        # Validate port range
        if not (1 <= self.PORT <= 65535):
            raise ValueError(f"Invalid port number: {self.PORT}")
        
        # Validate timeout values
        if self.MAX_TIMEOUT <= 0:
            raise ValueError(f"MAX_TIMEOUT must be positive: {self.MAX_TIMEOUT}")
        
        if self.MAX_RETRIES < 0:
            raise ValueError(f"MAX_RETRIES must be non-negative: {self.MAX_RETRIES}")
        
        # Validate text length constraints
        if self.MIN_TEXT_LENGTH >= self.MAX_TEXT_LENGTH:
            raise ValueError(f"MIN_TEXT_LENGTH must be less than MAX_TEXT_LENGTH")
        
        # Validate temperature range
        if not (0 <= self.MODEL_TEMPERATURE <= 2):
            raise ValueError(f"MODEL_TEMPERATURE must be between 0 and 2: {self.MODEL_TEMPERATURE}")
        
        print("✅ Configuration validated successfully")
    
    def get_active_provider(self) -> Optional[str]:
        """
        Get the active LLM provider based on available API keys
        Priority: Groq > OpenAI > Anthropic > Gemini
        """
        if self.GROQ_API_KEY:
            return "groq"
        elif self.OPENAI_API_KEY:
            return "openai"
        elif self.ANTHROPIC_API_KEY:
            return "anthropic"
        elif self.GEMINI_API_KEY:
            return "gemini"
        return None
    
    def get_model_for_provider(self, provider: str) -> str:
        """
        Get the default model for a given provider
        """
        models = {
            "groq": self.DEFAULT_GROQ_MODEL,
            "openai": self.DEFAULT_OPENAI_MODEL,
            "anthropic": self.DEFAULT_ANTHROPIC_MODEL,
            "gemini": self.DEFAULT_GEMINI_MODEL
        }
        return models.get(provider, "unknown")
    
    def to_dict(self) -> dict:
        """
        Convert settings to dictionary (for debugging)
        Excludes sensitive API keys
        """
        return {
            "PORT": self.PORT,
            "HOST": self.HOST,
            "DEBUG": self.DEBUG,
            "ENVIRONMENT": self.ENVIRONMENT,
            "CORS_ORIGINS": self.CORS_ORIGINS,
            "MAX_TIMEOUT": self.MAX_TIMEOUT,
            "MAX_RETRIES": self.MAX_RETRIES,
            "MAX_TEXT_LENGTH": self.MAX_TEXT_LENGTH,
            "MIN_TEXT_LENGTH": self.MIN_TEXT_LENGTH,
            "ACTIVE_PROVIDER": self.get_active_provider(),
            "MODEL_TEMPERATURE": self.MODEL_TEMPERATURE,
            "MODEL_MAX_TOKENS": self.MODEL_MAX_TOKENS,
            "CACHE_ENABLED": self.CACHE_ENABLED,
            "FEATURES": {
                "batch_processing": self.ENABLE_BATCH_PROCESSING,
                "multi_language": self.ENABLE_MULTI_LANGUAGE,
                "analytics": self.ENABLE_ANALYTICS
            }
        }
    
    def __repr__(self) -> str:
        """String representation of settings"""
        provider = self.get_active_provider() or "None"
        return f"<Settings: {self.ENVIRONMENT} | Provider: {provider} | Port: {self.PORT}>"

# Create global settings instance
settings = Settings()

# Export for convenience
__all__ = ["settings"]
