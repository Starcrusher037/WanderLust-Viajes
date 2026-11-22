import { useState } from 'react';
import { CheckCircle2, Terminal, Play, AlertTriangle } from 'lucide-react';
import { getDestinations, getDestinationById, getDestinationPlan } from '../services/api';

export default function TechDocs() {
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState('');

  const testEndpoint = async (type, name, action) => {
    setLoading(true);
    setActiveEndpoint(name);
    setConsoleOutput(null);
    try {
      const start = performance.now();
      const res = await action();
      const duration = (performance.now() - start).toFixed(0);
      setConsoleOutput({
        type,
        endpoint: name,
        status: 200,
        duration: `${duration}ms`,
        data: res
      });
    } catch (err) {
      setConsoleOutput({
        type,
        endpoint: name,
        status: err.status || 'ERROR',
        message: err.message,
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-tech-docs">
      {/* Encabezado */}
      <section className="tech-hero">
        <div className="badge-endpoint">Mock Backend & Arquitectura Frontend</div>
        <h1>Arquitectura Técnica del Proyecto</h1>
        <p>
          Este desarrollo combina <strong>React Router v7</strong>, <strong>Mock Service Worker (MSW v3)</strong>,
          y un doble canal de comunicación mediante <strong>REST</strong> y <strong>GraphQL</strong>.
        </p>
      </section>

      {/* Resiliencia y Arquitectura Frontend */}
      <section className="feedback-compliance-section">
        <h2>Arquitectura y Resiliencia del Sistema</h2>
        <div className="compliance-grid">
          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Inicialización Previa con MSW</h4>
              <p>
                <code>worker.start()</code> resuelve antes de que React monte la aplicación en <code>src/main.jsx</code>,
                asegurando la interceptación desde la primera consulta.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Orden y Protección de Rutas REST</h4>
              <p>
                El handler <code>/api/destinations/featured</code> está declarado antes de <code>/api/destinations/:id</code>,
                evitando que el parámetro dinámico capture la palabra reservada.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Cancelación con AbortController</h4>
              <p>
                Todas las peticiones aceptan una <code>signal</code> que cancela solicitudes previas al cambiar
                de filtro o destino, impidiendo que respuestas tardías sobrescriban datos vigentes.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Límite de Tiempo (Timeout)</h4>
              <p>
                Se aplica un temporizador de seguridad de 8000ms. Si el servicio no responde,
                se libera la carga y se ofrece el botón de reintento.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Mensajes Amigables & role="alert"</h4>
              <p>
                Se reemplazó <code>Failed to fetch</code> por explicaciones claras sobre la conexión.
                Las alertas incluyen <code>role="alert"</code> y botón <em>Reintentar</em>.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Caché Compartida en Contexto</h4>
              <p>
                <code>DestinationsProvider</code> comparte los destinos cargados para evitar solicitudes
                repetidas innecesarias al navegar entre vistas.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>Manejo Controlado de 404</h4>
              <p>
                React Router resuelve rutas no existentes con <code>path="*"</code>, y la API REST responde con
                código 404 cuando se solicita un destino con ID inexistente.
              </p>
            </div>
          </div>

          <div className="compliance-card">
            <CheckCircle2 className="icon-success" size={20} />
            <div>
              <h4>React Router sin recargas</h4>
              <p>
                Se utiliza <code>react-router</code> con <code>NavLink</code> para marcar la sección activa
                y <code>Link</code> para navegar sin recargas de página.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consola Interactiva de Pruebas de Endpoints */}
      <section className="interactive-tester-section">
        <div className="tester-header">
          <Terminal size={22} />
          <h3>Consola Interactiva de Endpoints Mock</h3>
          <p>Haz clic en cualquiera de los botones para ejecutar la llamada real a través del Service Worker:</p>
        </div>

        <div className="test-buttons-row">
          <button
            type="button"
            className="btn-test-action"
            onClick={() => testEndpoint('REST', 'GET /api/destinations/featured', () => fetch('/api/destinations/featured').then(r => r.json()))}
          >
            <Play size={14} /> GET /api/destinations/featured
          </button>

          <button
            type="button"
            className="btn-test-action"
            onClick={() => testEndpoint('REST', 'GET /api/destinations', () => getDestinations())}
          >
            <Play size={14} /> GET /api/destinations
          </button>

          <button
            type="button"
            className="btn-test-action"
            onClick={() => testEndpoint('REST', 'GET /api/destinations/tokyo', () => getDestinationById('tokyo'))}
          >
            <Play size={14} /> GET /api/destinations/tokyo
          </button>

          <button
            type="button"
            className="btn-test-action error-btn"
            onClick={() => testEndpoint('REST', 'GET /api/destinations/destino-ficticio-404', () => getDestinationById('destino-ficticio-404'))}
          >
            <AlertTriangle size={14} /> Probar 404 en REST (:id no existe)
          </button>

          <button
            type="button"
            className="btn-test-action"
            onClick={() => testEndpoint('GraphQL', 'query GetDestinationPlan (cancun)', () => getDestinationPlan('cancun'))}
          >
            <Play size={14} /> GraphQL: GetDestinationPlan (cancun)
          </button>

          <button
            type="button"
            className="btn-test-action"
            onClick={() => testEndpoint('GraphQL', 'query GetDestinationPlan (paris)', () => getDestinationPlan('paris'))}
          >
            <Play size={14} /> GraphQL: GetDestinationPlan (paris)
          </button>
        </div>

        {/* Visor de Respuestas JSON */}
        <div className="console-display">
          <div className="console-display-bar">
            <span>Terminal de Respuestas MSW</span>
            {activeEndpoint && <span className="active-tag">{activeEndpoint}</span>}
          </div>
          <div className="console-body">
            {loading ? (
              <div className="console-loading">Interceptando y procesando consulta...</div>
            ) : consoleOutput ? (
              <pre>
                <code>{JSON.stringify(consoleOutput, null, 2)}</code>
              </pre>
            ) : (
              <div className="console-placeholder">
                Selecciona una consulta arriba para ver la respuesta JSON entregada por el mock.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
