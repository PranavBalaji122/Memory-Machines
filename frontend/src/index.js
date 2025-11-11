/**
 * React Application Entry Point
 * Renders the main App component into the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render application with StrictMode for development warnings
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove preloader once React loads
window.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 100);
  }
});

// Register service worker for PWA support (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'development') {
  // Log performance metrics in development
  const reportWebVitals = (metric) => {
    console.log(metric);
  };
  
  // Dynamically import web-vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}
