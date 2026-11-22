import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { DestinationsProvider } from './context/DestinationsContext';
import App from './App.jsx';
import './index.css';

/**
 * Inicia el Mock Service Worker antes del renderizado de React.
 * Esto asegura que la primera petición (REST o GraphQL) sea debidamente interceptada.
 * Se restringe a desarrollo o cuando VITE_ENABLE_MSW esté activo.
 */
async function prepareApp() {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
  }
  return Promise.resolve();
}

prepareApp()
  .then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <BrowserRouter>
          <DestinationsProvider>
            <App />
          </DestinationsProvider>
        </BrowserRouter>
      </StrictMode>
    );
  })
  .catch((err) => {
    console.error('Fallo al inicializar Mock Service Worker:', err);
    createRoot(document.getElementById('root')).render(
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#dc2626' }}>Error de Inicialización del Mock Backend</h2>
        <p>No se pudo iniciar el interceptor de peticiones MSW: {err.message}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px' }}
        >
          Reintentar Carga
        </button>
      </div>
    );
  });
