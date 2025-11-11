/**
 * KeywordsDisplay Component
 * Shows AI-extracted keywords with smooth, staggered fade-in animations
 * Keywords appear gracefully ONE BY ONE, not all at once
 */

import React, { useEffect, useState } from 'react';
import './KeywordsDisplay.css';

/**
 * @param {Object} props
 * @param {Array} props.keywords - Array of keyword objects with text, id, and delay
 * @param {boolean} props.isProcessing - Loading state indicator
 */
function KeywordsDisplay({ keywords = [], isProcessing }) {
  const [visibleKeywords, setVisibleKeywords] = useState([]);
  const [animatingKeywords, setAnimatingKeywords] = useState(new Set());
  
  /**
   * Gradually reveal keywords with staggered animation
   * This creates the smooth one-by-one appearance effect
   */
  useEffect(() => {
    // Add new keywords that aren't already visible
    const newKeywords = keywords.filter(k => 
      !visibleKeywords.find(vk => vk.id === k.id)
    );
    
    if (newKeywords.length > 0) {
      // Add keywords to visible list immediately (but they start invisible via CSS)
      setVisibleKeywords(prev => [...prev, ...newKeywords]);
      
      // Track which keywords are animating in
      newKeywords.forEach(keyword => {
        setAnimatingKeywords(prev => new Set(prev).add(keyword.id));
        
        // Remove from animating set after animation completes
        setTimeout(() => {
          setAnimatingKeywords(prev => {
            const next = new Set(prev);
            next.delete(keyword.id);
            return next;
          });
        }, 600 + (keyword.delay || 0)); // Animation duration + stagger delay
      });
    }
    
    // Clean up old keywords (keep last 20)
    if (visibleKeywords.length > 20) {
      setVisibleKeywords(prev => prev.slice(-20));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords]);
  
  /**
   * Calculate dynamic position for floating effect
   * Keywords are positioned in a scattered pattern
   */
  const getPositionStyle = (index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const randomOffset = {
      x: (Math.sin(index * 1.2) * 10),
      y: (Math.cos(index * 0.8) * 8)
    };
    
    return {
      '--position-x': `${col * 25 + randomOffset.x}%`,
      '--position-y': `${row * 60 + randomOffset.y}px`,
      '--float-distance': `${5 + (index % 3) * 3}px`
    };
  };
  
  /**
   * Determine keyword importance for sizing
   */
  const getImportanceClass = (keyword, index) => {
    // First 3 keywords are "important"
    if (index < 3) return 'keyword-important';
    // Random distribution for variety
    if (Math.random() > 0.7) return 'keyword-medium';
    return 'keyword-normal';
  };
  
  return (
    <div className="keywords-display">
      {visibleKeywords.length === 0 && !isProcessing ? (
        <div className="keywords-empty">
          <p>Keywords will appear as you speak...</p>
        </div>
      ) : (
        <div className="keywords-container">
          <div className="keywords-cloud">
            {visibleKeywords.map((keyword, index) => (
              <div
                key={keyword.id}
                className={`keyword-item ${
                  animatingKeywords.has(keyword.id) ? 'animating-in' : ''
                } ${getImportanceClass(keyword, index)}`}
                style={{
                  '--delay': `${keyword.delay || 0}ms`,
                  ...getPositionStyle(index)
                }}
              >
                <span className="keyword-text">
                  {keyword.text}
                </span>
                <span className="keyword-glow" />
              </div>
            ))}
          </div>
          
          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-spinner">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Extracting keywords...</p>
            </div>
          )}
        </div>
      )}
      
      {/* Particle effects for ambiance */}
      <div className="keyword-particles">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              '--particle-delay': `${i * 0.2}s`,
              '--particle-duration': `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(KeywordsDisplay);
