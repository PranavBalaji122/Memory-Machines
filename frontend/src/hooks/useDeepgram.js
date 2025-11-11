/**
 * useDeepgram Hook
 * Manages WebSocket connection to Deepgram API for real-time transcription
 * Handles audio streaming, transcript reception, and connection management
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Deepgram WebSocket transcription
 * @param {Object} config - Configuration object
 * @param {Function} config.onTranscript - Callback when transcript is received
 * @param {string} config.apiKey - Deepgram API key
 * @returns {Object} Hook interface with connection methods and state
 */
function useDeepgram({ onTranscript, apiKey }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  
  // Refs for WebSocket and audio processing
  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const processor = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  
  /**
   * Connect to Deepgram WebSocket with audio stream
   * @param {MediaStream} audioStream - Audio stream from getUserMedia
   */
  const connect = useCallback(async (audioStream) => {
    try {
      setError(null);
      
      // Validate API key
      if (!apiKey) {
        throw new Error('Deepgram API key is required');
      }
      
      // Create WebSocket connection to Deepgram
      const wsUrl = `wss://api.deepgram.com/v1/listen?` + new URLSearchParams({
        encoding: 'linear16',
        sample_rate: '16000',
        channels: '1',
        interim_results: 'true',
        punctuate: 'true',
        language: 'en-US',
        model: 'nova-2'
      });
      
      ws.current = new WebSocket(wsUrl, ['token', apiKey]);
      
      // Set up WebSocket event handlers
      ws.current.onopen = () => {
        console.log('Deepgram WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Start streaming audio
        startAudioStreaming(audioStream);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Extract transcript from Deepgram response
          if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
            const transcriptText = data.channel.alternatives[0].transcript;
            
            if (transcriptText) {
              setTranscript(transcriptText);
              
              // Call the callback with formatted data
              onTranscript({
                text: transcriptText,
                is_final: data.is_final || false,
                speech_final: data.speech_final || false,
                confidence: data.channel.alternatives[0].confidence || 0
              });
            }
          }
        } catch (err) {
          console.error('Error parsing Deepgram message:', err);
        }
      };
      
      ws.current.onerror = (event) => {
        console.error('Deepgram WebSocket error:', event);
        setError('Connection error occurred');
      };
      
      ws.current.onclose = (event) => {
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        stopAudioStreaming();
        
        // Handle reconnection for unexpected disconnects
        if (event.code !== 1000 && reconnectAttempts.current < 3) {
          handleReconnect(audioStream);
        }
      };
      
    } catch (err) {
      console.error('Failed to connect to Deepgram:', err);
      setError(err.message || 'Failed to connect');
      setIsConnected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, onTranscript]);
  
  /**
   * Start streaming audio to WebSocket
   * @param {MediaStream} audioStream - Audio stream to process
   */
  const startAudioStreaming = (audioStream) => {
    try {
      // Create audio context for processing
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContext.current.createMediaStreamSource(audioStream);
      processor.current = audioContext.current.createScriptProcessor(4096, 1, 1);
      
      // Process audio chunks and send to WebSocket
      processor.current.onaudioprocess = (e) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert float32 to int16 for Deepgram
          const output = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Send audio data to Deepgram
          ws.current.send(output.buffer);
        }
      };
      
      // Connect audio nodes
      source.connect(processor.current);
      processor.current.connect(audioContext.current.destination);
      
    } catch (err) {
      console.error('Error starting audio streaming:', err);
      setError('Failed to process audio');
    }
  };
  
  /**
   * Stop audio streaming and clean up resources
   */
  const stopAudioStreaming = () => {
    // Disconnect audio nodes
    if (processor.current) {
      processor.current.disconnect();
      processor.current = null;
    }
    
    // Close audio context
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    
    // Stop media recorder if exists
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current = null;
    }
  };
  
  /**
   * Handle reconnection with exponential backoff
   * @param {MediaStream} audioStream - Audio stream to reconnect with
   */
  const handleReconnect = useCallback((audioStream) => {
    reconnectAttempts.current++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
    
    console.log(`Attempting to reconnect in ${delay}ms...`);
    setError(`Connection lost. Reconnecting...`);
    
    reconnectTimeout.current = setTimeout(() => {
      connect(audioStream);
    }, delay);
  }, [connect]);
  
  /**
   * Disconnect from Deepgram WebSocket
   */
  const disconnect = useCallback(() => {
    // Clear any reconnection attempts
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    // Stop audio streaming
    stopAudioStreaming();
    
    // Close WebSocket connection
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
      ws.current = null;
    }
    
    setIsConnected(false);
    setTranscript('');
    setError(null);
    reconnectAttempts.current = 0;
  }, []);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    transcript,
    isConnected,
    error,
    connect,
    disconnect
  };
}

export default useDeepgram;
