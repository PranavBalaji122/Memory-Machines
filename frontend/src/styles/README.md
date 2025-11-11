# 🎨 Styles Directory

> CSS styling for the Sentiment Aura application

## 📋 Overview

This directory contains all CSS files for styling the Sentiment Aura application. The styles follow a modern, dark theme with smooth animations and responsive design principles.

## 📁 Style Files

### App.css
Main application styles including:
- Global styles and CSS reset
- Layout structure
- Theme variables
- Animation keyframes
- Responsive breakpoints

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--color-background: #0a0a0a;
--color-surface: #1a1a2e;
--color-primary: #16213e;
--color-accent: #0f3460;

/* Text Colors */
--color-text-primary: #ffffff;
--color-text-secondary: #b0b0b0;
--color-text-muted: #666666;

/* Sentiment Colors */
--color-positive: #4CAF50;
--color-negative: #F44336;
--color-neutral: #2196F3;

/* Status Colors */
--color-success: #4CAF50;
--color-error: #F44336;
--color-warning: #FF9800;
--color-info: #2196F3;
```

### Typography

```css
/* Font Stack */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'Fira Code', 'Monaco', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Spacing

```css
/* Spacing Scale */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Animations

```css
/* Transition Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing Functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## 🎯 Key Animation Patterns

### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Pulse Animation (Recording Indicator)
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
```

### Float Animation (Keywords)
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### Glow Effect
```css
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.8);
  }
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Small devices (phones) */
@media (min-width: 640px) { }

/* Medium devices (tablets) */
@media (min-width: 768px) { }

/* Large devices (desktops) */
@media (min-width: 1024px) { }

/* Extra large devices */
@media (min-width: 1280px) { }
```

## 🎨 Component Styling Patterns

### Glass Morphism Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### Neumorphism Effect
```css
.neumorphic {
  background: linear-gradient(145deg, #1e1e32, #191929);
  box-shadow: 
    5px 5px 10px #0e0e18,
    -5px -5px 10px #2a2a42;
  border-radius: 12px;
}
```

### Gradient Borders
```css
.gradient-border {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2px;
  border-radius: 12px;
}
```

## 🚀 Performance Optimizations

### Hardware Acceleration
```css
.accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0a0a0a;
    --color-text: #ffffff;
  }
}
```

## 🎯 CSS Architecture

### BEM Naming Convention
```css
/* Block */
.transcript-display { }

/* Element */
.transcript-display__item { }

/* Modifier */
.transcript-display__item--final { }
```

### Utility Classes
```css
/* Display */
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }

/* Position */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }

/* Text */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
```

## 🧩 Component-Specific Styles

### TranscriptDisplay
- Semi-transparent background
- Auto-scroll behavior
- Text fade-in animation
- Distinction between interim/final text

### KeywordsDisplay
- Staggered fade-in animations
- Floating particle effects
- Size variation based on importance
- Smooth position transitions

### Controls
- Pulsing recording indicator
- Button state transitions
- Error message styling
- Permission prompt styling

### AuraVisualization
- Full-screen canvas
- Overlay for inactive state
- Responsive sizing
- Performance optimizations

## 🐛 Common CSS Issues & Solutions

### Issue: Blurry text on retina displays
```css
.sharp-text {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Issue: Janky animations
```css
.smooth-animation {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Issue: Layout shift
```css
.no-shift {
  contain: layout style paint;
}
```

## 🎨 Accessibility Considerations

### Focus Styles
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --color-background: #000000;
    --color-text: #ffffff;
  }
}
```

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

---

*Styling the Sentiment Aura experience with modern CSS*
