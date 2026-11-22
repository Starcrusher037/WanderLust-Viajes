import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getDestinations } from '../services/api';
import AlertError from '../components/AlertError';
import { MapPin, Search, Filter, Check, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCountry = searchParams.get('country') || 'all';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [selectedCountry, setSelectedCountry] = useState(urlCountry);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Referencia para cancelar peticiones anteriores al cambiar filtros rápido
  const abortControllerRef = useRef(null);

  const fetchDestinationsList = useCallback(async ({ simulateError = '' } = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Consulta anterior cancelada');
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await getDestinations({
        search: searchTerm,
        country: selectedCountry,
        category: selectedCategory,
        simulateError,
        signal: controller.signal
      });
      setDestinations(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [searchTerm, selectedCountry, selectedCategory]);

  useEffect(() => {
    fetchDestinationsList();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Componente desmontado');
      }
    };
  }, [fetchDestinationsList]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) next.set('q', val);
      else next.delete('q');
      return next;
    });
  };

  const handleCountryFilter = (country) => {
    setSelectedCountry(country);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (country !== 'all') next.set('country', country);
      else next.delete('country');
      return next;
    });
  };

  const countriesList = useMemo(() => [
    { id: 'all', name: 'Todos los Países' },
    { id: 'México', name: 'México' },
    { id: 'Japón', name: 'Japón' },
    { id: 'Francia', name: 'Francia' },
    { id: 'Perú', name: 'Perú' },
    { id: 'Italia', name: 'Italia' },
    { id: 'Indonesia', name: 'Indonesia' },
    { id: 'Islandia', name: 'Islandia' },
    { id: 'Brasil', name: 'Brasil' }
  ], []);

  const categoriesList = ['all', 'Playa', 'Cultural', 'Aventura', 'Naturaleza', 'Histórico'];

  return (
    <div className="page-destinations">
      {/* Encabezado */}
      <section className="destinations-header-bar">
        <div className="header-meta">
          <span className="badge-endpoint">REST API: /api/destinations</span>
          <h1>Catálogo de Destinos Internacionales</h1>
          <p>
            Explora opciones turísticas completas con su país de origen, clima y actividades populares.
            Selecciona el destino que desees para consultar sus vuelos y hoteles en tiempo real vía GraphQL.
          </p>
        </div>

        {/* Panel de pruebas de resiliencia y simulación de fallos de red */}
        <div className="simulator-box" title="Herramienta para comprobar la resiliencia de la interfaz ante fallos">
          <span className="simulator-label">
            <AlertTriangle size={14} /> Simular escenarios MSW:
          </span>
          <button
            type="button"
            className="btn-sim-test"
            onClick={() => {
              setIsRetrying(true);
              fetchDestinationsList({ simulateError: '500' });
            }}
          >
            Probar Error 500
          </button>
          <button
            type="button"
            className="btn-sim-test"
            onClick={() => {
              setIsRetrying(true);
              fetchDestinationsList({ simulateError: 'network' });
            }}
          >
            Probar Fallo de Conexión
          </button>
          <button
            type="button"
            className="btn-sim-test reset"
            onClick={() => {
              setIsRetrying(true);
              fetchDestinationsList();
            }}
          >
            Restaurar Servicio
          </button>
        </div>
      </section>

      {/* Barra de Filtros y Búsqueda */}
      <section className="filter-controls-container">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Filtrar por nombre, país o actividad (ej. snorkel, templos, tren)..."
            aria-label="Buscar destinos por palabra clave"
          />
          {searchTerm && (
            <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="country-filters-scroll">
          {countriesList.map(c => (
            <button
              key={c.id}
              type="button"
              className={`filter-pill ${selectedCountry === c.id ? 'active' : ''}`}
              onClick={() => handleCountryFilter(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="category-filters-row">
          <span className="filter-label"><Filter size={13} /> Categoría:</span>
          {categoriesList.map(cat => (
            <button
              key={cat}
              type="button"
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Manejo de estados de la UI */}
      {error && (
        <AlertError
          title="Fallo al consultar el catálogo de destinos"
          message={error.message || 'No fue posible obtener los destinos disponibles.'}
          status={error.status}
          isRetrying={isRetrying}
          onRetry={() => {
            setIsRetrying(true);
            fetchDestinationsList();
          }}
        />
      )}

      {loading && !error && (
        <div className="destinations-grid skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="destination-card-skeleton" />
          ))}
        </div>
      )}

      {!loading && !error && destinations.length === 0 && (
        <div className="empty-results-box">
          <MapPin size={48} className="empty-icon" />
          <h3>No encontramos destinos con esos filtros</h3>
          <p>Prueba buscando con otros términos o seleccionando "Todos los Países".</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCountry('all');
              setSelectedCategory('all');
            }}
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {!loading && !error && destinations.length > 0 && (
        <div className="destinations-grid">
          {destinations.map(dest => (
            <article key={dest.id} className="destination-card">
              <div className="destination-card-image">
                <img src={dest.imageUrl} alt={dest.name} loading="lazy" />
                <span className="country-tag">
                  <MapPin size={12} /> {dest.country}
                </span>
                {dest.badge && <span className="custom-badge">{dest.badge}</span>}
              </div>

              <div className="destination-card-body">
                <div className="card-top-info">
                  <h3 className="dest-name">{dest.name}</h3>
                  <div className="dest-climate">
                    <span>Clima:</span> {dest.climate}
                  </div>
                </div>

                <p className="dest-desc">{dest.description}</p>

                {/* Requisito específico: Actividades populares en el destino */}
                <div className="dest-activities-block">
                  <h4 className="activities-heading">Actividades Populares:</h4>
                  <ul className="activities-list">
                    {dest.activities.map((act, index) => (
                      <li key={index}>
                        <Check size={13} className="check-bullet" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="dest-card-footer">
                  <div className="price-box">
                    <span className="price-prefix">Paquetes desde</span>
                    <span className="price-currency">${dest.priceFrom} <small>{dest.currency}</small></span>
                  </div>

                  {/* Navegación al detalle dinámico */}
                  <Link to={`/destinos/${dest.id}`} className="btn-view-details">
                    Ver Vuelos y Hoteles
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
