import { useState, useEffect, useRef, useCallback } from 'react';
import { useDestinationsContext } from '../hooks/useDestinationsContext';
import { getDestinationPlan } from '../services/api';
import FlightCard from '../components/FlightCard';
import HotelCard from '../components/HotelCard';
import TripPlannerSummary from '../components/TripPlannerSummary';
import AlertError from '../components/AlertError';
import { Plane, Hotel, MapPin } from 'lucide-react';

export default function Planner() {
  const { destinations, loadDestinations, selectedPlan, updateSelectedPlan } = useDestinationsContext();
  const [selectedDestId, setSelectedDestId] = useState('cancun');
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  // Sincronizar destino activo
  const activeDestination = destinations.find(d => d.id === selectedDestId) || destinations[0] || null;

  const fetchPlanForDestination = useCallback(async (destId) => {
    if (!destId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Cambio de destino en el planificador');
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await getDestinationPlan(destId, { signal: controller.signal });
      if (data) {
        setFlights(data.flights || []);
        setHotels(data.hotels || []);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeDestination) {
      updateSelectedPlan({
        destination: activeDestination,
        selectedFlight: null,
        selectedHotel: null
      });
      fetchPlanForDestination(activeDestination.id);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Desmontado');
      }
    };
  }, [activeDestination, fetchPlanForDestination, updateSelectedPlan]);

  const handleSelectFlight = (flight) => {
    updateSelectedPlan({
      selectedFlight: selectedPlan.selectedFlight?.id === flight.id ? null : flight
    });
  };

  const handleSelectHotel = (hotel) => {
    updateSelectedPlan({
      selectedHotel: selectedPlan.selectedHotel?.id === hotel.id ? null : hotel
    });
  };

  return (
    <div className="page-planner">
      {/* Header */}
      <section className="planner-hero-bar">
        <div className="planner-hero-text">
          <div className="badge-endpoint">GraphQL Mock: endpoint /graphql</div>
          <h1>Planificador de Viajes Integral</h1>
          <p>
            Arma tu viaje soñado combinando vuelos directos o con escala y hoteles exclusivos.
            Cambia de destino libremente para consultar nuevas opciones dinámicas sin recargar la página.
          </p>
        </div>

        {/* Selector de Destino */}
        <div className="destination-selector-card">
          <label htmlFor="select-destination">
            <MapPin size={16} /> Selecciona tu Destino:
          </label>
          <select
            id="select-destination"
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="dest-select-input"
          >
            {destinations.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.country}) — Desde ${d.priceFrom} USD
              </option>
            ))}
          </select>
          {activeDestination && (
            <p className="dest-meta-hint">
              Clima: {activeDestination.climate} • {activeDestination.category}
            </p>
          )}
        </div>
      </section>

      {/* Manejo de errores */}
      {error && (
        <AlertError
          title="Error en la consulta GraphQL"
          message={error.message}
          onRetry={() => fetchPlanForDestination(selectedDestId)}
        />
      )}

      {/* Layout de opciones y resumen */}
      <div className="detail-main-layout">
        <div className="travel-options-column">
          {/* Vuelos */}
          <section className="options-section">
            <div className="options-section-header">
              <div className="header-title-wrap">
                <div className="section-icon-badge flight">
                  <Plane size={20} />
                </div>
                <div>
                  <h3>Vuelos hacia {activeDestination?.name}</h3>
                  <p>Tarifas, aerolíneas y asientos actualizados en tiempo real.</p>
                </div>
              </div>
              <span className="count-pill">{flights.length} opciones</span>
            </div>

            {loading ? (
              <div className="options-loading-box">
                <div className="skeleton-card mini" />
              </div>
            ) : flights.length > 0 ? (
              <div className="cards-stack">
                {flights.map(fl => (
                  <FlightCard
                    key={fl.id}
                    flight={fl}
                    isSelected={selectedPlan.selectedFlight?.id === fl.id}
                    onSelect={handleSelectFlight}
                  />
                ))}
              </div>
            ) : (
              <p className="no-options-msg">No hay vuelos disponibles para el destino seleccionado.</p>
            )}
          </section>

          {/* Hoteles */}
          <section className="options-section">
            <div className="options-section-header">
              <div className="header-title-wrap">
                <div className="section-icon-badge hotel">
                  <Hotel size={20} />
                </div>
                <div>
                  <h3>Hoteles en {activeDestination?.name}</h3>
                  <p>Alojamientos con estrellas, comodidades y fotos verificadas.</p>
                </div>
              </div>
              <span className="count-pill">{hotels.length} opciones</span>
            </div>

            {loading ? (
              <div className="options-loading-box">
                <div className="skeleton-card mini" />
              </div>
            ) : hotels.length > 0 ? (
              <div className="cards-stack">
                {hotels.map(ht => (
                  <HotelCard
                    key={ht.id}
                    hotel={ht}
                    isSelected={selectedPlan.selectedHotel?.id === ht.id}
                    onSelect={handleSelectHotel}
                  />
                ))}
              </div>
            ) : (
              <p className="no-options-msg">No hay hoteles disponibles para el destino seleccionado.</p>
            )}
          </section>
        </div>

        {/* Resumen lateral */}
        <TripPlannerSummary destination={activeDestination} />
      </div>
    </div>
  );
}
