import { Link } from 'react-router';
import { Home, MapPin, Plane } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-not-found" role="alert" aria-live="assertive">
      <div className="not-found-card">
        <div className="not-found-badge">Error 404</div>
        <div className="not-found-icon-wrap">
          <Plane className="lost-plane-icon" size={64} />
        </div>
        <h1>¡Destino Desconocido!</h1>
        <p className="not-found-message">
          Parece que la ruta a la que intentas acceder no existe en nuestro mapa de navegación.
          Puede que la dirección esté mal escrita o que el destino haya cambiado de coordenada.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            <Home size={16} /> Volver al Inicio
          </Link>
          <Link to="/destinos" className="btn-secondary">
            <MapPin size={16} /> Ver Catálogo de Destinos
          </Link>
        </div>
      </div>
    </div>
  );
}
