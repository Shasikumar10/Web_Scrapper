import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/App.css'; // adjust path if your global CSS file differs

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found. Make sure index.html has <div id="root"></div>');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);