import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

const rootElement = document.getElementById('root') as HTMLElement | null;

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('React render error:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Hata Oluştu</h1>
      <p>Uygulama başlatılamadı. Lütfen konsolu kontrol edin.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}

