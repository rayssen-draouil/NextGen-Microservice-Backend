import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import router from '@/router';
import '@/styles/globals.css';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event?.reason?.message || event?.reason || '');

    if (message.includes('The message port closed before a response was received')) {
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>,
);
