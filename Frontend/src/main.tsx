import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster richColors position="top-right" />
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
