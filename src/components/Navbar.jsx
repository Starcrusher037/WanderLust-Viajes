import { NavLink, Link } from 'react-router';
import { Compass, Plane, Layers, MapPin } from 'lucide-react';
import { useDestinationsContext } from '../hooks/useDestinationsContext';

export default function Navbar() {
  const { pendingRequestsCount, selectedPlan } = useDestinationsContext();
  const hasPlan = selectedPlan.destination || selectedPlan.selectedFlight || selectedPlan.selectedHotel;

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo / Marca */}
        <Link to="/" className="brand-logo" aria-label="WanderLust Viajes Inicio">
          <div className="logo-icon-wrap">
            <Compass className="logo-icon" size={28} />
          </div>
          <div className="logo-text">
            <span className="logo-title">WanderLust</span>
            <span className="logo-subtitle">Agencia de Viajes</span>
          </div>
        </Link>

        {/* Navegación Principal con NavLink para identificar la ruta activa */}
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Inicio
          </NavLink>

          <NavLink
            to="/destinos"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <MapPin size={16} className="nav-item-icon" />
            Destinos (REST)
          </NavLink>

          <NavLink
            to="/planificador"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <Plane size={16} className="nav-item-icon" />
            Planificador (GraphQL)
            {hasPlan && <span className="plan-badge-dot" title="Plan en curso" />}
          </NavLink>

          <NavLink
            to="/servicios"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <Layers size={16} className="nav-item-icon" />
            Mock API & Arquitectura
          </NavLink>
        </nav>

        {/* Indicadores de Estado y Peticiones Activas */}
        <div className="header-actions">
          {pendingRequestsCount > 0 ? (
            <div className="status-pill loading" title="Peticiones de red en curso">
              <span className="spinner-dot" />
              <span>Cargando ({pendingRequestsCount})...</span>
            </div>
          ) : (
            <div className="status-pill live" title="Mock Service Worker activo para REST y GraphQL">
              <span className="live-dot" />
              <span className="status-label">MSW Online</span>
            </div>
          )}

          <Link to="/destinos" className="btn-cta-nav">
            Explorar Vuelos y Hoteles
          </Link>
        </div>
      </div>
    </header>
  );
}
