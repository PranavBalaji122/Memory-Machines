/**
 * AuraVisualization Component
 * Generative art visualization using Perlin noise fields
 * Responds to sentiment data with dynamic colors, flow, and energy
 * Based on techniques from: https://sighack.com/post/getting-creative-with-perlin-noise-fields
 */

import React, { useRef } from 'react';
import Sketch from 'react-p5';
import './AuraVisualization.css';

/**
 * @param {Object} props
 * @param {Object|null} props.sentiment - Sentiment data (score, type, intensity)
 * @param {Array} props.keywords - Keywords for additional visual elements
 * @param {boolean} props.isActive - Whether visualization should be animated
 */
function AuraVisualization({ sentiment, keywords = [], isActive }) {
  // Visualization parameters - these smoothly transition based on sentiment
  const params = useRef({
    // Color parameters
    hueBase: 200,        // Base hue for color palette
    hueTarget: 200,      // Target hue to transition to
    saturation: 70,      // More vibrant colors
    brightness: 90,      // Brighter particles
    
    // Flow parameters
    flowSpeed: 0.01,    // Faster animation
    flowScale: 0.005,     // Smoother flow field
    particleSpeed: 1.2,    // Speed multiplier for particles
    
    // Visual parameters
    particleCount: 800,  // Number of flow particles
    particleAlpha: 30,   // Transparency of particles
    fieldStrength: 0.15,    // Strength of flow field
    
    // Animation state
    time: 0,            // Animation time counter
    particles: []       // Particle array
  });
  
  /**
   * Map sentiment to visual parameters
   * This creates the data-driven visualization
   */
  const updateParametersFromSentiment = (p5) => {
    if (!sentiment) return;
    
    const { score, type, intensity } = sentiment;
    
    // Map sentiment type to color palette
    const targetHue = type === 'positive' ? 120 :  // Green for positive
                      type === 'negative' ? 0 :     // Red for negative
                      220;                          // Blue-purple for neutral
    
    const targetSat = type === 'neutral' ? 60 : 80 + (score * 20); // More saturation
    const targetBright = 80 + (score * 20); // Brighter overall
    
    // Map intensity to animation parameters
    const intensityMultiplier = intensity === 'strong' ? 1.0 : 
                                intensity === 'moderate' ? 0.75 : 0.5;
    
    // Smoothly transition parameters using lerp
    params.current.hueTarget = targetHue;
    params.current.saturation = p5.lerp(params.current.saturation, targetSat, 0.05);
    params.current.brightness = p5.lerp(params.current.brightness, targetBright, 0.05);
    
    // Adjust flow dynamics based on sentiment
    const targetSpeed = type === 'positive' ? 
      0.01 * intensityMultiplier : 
      0.003 * intensityMultiplier;
    
    params.current.flowSpeed = p5.lerp(params.current.flowSpeed, targetSpeed, 0.02);
    params.current.particleSpeed = p5.lerp(params.current.particleSpeed, 
      0.5 + score * 1.5 * intensityMultiplier, 0.02);
    
    // Adjust particle count based on intensity
    const targetParticles = 400 + (score * 600 * intensityMultiplier);
    if (params.current.particles.length < targetParticles) {
      // Add particles gradually
      for (let i = 0; i < 5; i++) {
        params.current.particles.push(createParticle(p5));
      }
    }
  };
  
  /**
   * Create a single particle for the flow field
   */
  const createParticle = (p5) => {
    return {
      x: p5.random(p5.width),
      y: p5.random(p5.height),
      vx: 0,
      vy: 0,
      age: 0,
      maxAge: p5.random(100, 300),
      size: p5.random(1, 3),
      hueOffset: p5.random(-20, 20)
    };
  };
  
  /**
   * Setup p5.js canvas
   */
  const setup = (p5, canvasParentRef) => {
    // Create canvas that fills container and attach it to the parent
    const canvas = p5.createCanvas(
      canvasParentRef.offsetWidth,
      canvasParentRef.offsetHeight
    );
    canvas.parent(canvasParentRef); // Explicitly set parent to ensure canvas is in the right place
    
    // Configure rendering
    p5.colorMode(p5.HSB, 360, 100, 100, 100);
    p5.background(0, 0, 0); // Pure black background
    p5.noStroke();
    p5.frameRate(60); // Target 60fps for smooth animation
    
    // Initialize particles with more count for better effect
    params.current.particles = [];
    params.current.particleCount = 800; // Increase particle count
    for (let i = 0; i < params.current.particleCount; i++) {
      params.current.particles.push(createParticle(p5));
    }
  };
  
  /**
   * Main drawing loop - executes 60 times per second
   */
  const draw = (p5) => {
    // Semi-transparent background for trail effect
    p5.fill(0, 0, 0, 10); // Darker background with more opacity for better trails
    p5.rect(0, 0, p5.width, p5.height);
    
    // Always animate for visual appeal, just with lower intensity when inactive
    // Animation is always active now for better visual appeal
    
    // Update parameters based on sentiment
    updateParametersFromSentiment(p5);
    
    // Smooth color transitions
    params.current.hueBase = p5.lerp(params.current.hueBase, params.current.hueTarget, 0.02);
    
    // Increment time for noise evolution
    params.current.time += params.current.flowSpeed;
    
    // Update and draw particles
    params.current.particles.forEach((particle, index) => {
      // Calculate Perlin noise angle at particle position
      const noiseScale = params.current.flowScale;
      const angle = p5.noise(
        particle.x * noiseScale,
        particle.y * noiseScale,
        params.current.time
      ) * p5.TWO_PI * 2;
      
      // Apply force from noise field
      const force = params.current.fieldStrength;
      particle.vx += p5.cos(angle) * force;
      particle.vy += p5.sin(angle) * force;
      
      // Apply velocity with damping
      particle.x += particle.vx * params.current.particleSpeed;
      particle.y += particle.vy * params.current.particleSpeed;
      particle.vx *= 0.97; // Damping
      particle.vy *= 0.97;
      
      // Age particle
      particle.age++;
      
      // Wrap around edges or respawn if too old
      if (particle.x < 0 || particle.x > p5.width ||
          particle.y < 0 || particle.y > p5.height ||
          particle.age > particle.maxAge) {
        params.current.particles[index] = createParticle(p5);
        return;
      }
      
      // Calculate particle appearance based on age
      const lifeRatio = particle.age / particle.maxAge;
      const alpha = 50 * (1 - lifeRatio); // Higher base alpha for visibility
      
      // Draw particle with dynamic color
      p5.fill(
        (params.current.hueBase + particle.hueOffset + 360) % 360,
        params.current.saturation,
        params.current.brightness,
        alpha
      );
      
      // Particle size varies with sentiment intensity
      const size = particle.size * (1 + params.current.particleSpeed * 0.5);
      p5.ellipse(particle.x, particle.y, size);
      
      // Add glow effect for all particles for better visibility
      p5.fill(
        (params.current.hueBase + particle.hueOffset + 360) % 360,
        params.current.saturation * 0.7,
        100,
        alpha * 0.5
      );
      p5.ellipse(particle.x, particle.y, size * 2);
    });
    
    // Draw keyword-influenced elements
    if (keywords.length > 0) {
      drawKeywordInfluence(p5);
    }
  };
  
  /**
   * Draw additional visual elements based on keywords
   */
  const drawKeywordInfluence = (p5) => {
    keywords.slice(-5).forEach((keyword, index) => {
      const x = p5.noise(keyword.id * 0.01, params.current.time) * p5.width;
      const y = p5.noise(keyword.id * 0.01 + 100, params.current.time) * p5.height;
      const size = 20 + index * 5;
      
      p5.push();
      p5.fill(
        (params.current.hueBase + index * 30) % 360,
        50,
        80,
        10
      );
      p5.ellipse(x, y, size * 2);
      p5.pop();
    });
  };
  
  /**
   * Handle canvas resize
   */
  const windowResized = (p5) => {
    const parent = p5.canvas.parentElement;
    p5.resizeCanvas(parent.offsetWidth, parent.offsetHeight);
  };
  
  return (
    <div className="aura-visualization">
      <Sketch 
        setup={setup}
        draw={draw}
        windowResized={windowResized}
        className="aura-canvas"
      />
      
      {/* Overlay for status information */}
      {!isActive && !sentiment && (
        <div className="visualization-overlay">
          <p>Visualization waiting for audio input...</p>
        </div>
      )}
    </div>
  );
}

export default React.memo(AuraVisualization);
