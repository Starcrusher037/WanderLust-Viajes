import { AlertTriangle, RefreshCw, WifiOff, HelpCircle } from 'lucide-react';

/**
 * Componente accesible para mostrar alertas de error con role="alert"
 * y botón de reintento para garantizar la recuperación del usuario.
 */
export default function AlertError({
  title = 'Ha ocurrido un problema',
  message,
  onRetry,
  isRetrying = false,
  status = null
}) {
  const isNetworkIssue = status === 0 || message?.toLowerCase().includes('conexión') || message?.toLowerCase().includes('red');
  const isTimeout = status === 408 || message?.toLowerCase().includes('tiempo de espera');

  return (
    <div className="alert-error-container" role="alert" aria-live="assertive">
      <div className="alert-error-icon-box">
        {isNetworkIssue ? (
          <WifiOff size={28} className="alert-icon" />
        ) : isTimeout ? (
          <AlertTriangle size={28} className="alert-icon" />
        ) : (
          <HelpCircle size={28} className="alert-icon" />
        )}
      </div>

      <div className="alert-error-content">
        <h3 className="alert-error-title">
          {title}
          {status ? <span className="status-tag">HTTP {status}</span> : null}
        </h3>
        <p className="alert-error-message">{message}</p>

        {onRetry && (
          <div className="alert-actions">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="btn-retry"
              aria-label="Reintentar petición que falló"
            >
              <RefreshCw size={15} className={isRetrying ? 'spin-icon' : ''} />
              {isRetrying ? 'Reintentando...' : 'Reintentar consulta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
