import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDestinationsContext } from '../hooks/useDestinationsContext';
import { Search, MapPin, Sparkles, ArrowRight, Plane, Hotel, Star, ShieldCheck, Check } from 'lucide-react';
import AlertError from '../components/AlertError';

export default function Home() {
  const navigate = useNavigate();
  const { featuredDestinations, isFeaturedLoading, featuredError, loadFeatured } = useDestinationsContext();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/destinos?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/destinos');
    }
  };

  return (
    <div className="page-home">
      {/* Hero Principal */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> Tu Próxima Aventura Comienza Aquí
          </div>
          <h1 className="hero-title">
            Explora el Mundo con Vuelos y Hoteles a Tu Medida
          </h1>
          <p className="hero-subtitle">
            Descubre los mejores destinos internacionales consultados en tiempo real por nuestra API REST,
            y personaliza tus vuelos y hoteles mediante consultas dinámicas GraphQL.
          </p>

          {/* Formulario de búsqueda rápida */}
          <form className="hero-search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-group">
              <MapPin className="search-icon" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="¿A dónde sueñas viajar? (ej. Cancún, Tokio, París, surf...)"
                aria-label="Buscar destinos"
              />
            </div>
            <button type="submit" className="btn-search-hero">
              <Search size={18} />
              Buscar Destinos
            </button>
          </form>

          {/* Métricas y Confianza */}
          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-number">+8</span>
              <span className="stat-label">Destinos Mundiales</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">REST</span>
              <span className="stat-label">Catálogo & Actividades</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">GraphQL</span>
              <span className="stat-label">Vuelos y Hoteles</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Simulado con MSW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Destinos Destacados (Consumidos vía REST) */}
      <section className="featured-section">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">API REST: /api/destinations/featured</span>
            <h2 className="section-title">Destinos Destacados de la Temporada</h2>
            <p className="section-description">
              Rutas protegidas e interceptadas por MSW que destacan lo mejor del turismo internacional.
            </p>
          </div>
          <Link to="/destinos" className="link-see-all">
            Ver todos los destinos <ArrowRight size={16} />
          </Link>
        </div>

        {/* Manejo de estados: Carga, Error y Datos */}
        {isFeaturedLoading && (
          <div className="featured-grid skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        )}

        {featuredError && (
          <AlertError
            title="Error al cargar destinos destacados"
            message={featuredError}
            onRetry={() => loadFeatured({ forceRefresh: true })}
          />
        )}

        {!isFeaturedLoading && !featuredError && (
          <div className="featured-grid">
            {featuredDestinations.map((dest) => (
              <article key={dest.id} className="featured-card">
                <div className="card-image-box">
                  <img src={dest.imageUrl} alt={dest.name} loading="lazy" />
                  <span className="badge-featured">{dest.badge}</span>
                  <div className="card-rating-float">
                    <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                    <span>{dest.rating}</span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="card-location">
                    <MapPin size={14} className="icon-country" />
                    <span>{dest.country}</span>
                    <span className="category-pill">{dest.category}</span>
                  </div>

                  <h3 className="card-title">{dest.name}</h3>
                  <p className="card-desc">{dest.description}</p>

                  <div className="activities-preview">
                    <strong>Actividades destacadas:</strong>
                    <ul>
                      {dest.activities.slice(0, 3).map((act, i) => (
                        <li key={i}>
                          <Check size={12} className="check-icon" /> {act}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-footer-action">
                    <div className="card-price-block">
                      <span className="price-label">Desde</span>
                      <span className="price-val">${dest.priceFrom} {dest.currency}</span>
                    </div>

                    <Link to={`/destinos/${dest.id}`} className="btn-explore-destination">
                      Planificar Viaje
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Cómo Funciona: Arquitectura REST + GraphQL */}
      <section className="architecture-showcase-section">
        <div className="showcase-inner">
          <div className="showcase-badge">
            <ShieldCheck size={16} /> Arquitectura Moderna de Comunicación
          </div>
          <h2 className="showcase-title">¿Cómo Funciona Nuestra Plataforma de Viajes?</h2>
          <p className="showcase-subtitle">
            Combinamos lo mejor de REST y GraphQL para ofrecerte una experiencia fluida y eficiente.
          </p>

          <div className="architecture-steps-grid">
            <div className="arch-step-card">
              <div className="arch-step-num">01</div>
              <div className="arch-step-icon rest-icon">
                <MapPin size={28} />
              </div>
              <h3>1. Exploras Destinos (REST)</h3>
              <p>
                Consultas mediante <code>GET /api/destinations</code> el catálogo de países,
                fotografías, climas y actividades populares disponibles para cada lugar.
              </p>
            </div>

            <div className="arch-step-card">
              <div className="arch-step-num">02</div>
              <div className="arch-step-icon graphql-icon">
                <Plane size={28} />
              </div>
              <h3>2. Consultas Vuelos (GraphQL)</h3>
              <p>
                La API GraphQL consulta en tiempo real aerolíneas, horarios de despegue y aterrizaje,
                escalas y tarifas disponibles para el destino seleccionado.
              </p>
            </div>

            <div className="arch-step-card">
              <div className="arch-step-num">03</div>
              <div className="arch-step-icon graphql-icon">
                <Hotel size={28} />
              </div>
              <h3>3. Eliges tu Hotel (GraphQL)</h3>
              <p>
                En la misma consulta GraphQL se obtienen hoteles categorizados por estrellas,
                comodidades (spa, piscina, playa), tipo de habitación y disponibilidad.
              </p>
            </div>

            <div className="arch-step-card">
              <div className="arch-step-num">04</div>
              <div className="arch-step-icon success-icon">
                <Sparkles size={28} />
              </div>
              <h3>4. Paquete Completo</h3>
              <p>
                El planificador calcula automáticamente la tarifa total según los pasajeros y noches,
                permitiéndote emitir una reserva simulada con confirmación inmediata.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
