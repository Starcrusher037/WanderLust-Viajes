import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { getDestinationById, getDestinationPlan } from '../services/api';
import { useDestinationsContext } from '../hooks/useDestinationsContext';
import FlightCard from '../components/FlightCard';
import HotelCard from '../components/HotelCard';
import TripPlannerSummary from '../components/TripPlannerSummary';
import AlertError from '../components/AlertError';
import {
  MapPin,
  Calendar,
  SunMedium,
  CheckCircle2,
  Plane,
  Hotel,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';

export default function DestinationDetail() {
  const { id } = useParams();
  const { selectedPlan, updateSelectedPlan } = useDestinationsContext();

  const [destination, setDestination] = useState(null);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);

  // Estados de carga
  const [isLoadingRest, setIsLoadingRest] = useState(true);
  const [isLoadingGql, setIsLoadingGql] = useState(true);

  // Estados de error
  const [restError, setRestError] = useState(null);
  const [gqlError, setGqlError] = useState(null);

  // Pestaña activa para alternar entre opciones en pantallas pequeñas
  const [activeTab, setActiveTab] = useState('all');

  const abortControllerRef = useRef(null);

  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Cambio de destino');
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingRest(true);
    setIsLoadingGql(true);
    setRestError(null);
    setGqlError(null);

    // 1. Consulta REST del Destino
    try {
      const destData = await getDestinationById(id, { signal: controller.signal });
      setDestination(destData);
      updateSelectedPlan({ destination: destData });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setRestError(err);
      }
    } finally {
      setIsLoadingRest(false);
    }

    // 2. Consulta GraphQL de Vuelos y Hoteles
    try {
      const planData = await getDestinationPlan(id, { signal: controller.signal });
      if (planData) {
        setFlights(planData.flights || []);
        setHotels(planData.hotels || []);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setGqlError(err);
      }
    } finally {
      setIsLoadingGql(false);
    }
  }, [id, updateSelectedPlan]);

  useEffect(() => {
    loadData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Componente desmontado');
      }
    };
  }, [loadData]);

  // Selección de vuelo
  const handleSelectFlight = (flight) => {
    updateSelectedPlan({
      selectedFlight: selectedPlan.selectedFlight?.id === flight.id ? null : flight
    });
  };

  // Selección de hotel
  const handleSelectHotel = (hotel) => {
    updateSelectedPlan({
      selectedHotel: selectedPlan.selectedHotel?.id === hotel.id ? null : hotel
    });
  };

  // Manejo de error 404 de destino no encontrado
  if (restError && restError.status === 404) {
    return (
      <div className="page-error-404-container">
        <div className="error-card-404" role="alert">
          <HelpCircle size={64} className="icon-404" />
          <h2>Destino No Encontrado (404)</h2>
          <p>{restError.message}</p>
          <div className="error-actions">
            <Link to="/destinos" className="btn-primary">
              <ArrowLeft size={16} /> Volver al Catálogo de Destinos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Manejo de error general REST
  if (restError) {
    return (
      <div className="page-detail-container">
        <AlertError
          title="Error al consultar los datos del destino (REST)"
          message={restError.message}
          status={restError.status}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="page-destination-detail">
      {/* Botón de retroceso */}
      <div className="top-navigation-bar">
        <Link to="/destinos" className="back-link">
          <ArrowLeft size={16} /> Volver a Destinos
        </Link>
        <div className="api-tags-row">
          <span className="api-tag rest">REST: /api/destinations/{id}</span>
          <span className="api-tag graphql">GraphQL: query GetDestinationPlan</span>
        </div>
      </div>

      {/* Banner / Resumen del Destino (Datos REST) */}
      {isLoadingRest ? (
        <div className="detail-hero-skeleton" />
      ) : (
        destination && (
          <section className="detail-hero-card">
            <div className="detail-hero-image-wrap">
              <img src={destination.imageUrl} alt={destination.name} />
              <div className="hero-floating-badge">
                <MapPin size={16} /> {destination.country}
              </div>
            </div>

            <div className="detail-hero-content">
              <div className="hero-category-tag">{destination.category}</div>
              <h1 className="hero-destination-name">{destination.name}</h1>
              <p className="hero-destination-desc">{destination.description}</p>

              <div className="meta-details-grid">
                <div className="meta-box">
                  <SunMedium size={18} className="meta-icon" />
                  <div>
                    <span className="meta-label">Clima Típico</span>
                    <strong>{destination.climate}</strong>
                  </div>
                </div>

                <div className="meta-box">
                  <Calendar size={18} className="meta-icon" />
                  <div>
                    <span className="meta-label">Mejor Época para Visitar</span>
                    <strong>{destination.bestTimeToVisit}</strong>
                  </div>
                </div>
              </div>

              {/* Actividades Populares */}
              <div className="hero-activities-section">
                <h4>Actividades Populares Incluidas en la Zona:</h4>
                <div className="activities-tags-flow">
                  {destination.activities.map((act, index) => (
                    <span key={index} className="activity-tag">
                      <CheckCircle2 size={13} /> {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      )}

      {/* Selector de pestañas para móvil */}
      <div className="mobile-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todo
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'flights' ? 'active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          <Plane size={15} /> Vuelos ({flights.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
          onClick={() => setActiveTab('hotels')}
        >
          <Hotel size={15} /> Hoteles ({hotels.length})
        </button>
      </div>

      {/* Contenido Principal: Vuelos + Hoteles (GraphQL) y Resumen del Plan */}
      <div className="detail-main-layout">
        <div className="travel-options-column">
          {/* Mensaje de error si falla GraphQL */}
          {gqlError && (
            <AlertError
              title="Fallo al consultar opciones de vuelos y hoteles (GraphQL)"
              message={gqlError.message}
              onRetry={loadData}
            />
          )}

          {/* Sección de Vuelos */}
          {(activeTab === 'all' || activeTab === 'flights') && (
            <section className="options-section">
              <div className="options-section-header">
                <div className="header-title-wrap">
                  <div className="section-icon-badge flight">
                    <Plane size={20} />
                  </div>
                  <div>
                    <h3>Vuelos Disponibles</h3>
                    <p>Opciones de rutas, aerolíneas y asientos consultadas vía GraphQL.</p>
                  </div>
                </div>
                <span className="count-pill">{flights.length} disponibles</span>
              </div>

              {isLoadingGql ? (
                <div className="options-loading-box">
                  <div className="skeleton-card mini" />
                  <div className="skeleton-card mini" />
                </div>
              ) : flights.length > 0 ? (
                <div className="cards-stack">
                  {flights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedPlan.selectedFlight?.id === flight.id}
                      onSelect={handleSelectFlight}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-options-msg">No hay vuelos disponibles actualmente para este destino.</p>
              )}
            </section>
          )}

          {/* Sección de Hoteles */}
          {(activeTab === 'all' || activeTab === 'hotels') && (
            <section className="options-section">
              <div className="options-section-header">
                <div className="header-title-wrap">
                  <div className="section-icon-badge hotel">
                    <Hotel size={20} />
                  </div>
                  <div>
                    <h3>Hoteles y Alojamientos Disponibles</h3>
                    <p>Hoteles con estrellas, comodidades y tarifas por noche vía GraphQL.</p>
                  </div>
                </div>
                <span className="count-pill">{hotels.length} disponibles</span>
              </div>

              {isLoadingGql ? (
                <div className="options-loading-box">
                  <div className="skeleton-card mini" />
                  <div className="skeleton-card mini" />
                </div>
              ) : hotels.length > 0 ? (
                <div className="cards-stack">
                  {hotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      isSelected={selectedPlan.selectedHotel?.id === hotel.id}
                      onSelect={handleSelectHotel}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-options-msg">No hay hoteles disponibles actualmente para este destino.</p>
              )}
            </section>
          )}
        </div>

        {/* Panel Lateral: Planificador y Cálculo de Presupuesto */}
        <TripPlannerSummary destination={destination} />
      </div>
    </div>
  );
}
