// Suppress WebSocket, Vite HMR, and ONNX Runtime WASM threading debug logs/warnings globally
if (typeof window !== 'undefined') {
  // Global unhandled rejection & error silencers for WebSockets / dev connection
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const rawReason = e?.reason;
    const reasonStr = typeof rawReason === 'object' && rawReason !== null ? (rawReason.message || JSON.stringify(rawReason)) : String(rawReason || '');
    if (
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('vite') ||
      reasonStr.includes('failed to connect') ||
      reasonStr.includes('NetworkError')
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (e: ErrorEvent) => {
    const msg = (e && e.message) || '';
    if (msg.includes('WebSocket') || msg.includes('vite')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });

  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a) || '')).join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('vite') ||
      msg.includes('numThreads') ||
      msg.includes('SharedArrayBuffer') ||
      msg.includes('cross-origin') ||
      msg.includes('onnx')
    ) {
      return;
    }
  };

  console.error = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a) || '')).join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('vite') ||
      msg.includes('failed to connect') ||
      msg.includes('numThreads') ||
      msg.includes('connection refused')
    ) {
      return;
    }
  };
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

