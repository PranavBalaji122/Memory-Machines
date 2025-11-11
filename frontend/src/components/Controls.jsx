/**
 * Controls Component
 * Recording controls with visual feedback and error handling
 * Features a clear recording indicator with pulsing animation
 */

import React, { useState, useEffect } from 'react';
import './Controls.css';

/**
 * @param {Object} props
 * @param {boolean} props.isRecording - Current recording state
 * @param {Function} props.onStart - Start recording callback
 * @param {Function} props.onStop - Stop recording callback
 * @param {string|null} props.error - Error message to display
 * @param {boolean} props.isConnected - WebSocket connection status
 */
function Controls({ isRecording, onStart, onStop, error, isConnected }) {
  const [isHovered, setIsHovered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  
  /**
   * Check microphone permission status on mount
   */
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' })
        .then(permissionStatus => {
          setPermissionStatus(permissionStatus.state);
          permissionStatus.addEventListener('change', () => {
            setPermissionStatus(permissionStatus.state);
          });
        })
        .catch(() => {
          // Permissions API not supported, assume prompt state
          setPermissionStatus('prompt');
        });
    }
  }, []);
  
  /**
   * Handle record button click
   */
  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };
  
  /**
   * Determine button state and styling
   */
  const getButtonState = () => {
    if (isRecording) return 'recording';
    if (error) return 'error';
    if (permissionStatus === 'denied') return 'permission-denied';
    return 'idle';
  };
  
  const buttonState = getButtonState();
  
  return (
    <div className="controls">
      <div className="controls-main">
        <button
          className={`record-button ${buttonState}`}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={buttonState === 'error' || buttonState === 'permission-denied'}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <div className="button-content">
            {/* Recording indicator dot */}
            {isRecording && (
              <span className="recording-dot">
                <span className="recording-dot-inner" />
              </span>
            )}
            
            {/* Microphone icon */}
            <svg 
              className="mic-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              {isRecording ? (
                // Stop icon when recording
                <rect x="6" y="6" width="12" height="12" rx="2" />
              ) : (
                // Microphone icon when idle
                <>
                  <path d="M12 2a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
                  <path d="M12 18v4" />
                  <path d="M8 18h8" />
                  <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
                </>
              )}
            </svg>
            
            {/* Button text */}
            <span className="button-text">
              {buttonState === 'recording' && 'Stop Recording'}
              {buttonState === 'idle' && 'Start Recording'}
              {buttonState === 'error' && 'Try Again'}
              {buttonState === 'permission-denied' && 'Permission Denied'}
            </span>
          </div>
          
          {/* Ripple effect on hover */}
          {isHovered && buttonState === 'idle' && (
            <span className="button-ripple" />
          )}
        </button>
        
        {/* Visual recording indicator */}
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-pulse" />
            <span className="recording-text">Recording in progress</span>
          </div>
        )}
        
        {/* Connection status */}
        {!isRecording && (
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot" />
            <span className="status-text">
              {isConnected ? 'Ready to record' : 'Connecting to service...'}
            </span>
          </div>
        )}
      </div>
      
      {/* Error display */}
      {error && (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="error-text">{error}</span>
          <button 
            className="error-dismiss"
            onClick={() => window.location.reload()}
            aria-label="Dismiss error"
          >
            Refresh
          </button>
        </div>
      )}
      
      {/* Permission helper */}
      {permissionStatus === 'denied' && (
        <div className="permission-help">
          <p>🎤 Microphone access is required</p>
          <p>Please enable microphone in your browser settings and refresh the page</p>
        </div>
      )}
      
      {/* Instructions for first-time users */}
      {!isRecording && !error && permissionStatus === 'prompt' && (
        <div className="instructions">
          <p>Click the button above to start recording</p>
          <p>Your browser will ask for microphone permission</p>
        </div>
      )}
    </div>
  );
}

export default React.memo(Controls);
