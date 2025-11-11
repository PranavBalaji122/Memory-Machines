/**
 * Main Application Component
 * Orchestrates audio capture, transcription, sentiment analysis, and visualization
 */

import React, { useState, useCallback, useEffect } from 'react';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import Controls from './components/Controls';
import AuraVisualization from './components/AuraVisualization';
import useDeepgram from './hooks/useDeepgram';
import useAudioCapture from './hooks/useAudioCapture';
import useSentimentProcessor from './hooks/useSentimentProcessor';
import './styles/App.css';

function App() {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentSentiment, setCurrentSentiment] = useState(null);
  const [currentKeywords, setCurrentKeywords] = useState([]);
  const [error, setError] = useState(null);
  
  // Custom hooks for core functionality
  const { 
    startCapture, 
    stopCapture, 
    error: audioError 
  } = useAudioCapture();
  
  const {
    isConnected,
    connect: connectDeepgram,
    disconnect: disconnectDeepgram,
    error: deepgramError
  } = useDeepgram({
    onTranscript: handleTranscript,
    apiKey: process.env.REACT_APP_DEEPGRAM_API_KEY
  });
  
  const {
    sentiment,
    keywords,
    isProcessing,
    processText,
    error: sentimentError
  } = useSentimentProcessor();

  /**
   * Handles incoming transcripts from Deepgram
   * @param {Object} data - Transcript data from Deepgram
   */
  function handleTranscript(data) {
    if (data.text && data.text.trim()) {
      // Add to transcript display
      setTranscript(prev => [...prev, {
        text: data.text,
        timestamp: new Date().toISOString(),
        isFinal: data.is_final
      }]);
      
      // Process final transcripts for sentiment
      if (data.is_final) {
        processText(data.text);
      }
    }
  }

  /**
   * Starts recording and transcription
   */
  const handleStart = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      
      // Start audio capture
      const audioStream = await startCapture();
      
      // Connect to Deepgram with the audio stream
      await connectDeepgram(audioStream);
      
    } catch (err) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  }, [startCapture, connectDeepgram]);

  /**
   * Stops recording and transcription
   */
  const handleStop = useCallback(() => {
    setIsRecording(false);
    stopCapture();
    disconnectDeepgram();
  }, [stopCapture, disconnectDeepgram]);

  /**
   * Update sentiment and keywords when processed
   */
  useEffect(() => {
    if (sentiment) {
      setCurrentSentiment(sentiment);
    }
  }, [sentiment]);

  useEffect(() => {
    if (keywords && keywords.length > 0) {
      // Add new keywords with staggered animation delay
      const newKeywords = keywords.map((keyword, index) => ({
        text: keyword,
        id: Date.now() + index,
        delay: index * 150 // 150ms delay between each keyword
      }));
      setCurrentKeywords(prev => [...prev, ...newKeywords].slice(-20)); // Keep last 20 keywords
    }
  }, [keywords]);

  /**
   * Consolidate errors from different sources
   */
  useEffect(() => {
    const activeError = audioError || deepgramError || sentimentError;
    if (activeError) {
      setError(activeError);
    }
  }, [audioError, deepgramError, sentimentError]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Sentiment Aura</h1>
        <p className="tagline">Transform your words into living art</p>
      </header>
      
      <main className="app-main">
        <div className="visualization-container">
          <AuraVisualization 
            sentiment={currentSentiment}
            keywords={currentKeywords}
            isActive={isRecording}
          />
        </div>
        
        <div className="content-grid">
          <div className="transcript-section">
            <h2>📝 Live Transcription</h2>
            <TranscriptDisplay 
              transcript={transcript}
              isRecording={isRecording}
            />
          </div>
          
          <div className="keywords-section">
            <h2>🔑 Keywords</h2>
            <KeywordsDisplay 
              keywords={currentKeywords}
              isProcessing={isProcessing}
            />
          </div>
        </div>
        
        <div className="controls-section">
          <Controls
            isRecording={isRecording}
            onStart={handleStart}
            onStop={handleStop}
            error={error}
            isConnected={isConnected}
          />
          
          {isProcessing && (
            <div className="processing-indicator">
              <span className="pulse"></span>
              Analyzing sentiment...
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="status-bar">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {currentSentiment && (
            <span className="sentiment-status">
              Sentiment: {currentSentiment.type} ({(currentSentiment.score * 100).toFixed(0)}%)
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
