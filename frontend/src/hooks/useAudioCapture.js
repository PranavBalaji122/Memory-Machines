/**
 * useAudioCapture Hook
 * Manages Web Audio API and microphone access
 * Handles permissions, audio stream capture, and format conversion
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for capturing audio from user's microphone
 * @returns {Object} Hook interface with audio stream and controls
 */
function useAudioCapture() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  
  // Refs for audio resources
  const audioContext = useRef(null);
  const mediaStream = useRef(null);
  const audioTracks = useRef([]);
  
  /**
   * Check if browser supports getUserMedia
   */
  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Your browser does not support audio recording. Please use a modern browser.');
    }
    
    // Check for secure context (HTTPS)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Audio capture requires HTTPS in production');
    }
  };
  
  /**
   * Check microphone permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setPermissionState(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermissionState(result.state);
        });
      }
    } catch (err) {
      // Permissions API not supported, will handle during getUserMedia
      console.log('Permissions API not available');
    }
  }, []);
  
  /**
   * Start capturing audio from microphone
   * @returns {Promise<MediaStream>} The audio stream
   */
  const startCapture = useCallback(async () => {
    try {
      setError(null);
      
      // Check browser support
      checkBrowserSupport();
      
      // Check if already capturing
      if (isCapturing && mediaStream.current) {
        return mediaStream.current;
      }
      
      setIsCapturing(true);
      
      // Configure audio constraints for optimal transcription
      const constraints = {
        audio: {
          channelCount: 1,           // Mono audio for transcription
          sampleRate: 16000,         // 16kHz sample rate for Deepgram
          sampleSize: 16,            // 16-bit samples
          echoCancellation: true,    // Remove echo
          noiseSuppression: true,    // Remove background noise
          autoGainControl: true,     // Normalize volume
          deviceId: 'default'        // Use default microphone
        },
        video: false
      };
      
      // Request microphone access
      console.log('Requesting microphone access...');
      const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store the stream and tracks
      mediaStream.current = audioStream;
      audioTracks.current = audioStream.getAudioTracks();
      
      // Log audio track settings
      if (audioTracks.current.length > 0) {
        const settings = audioTracks.current[0].getSettings();
        console.log('Audio track settings:', settings);
      }
      
      // Create audio context for processing if needed
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000,
          latencyHint: 'interactive'
        });
      }
      
      // Set stream state
      setStream(audioStream);
      setPermissionState('granted');
      
      // Monitor track ended event
      audioTracks.current.forEach(track => {
        track.addEventListener('ended', () => {
          console.log('Audio track ended');
          stopCapture();
        });
      });
      
      console.log('Audio capture started successfully');
      return audioStream;
      
    } catch (err) {
      console.error('Failed to capture audio:', err);
      setIsCapturing(false);
      
      // Handle specific error cases
      let errorMessage = 'Failed to access microphone';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access denied. Please grant permission and try again.';
        setPermissionState('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use by another application.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Your microphone does not support the required settings.';
      } else if (err.name === 'TypeError') {
        errorMessage = 'Invalid configuration. Please refresh and try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapturing]);
  
  /**
   * Stop capturing audio and clean up resources
   */
  const stopCapture = useCallback(() => {
    console.log('Stopping audio capture...');
    
    // Stop all audio tracks
    if (audioTracks.current.length > 0) {
      audioTracks.current.forEach(track => {
        track.stop();
        console.log('Audio track stopped:', track.label);
      });
      audioTracks.current = [];
    }
    
    // Release the media stream
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    
    // Close audio context
    if (audioContext.current) {
      // Don't close immediately to avoid clicks
      setTimeout(() => {
        if (audioContext.current && audioContext.current.state !== 'closed') {
          audioContext.current.close();
          audioContext.current = null;
        }
      }, 100);
    }
    
    // Update state
    setStream(null);
    setIsCapturing(false);
    setError(null);
    
    console.log('Audio capture stopped');
  }, []);
  
  /**
   * Get audio level for visualization
   * @returns {number} Audio level from 0 to 1
   */
  const getAudioLevel = useCallback(() => {
    if (!audioContext.current || !mediaStream.current) {
      return 0;
    }
    
    try {
      const analyser = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(mediaStream.current);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      return average / 255;
    } catch (err) {
      return 0;
    }
  }, []);
  
  /**
   * Check permissions on mount
   */
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);
  
  return {
    stream,
    isCapturing,
    permissionState,
    error,
    startCapture,
    stopCapture,
    getAudioLevel
  };
}

export default useAudioCapture;
