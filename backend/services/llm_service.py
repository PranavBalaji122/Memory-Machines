"""
LLM Service Module
Handles API calls to chosen LLM provider (OpenAI/Anthropic/Gemini)
Provides unified interface for sentiment analysis and keyword extraction
"""

import os
import json
import re
import asyncio
import time
from typing import Dict, Any, Optional, List
from enum import Enum

# Import provider SDKs conditionally
try:
    import openai
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    from anthropic import AsyncAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from .prompt_templates import (
    SENTIMENT_ANALYSIS_PROMPT,
    SYSTEM_PROMPT,
    get_formatted_prompt
)

class LLMProvider(Enum):
    """Supported LLM providers"""
    GROQ = "groq"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    NONE = "none"

class LLMService:
    """
    Unified service for LLM interactions
    Automatically selects provider based on available API keys
    """
    
    def __init__(self):
        """Initialize LLM service with appropriate provider"""
        self.provider = self._detect_provider()
        self.client = None
        self.api_key = None
        self.max_retries = 3
        self.timeout = 10  # seconds
        
        # Initialize the appropriate client
        if self.provider == LLMProvider.GROQ:
            self._init_groq()
        elif self.provider == LLMProvider.OPENAI:
            self._init_openai()
        elif self.provider == LLMProvider.ANTHROPIC:
            self._init_anthropic()
        elif self.provider == LLMProvider.GEMINI:
            self._init_gemini()
        else:
            raise ValueError("No LLM API keys found. Please set GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY")
    
    def _detect_provider(self) -> LLMProvider:
        """Detect which LLM provider to use based on available API keys"""
        if os.getenv("GROQ_API_KEY") and GROQ_AVAILABLE:
            return LLMProvider.GROQ
        elif os.getenv("OPENAI_API_KEY") and OPENAI_AVAILABLE:
            return LLMProvider.OPENAI
        elif os.getenv("ANTHROPIC_API_KEY") and ANTHROPIC_AVAILABLE:
            return LLMProvider.ANTHROPIC
        elif os.getenv("GEMINI_API_KEY") and GEMINI_AVAILABLE:
            return LLMProvider.GEMINI
        else:
            return LLMProvider.NONE
    
    def _init_openai(self):
        """Initialize OpenAI client"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not found")
        self.client = AsyncOpenAI(api_key=self.api_key)
        print("✅ Initialized OpenAI provider")
    
    def _init_anthropic(self):
        """Initialize Anthropic client"""
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key not found")
        self.client = AsyncAnthropic(api_key=self.api_key)
        print("✅ Initialized Anthropic provider")
    
    def _init_gemini(self):
        """Initialize Google Gemini client"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key not found")
        genai.configure(api_key=self.api_key)
        self.client = genai.GenerativeModel('gemini-pro')
        print("✅ Initialized Gemini provider")
    
    def _init_groq(self):
        """Initialize Groq client"""
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("Groq API key not found")
        self.client = AsyncGroq(api_key=self.api_key)
        print("✅ Initialized Groq provider")
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Main method for sentiment analysis
        Returns sentiment scores and extracted keywords
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment and keywords
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Truncate text if too long
        max_length = 3000
        if len(text) > max_length:
            text = text[:max_length] + "..."
        
        # Call appropriate provider with retry logic
        for attempt in range(self.max_retries):
            try:
                # Set timeout for the API call
                result = await asyncio.wait_for(
                    self._call_provider(text),
                    timeout=self.timeout
                )
                
                # Validate and return result
                return self._validate_response(result)
                
            except asyncio.TimeoutError:
                if attempt < self.max_retries - 1:
                    print(f"⏱️ Timeout on attempt {attempt + 1}, retrying...")
                    await asyncio.sleep(1 * (attempt + 1))
                else:
                    raise TimeoutError("LLM API call timed out after multiple attempts")
            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    print(f"⚠️ Error on attempt {attempt + 1}: {e}")
                    await asyncio.sleep(1 * (attempt + 1))
                else:
                    raise
    
    async def _call_provider(self, text: str) -> Dict[str, Any]:
        """Route to appropriate provider method"""
        if self.provider == LLMProvider.GROQ:
            return await self._call_groq(text)
        elif self.provider == LLMProvider.OPENAI:
            return await self._call_openai(text)
        elif self.provider == LLMProvider.ANTHROPIC:
            return await self._call_anthropic(text)
        elif self.provider == LLMProvider.GEMINI:
            return await self._call_gemini(text)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    async def _call_groq(self, text: str) -> Dict[str, Any]:
        """
        Call Groq API for sentiment analysis
        Uses Llama 3.3 70B for fast, high-quality inference
        """
        prompt = get_formatted_prompt(text)
        
        try:
            response = await self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Fast Llama 3.3 model
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Low temperature for consistency
                max_tokens=150,   # Limit response length
                response_format={"type": "json_object"}  # Force JSON response
            )
            
            content = response.choices[0].message.content
            parsed = self._parse_response(content)
            validated = self._validate_response(parsed)
            return validated
            
        except Exception as e:
            print(f"❌ Groq API error: {e}")
            raise
    
    async def _call_openai(self, text: str) -> Dict[str, Any]:
        """
        Call OpenAI API for sentiment analysis
        Uses GPT-3.5-turbo by default for speed and cost efficiency
        """
        prompt = get_formatted_prompt(text)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # Fast and efficient
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Low temperature for consistency
                max_tokens=150,   # Limit response length
                response_format={"type": "json_object"}  # Force JSON response
            )
            
            content = response.choices[0].message.content
            parsed = self._parse_response(content)
            return self._validate_response(parsed)
            
        except Exception as e:
            print(f"❌ OpenAI API error: {e}")
            raise
    
    async def _call_anthropic(self, text: str) -> Dict[str, Any]:
        """
        Call Anthropic Claude API for sentiment analysis
        Uses Claude 3 Sonnet for balanced performance
        """
        prompt = get_formatted_prompt(text)
        
        try:
            response = await self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=150,
                temperature=0.3,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.content[0].text
            parsed = self._parse_response(content)
            return self._validate_response(parsed)
            
        except Exception as e:
            print(f"❌ Anthropic API error: {e}")
            raise
    
    async def _call_gemini(self, text: str) -> Dict[str, Any]:
        """
        Call Google Gemini API for sentiment analysis
        Uses Gemini Pro model
        """
        prompt = get_formatted_prompt(text)
        full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt}"
        
        try:
            response = await self.client.generate_content_async(
                full_prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 150,
                    "top_p": 0.9,
                    "top_k": 40
                }
            )
            
            content = response.text
            parsed = self._parse_response(content)
            return self._validate_response(parsed)
            
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            raise
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse LLM response to extract JSON
        Handles various response formats
        """
        if not response_text:
            return self._get_default_response()
        
        try:
            # Try direct JSON parsing
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Try to find JSON-like structure in the text
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    pass
            
            # If all parsing fails, return default
            print(f"⚠️ Failed to parse LLM response: {response_text[:200]}")
            return self._get_default_response()
    
    def _validate_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and normalize response data
        Ensures required fields exist with proper types
        """
        # Ensure sentiment exists
        if "sentiment" not in data:
            data["sentiment"] = self._get_default_sentiment()
        
        sentiment = data["sentiment"]
        
        # Validate and normalize score
        if "score" in sentiment:
            score = sentiment["score"]
            # Ensure score is float between 0 and 1
            try:
                score = float(score)
                sentiment["score"] = max(0.0, min(1.0, score))
            except (TypeError, ValueError):
                sentiment["score"] = 0.5
        else:
            sentiment["score"] = 0.5
        
        # Validate type
        valid_types = ["positive", "negative", "neutral"]
        if "type" not in sentiment or sentiment["type"] not in valid_types:
            # Determine type based on score
            if sentiment["score"] > 0.66:
                sentiment["type"] = "positive"
            elif sentiment["score"] < 0.33:
                sentiment["type"] = "negative"
            else:
                sentiment["type"] = "neutral"
        
        # Validate intensity
        valid_intensities = ["weak", "moderate", "strong"]
        if "intensity" not in sentiment or sentiment["intensity"] not in valid_intensities:
            # Determine intensity based on score distance from neutral
            distance = abs(sentiment["score"] - 0.5)
            if distance < 0.17:
                sentiment["intensity"] = "weak"
            elif distance < 0.34:
                sentiment["intensity"] = "moderate"
            else:
                sentiment["intensity"] = "strong"
        
        # Ensure keywords exist and are a list
        if "keywords" not in data or not isinstance(data["keywords"], list):
            data["keywords"] = []
        else:
            # Filter and clean keywords
            keywords = []
            for keyword in data["keywords"][:7]:  # Limit to 7 keywords
                if isinstance(keyword, str) and keyword.strip():
                    keywords.append(keyword.strip().lower())
            data["keywords"] = keywords
        
        return data
    
    def _get_default_response(self) -> Dict[str, Any]:
        """Return default response structure"""
        return {
            "sentiment": self._get_default_sentiment(),
            "keywords": []
        }
    
    def _get_default_sentiment(self) -> Dict[str, Any]:
        """Return default sentiment structure"""
        return {
            "score": 0.5,
            "type": "neutral",
            "intensity": "moderate"
        }
    
    async def cleanup(self):
        """Cleanup resources"""
        # Close any open connections
        if hasattr(self.client, 'close'):
            await self.client.close()
        print("🧹 LLM service cleaned up")
