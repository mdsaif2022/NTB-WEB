import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';
import { setupGlobalErrorHandling } from './lib/errorHandler';

// Setup global error handling
setupGlobalErrorHandling();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// Handle hydration properly
const renderApp = () => {
  try {
    root.render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback rendering
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb;">
        <div style="text-align: center; max-width: 400px; padding: 2rem;">
          <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h1 style="color: #111827; font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">
            Application Error
          </h1>
          <p style="color: #6b7280; margin-bottom: 1.5rem;">
            Something went wrong while loading the application. Please refresh the page.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="background: #059669; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer;"
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
};

// Use requestIdleCallback for better performance
if ('requestIdleCallback' in window) {
  requestIdleCallback(renderApp);
} else {
  setTimeout(renderApp, 1);
}
