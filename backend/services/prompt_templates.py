"""
Prompt Templates Module
Stores prompt templates for LLM interactions
Note: Prompt quality is NOT the focus - emphasis is on structured output
"""

# System prompt for the LLM
SYSTEM_PROMPT = """You are a sentiment analysis expert. Your task is to analyze text and extract emotional sentiment along with key topics.

You must always return a valid JSON response in the exact format specified. Do not include any additional text or explanation outside the JSON structure."""

# Main sentiment analysis prompt template
SENTIMENT_ANALYSIS_PROMPT = """Analyze the sentiment and extract keywords from the following text:

"{text}"

Return your analysis as a JSON object with this exact structure:
{{
  "sentiment": {{
    "score": <float between 0 and 1, where 0 is most negative and 1 is most positive>,
    "type": "<one of: positive, negative, neutral>",
    "intensity": "<one of: weak, moderate, strong>"
  }},
  "keywords": [<array of 3-7 most important words or short phrases from the text>]
}}

Guidelines:
- Score: 0.0-0.33 = negative, 0.34-0.66 = neutral, 0.67-1.0 = positive
- Intensity: Based on how strongly the emotion is expressed
- Keywords: Extract the most meaningful terms, avoid common words
- Return ONLY the JSON object, no other text"""

# Alternative simpler prompt for fallback
SIMPLE_SENTIMENT_PROMPT = """Rate the sentiment of this text from 0 to 1 and list key topics:
"{text}"

JSON format:
{{"sentiment": {{"score": 0.X, "type": "...", "intensity": "..."}}, "keywords": ["..."]}}"""

# Batch processing prompt template (future use)
BATCH_ANALYSIS_PROMPT = """Analyze the sentiment for each of these texts:

{texts}

Return an array of JSON objects, one for each text, with sentiment and keywords."""

def get_formatted_prompt(text: str) -> str:
    """
    Format the sentiment analysis prompt with the given text
    
    Args:
        text: The text to analyze
        
    Returns:
        Formatted prompt string
    """
    return SENTIMENT_ANALYSIS_PROMPT.format(text=text)

def get_simple_prompt(text: str) -> str:
    """
    Format the simple sentiment prompt (used as fallback)
    
    Args:
        text: The text to analyze
        
    Returns:
        Formatted simple prompt
    """
    return SIMPLE_SENTIMENT_PROMPT.format(text=text)

def get_batch_prompt(texts: list) -> str:
    """
    Format the batch analysis prompt
    
    Args:
        texts: List of texts to analyze
        
    Returns:
        Formatted batch prompt
    """
    formatted_texts = "\n".join([f"{i+1}. {text}" for i, text in enumerate(texts)])
    return BATCH_ANALYSIS_PROMPT.format(texts=formatted_texts)

# Example responses for testing/documentation
EXAMPLE_POSITIVE_RESPONSE = {
    "sentiment": {
        "score": 0.92,
        "type": "positive",
        "intensity": "strong"
    },
    "keywords": ["excited", "amazing", "opportunity", "success", "celebration"]
}

EXAMPLE_NEGATIVE_RESPONSE = {
    "sentiment": {
        "score": 0.18,
        "type": "negative",
        "intensity": "strong"
    },
    "keywords": ["frustrated", "problem", "difficult", "failed", "disappointed"]
}

EXAMPLE_NEUTRAL_RESPONSE = {
    "sentiment": {
        "score": 0.51,
        "type": "neutral",
        "intensity": "weak"
    },
    "keywords": ["information", "process", "update", "standard", "routine"]
}

# Prompt variations for different providers (if needed)
PROVIDER_PROMPTS = {
    "openai": SENTIMENT_ANALYSIS_PROMPT,
    "anthropic": SENTIMENT_ANALYSIS_PROMPT,
    "gemini": SENTIMENT_ANALYSIS_PROMPT  # Gemini might need slight adjustments
}

# Keywords to filter out (common words that don't add value)
FILTER_KEYWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "can", "shall", "it", "this", "that",
    "these", "those", "i", "you", "he", "she", "we", "they", "what", "which"
}

def filter_keywords(keywords: list) -> list:
    """
    Filter out common words from keywords list
    
    Args:
        keywords: Raw keywords list
        
    Returns:
        Filtered keywords list
    """
    return [k for k in keywords if k.lower() not in FILTER_KEYWORDS]
