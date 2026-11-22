import { Link } from 'react-router';
import { Compass, ShieldCheck, Mail, Phone, Globe, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <Compass size={24} className="logo-accent" />
            <span>WanderLust Viajes</span>
          </div>
          <p className="footer-desc">
            Tu plataforma integral para descubrir el mundo. Explora destinos internacionales mediante nuestra API REST
            y planifica en tiempo real vuelos y hoteles con nuestra API GraphQL.
          </p>
          <div className="footer-badges">
            <span className="tech-badge">
              <Database size={13} /> REST API Mock
            </span>
            <span className="tech-badge">
              <Globe size={13} /> GraphQL Mock
            </span>
            <span className="tech-badge">
              <ShieldCheck size={13} /> React Router v7
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Destinos Populares</h4>
          <ul>
            <li><Link to="/destinos/cancun">Cancún y Riviera Maya</Link></li>
            <li><Link to="/destinos/tokyo">Tokio y Monte Fuji</Link></li>
            <li><Link to="/destinos/paris">París Ciudad de la Luz</Link></li>
            <li><Link to="/destinos/cuzco">Cuzco y Machu Picchu</Link></li>
            <li><Link to="/destinos/reikiavik">Reikiavik e Islandia</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/destinos">Catálogo Completo</Link></li>
            <li><Link to="/planificador">Planificador de Viaje</Link></li>
            <li><Link to="/servicios">Arquitectura y Mocks</Link></li>
            <li><Link to="/ruta-inexistente">Prueba de Ruta 404</Link></li>
          </ul>
        </div>

        <div className="footer-col contact-col">
          <h4>Atención al Viajero</h4>
          <p><Phone size={14} /> +56 9 8000 7000 (24/7)</p>
          <p><Mail size={14} /> contacto@wanderlust-viajes.com</p>
          <p className="footer-security">
            <ShieldCheck size={16} /> Reservas simuladas seguras con confirmación instantánea.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} WanderLust Viajes. Plataforma frontend con simulación integral de backend mediante Mock Service Worker (MSW).
        </p>
      </div>
    </footer>
  );
}
