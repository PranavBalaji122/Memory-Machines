/**
 * useSentimentProcessor Hook
 * Makes API calls to backend for sentiment analysis and keyword extraction
 * Implements debouncing to only process final transcripts
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for processing text sentiment and extracting keywords
 * @returns {Object} Hook interface with sentiment data and processing function
 */
function useSentimentProcessor() {
  const [sentiment, setSentiment] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for debouncing and request management
  const debounceTimer = useRef(null);
  const abortController = useRef(null);
  const lastProcessedText = useRef('');
  const requestQueue = useRef([]);
  const processingLock = useRef(false);
  
  // Configuration
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const DEBOUNCE_DELAY = 500; // 500ms debounce
  const MIN_TEXT_LENGTH = 3; // Minimum text length to process (lowered for short phrases)
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  /**
   * Process text through backend sentiment analysis
   * Only processes final transcripts with debouncing
   * @param {string} text - Text to analyze
   * @param {boolean} isFinal - Whether this is a final transcript
   */
  const processText = useCallback(async (text, isFinal = true) => {
    try {
      // Only process final transcripts
      if (!isFinal) {
        console.log('Skipping interim transcript');
        return;
      }
      
      // Skip if text is too short
      if (!text || text.trim().length < MIN_TEXT_LENGTH) {
        console.log('Text too short to process');
        return;
      }
      
      // Skip if we've already processed this exact text
      if (text === lastProcessedText.current) {
        console.log('Text already processed');
        return;
      }
      
      // Clear any pending debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Debounce the request
      debounceTimer.current = setTimeout(async () => {
        // Add to queue if currently processing
        if (processingLock.current) {
          console.log('Adding to queue, currently processing');
          requestQueue.current.push(text);
          return;
        }
        
        // Set processing lock
        processingLock.current = true;
        setIsProcessing(true);
        setError(null);
        
        // Abort any pending request
        if (abortController.current) {
          abortController.current.abort();
        }
        
        // Create new abort controller for this request
        abortController.current = new AbortController();
        
        try {
          console.log('Processing text for sentiment:', text.substring(0, 50) + '...');
          
          // Make API request with retry logic
          let attempt = 0;
          let response = null;
          
          while (attempt < MAX_RETRIES && !response) {
            try {
              response = await axios.post(
                `${BACKEND_URL}/process_text`,
                { text: text },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  signal: abortController.current.signal,
                  timeout: 10000 // 10 second timeout
                }
              );
              
            } catch (err) {
              const currentAttempt = attempt;
              attempt++;
              
              if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
                console.log('Request was aborted');
                break;
              }
              
              if (currentAttempt < MAX_RETRIES - 1) {
                console.log(`Retry attempt ${currentAttempt + 1} after error:`, err.message);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (currentAttempt + 1)));
              } else {
                throw err;
              }
            }
          }
          
          if (response && response.data) {
            const data = response.data;
            
            // Validate response structure
            if (data.sentiment && typeof data.sentiment === 'object') {
              // Update sentiment state with smooth transition
              setSentiment(prevSentiment => {
                if (!prevSentiment) return data.sentiment;
                
                // Smooth transition between sentiments
                return {
                  score: (prevSentiment.score * 0.3) + (data.sentiment.score * 0.7),
                  type: data.sentiment.type,
                  intensity: data.sentiment.intensity
                };
              });
              
              console.log('Sentiment updated:', data.sentiment);
            }
            
            // Update keywords if present
            if (data.keywords && Array.isArray(data.keywords)) {
              setKeywords(data.keywords);
              console.log('Keywords extracted:', data.keywords);
            }
            
            // Mark this text as processed
            lastProcessedText.current = text;
          }
          
        } catch (err) {
          console.error('Failed to process sentiment:', err);
          
          // Handle specific error cases
          let errorMessage = 'Failed to analyze sentiment';
          
          if (err.response) {
            // Server responded with error
            if (err.response.status === 400) {
              errorMessage = 'Invalid text format';
            } else if (err.response.status === 500) {
              errorMessage = 'Sentiment analysis service unavailable';
            } else if (err.response.status === 503) {
              errorMessage = 'Service temporarily unavailable';
            } else {
              errorMessage = err.response.data?.message || errorMessage;
            }
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'Cannot connect to backend. Please ensure the server is running.';
          } else {
            // Other errors
            errorMessage = err.message || errorMessage;
          }
          
          setError(errorMessage);
          
          // Don't clear existing sentiment on error
          // This provides better UX by keeping last known state
        } finally {
          setIsProcessing(false);
          processingLock.current = false;
          
          // Process next item in queue if exists
          if (requestQueue.current.length > 0) {
            const nextText = requestQueue.current.shift();
            setTimeout(() => {
              processText(nextText, true);
            }, 100);
          }
        }
      }, DEBOUNCE_DELAY);
      
    } catch (err) {
      console.error('Unexpected error in processText:', err);
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  }, [BACKEND_URL]);
  
  /**
   * Clear all sentiment and keyword data
   */
  const clearData = useCallback(() => {
    setSentiment(null);
    setKeywords([]);
    setError(null);
    lastProcessedText.current = '';
    requestQueue.current = [];
  }, []);
  
  /**
   * Get sentiment color for visualization
   * @returns {Object} Color configuration
   */
  const getSentimentColor = useCallback(() => {
    if (!sentiment) {
      return { primary: '#666666', secondary: '#333333' };
    }
    
    const colors = {
      positive: {
        primary: '#4CAF50',
        secondary: '#81C784'
      },
      negative: {
        primary: '#F44336',
        secondary: '#EF5350'
      },
      neutral: {
        primary: '#2196F3',
        secondary: '#64B5F6'
      }
    };
    
    return colors[sentiment.type] || colors.neutral;
  }, [sentiment]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortController.current) {
        abortController.current.abort();
      }
      
      // Clear any pending timers
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
  
  return {
    sentiment,
    keywords,
    isProcessing,
    error,
    processText,
    clearData,
    getSentimentColor
  };
}

export default useSentimentProcessor;
