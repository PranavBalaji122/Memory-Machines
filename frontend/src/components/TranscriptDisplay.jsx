/**
 * TranscriptDisplay Component
 * Displays live transcription with auto-scrolling functionality
 * Features smooth animations and visual distinction between interim/final transcripts
 */

import React, { useRef, useEffect } from 'react';
import './TranscriptDisplay.css';

/**
 * @param {Object} props
 * @param {Array} props.transcript - Array of transcript objects
 * @param {boolean} props.isRecording - Current recording state
 */
function TranscriptDisplay({ transcript = [], isRecording }) {
  const scrollContainerRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  
  /**
   * Auto-scroll to bottom when new transcripts arrive
   * Only scrolls if user hasn't manually scrolled up
   */
  useEffect(() => {
    if (scrollContainerRef.current && shouldAutoScroll.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [transcript]);
  
  /**
   * Detect manual scrolling by user
   */
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Check if user scrolled away from bottom (with 50px threshold)
      shouldAutoScroll.current = scrollHeight - (scrollTop + clientHeight) < 50;
    }
  };
  
  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="transcript-display">
      <div 
        className="transcript-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {transcript.length === 0 ? (
          <div className="transcript-empty">
            {isRecording ? (
              <>
                <div className="listening-indicator">
                  <span className="pulse-dot"></span>
                  <span>Listening...</span>
                </div>
                <p>Start speaking to see transcription</p>
              </>
            ) : (
              <p>Click "Start Recording" to begin transcription</p>
            )}
          </div>
        ) : (
          <div className="transcript-content">
            {transcript.map((item, index) => (
              <div 
                key={index}
                className={`transcript-item ${item.isFinal ? 'final' : 'interim'}`}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <span className="transcript-time">
                  {formatTime(item.timestamp)}
                </span>
                <span className="transcript-text">
                  {item.text}
                </span>
                {!item.isFinal && (
                  <span className="interim-indicator" title="Processing...">
                    ⋯
                  </span>
                )}
              </div>
            ))}
            
            {/* Auto-scroll anchor */}
            <div className="scroll-anchor" />
          </div>
        )}
      </div>
      
      {/* Scroll to bottom button (appears when user scrolls up) */}
      {!shouldAutoScroll.current && transcript.length > 0 && (
        <button
          className="scroll-to-bottom"
          onClick={() => {
            shouldAutoScroll.current = true;
            scrollContainerRef.current?.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }}
          aria-label="Scroll to bottom"
        >
          ↓ Jump to latest
        </button>
      )}
    </div>
  );
}

export default React.memo(TranscriptDisplay);
