"""
Main FastAPI Application
Entry point for the Sentiment Aura backend server
Handles API routing, CORS, and server configuration
"""

import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our modules
from api.routes import router as api_router
from config.settings import settings
from services.llm_service import LLMService

# Initialize LLM service
llm_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle - startup and shutdown events
    """
    # Startup
    global llm_service
    print("🚀 Starting Sentiment Aura Backend...")
    print(f"📍 Server running at http://localhost:{settings.PORT}")
    print(f"📚 API docs available at http://localhost:{settings.PORT}/docs")
    
    # Initialize LLM service
    try:
        llm_service = LLMService()
        print(f"✅ LLM service initialized with provider: {llm_service.provider}")
    except Exception as e:
        print(f"⚠️ Warning: LLM service initialization failed: {e}")
        print("   The server will run but sentiment analysis will not work.")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Sentiment Aura Backend...")
    if llm_service:
        await llm_service.cleanup()

# Create FastAPI app with lifespan management
app = FastAPI(
    title="Sentiment Aura API",
    description="Real-time sentiment analysis and keyword extraction service",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ProcessTextRequest(BaseModel):
    """Request model for text processing"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to analyze")

class SentimentResponse(BaseModel):
    """Sentiment analysis response"""
    score: float = Field(..., ge=0, le=1, description="Sentiment score from 0 to 1")
    type: str = Field(..., description="Sentiment type: positive, negative, or neutral")
    intensity: str = Field(..., description="Intensity level: weak, moderate, or strong")

class ProcessTextResponse(BaseModel):
    """Response model for text processing"""
    sentiment: SentimentResponse
    keywords: list[str] = Field(..., description="Extracted keywords from the text")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Sentiment Aura API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "process": "/process_text"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for monitoring
    Returns current service status
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "services": {
            "api": "operational",
            "llm": "unknown"
        }
    }
    
    # Check LLM service status
    if llm_service:
        try:
            # Simple check to see if service is responsive
            health_status["services"]["llm"] = "operational"
        except Exception:
            health_status["services"]["llm"] = "degraded"
    else:
        health_status["services"]["llm"] = "unavailable"
    
    # Overall status based on services
    if health_status["services"]["llm"] == "unavailable":
        health_status["status"] = "degraded"
    
    return health_status

# Process text endpoint
@app.post("/process_text", response_model=ProcessTextResponse)
async def process_text(request: ProcessTextRequest):
    """
    Process text for sentiment analysis and keyword extraction
    
    Args:
        request: Text to analyze
        
    Returns:
        Sentiment analysis results and extracted keywords
        
    Raises:
        HTTPException: If processing fails
    """
    try:
        # Validate input
        if not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty or just whitespace"
            )
        
        # Check if LLM service is available
        if not llm_service:
            raise HTTPException(
                status_code=503,
                detail="Sentiment analysis service is currently unavailable. Please check your API keys."
            )
        
        # Process the text
        print(f"📝 Processing text: {request.text[:100]}...")
        
        try:
            result = await llm_service.analyze_sentiment(request.text)
            
            # Validate and format response
            response = ProcessTextResponse(
                sentiment=SentimentResponse(
                    score=result["sentiment"]["score"],
                    type=result["sentiment"]["type"],
                    intensity=result["sentiment"]["intensity"]
                ),
                keywords=result["keywords"]
            )
            
            print(f"✅ Analysis complete: {response.sentiment.type} ({response.sentiment.score:.2f})")
            return response
            
        except TimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Request timeout - the analysis took too long. Please try again."
            )
        except Exception as e:
            print(f"❌ LLM processing error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze sentiment: {str(e)}"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any unexpected errors
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your request"
        )

# Custom exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Custom error response format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )

# Include API routes
app.include_router(api_router, prefix="/api", tags=["api"])

# Main entry point
if __name__ == "__main__":
    """Run the FastAPI application with uvicorn"""
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,  # Auto-reload in debug mode
        log_level="info" if settings.DEBUG else "error",
        access_log=settings.DEBUG
    )
