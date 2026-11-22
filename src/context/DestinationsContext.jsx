import { createContext, useState, useCallback, useRef } from 'react';
import { getDestinations, getFeaturedDestinations } from '../services/api';

export const DestinationsContext = createContext(null);

export function DestinationsProvider({ children }) {
  // Caché en memoria para evitar peticiones repetidas al cambiar de vista
  const [destinations, setDestinations] = useState([]);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [hasLoadedDestinations, setHasLoadedDestinations] = useState(false);
  const [hasLoadedFeatured, setHasLoadedFeatured] = useState(false);

  // Estados de carga e identificador de petición para evitar race-conditions
  const [isLoading, setIsLoading] = useState(false);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [featuredError, setFeaturedError] = useState(null);

  // Contador de peticiones activas para reflejar el estado real de la carga
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Selección activa del usuario para planificación de viaje
  const [selectedPlan, setSelectedPlan] = useState({
    destination: null,
    selectedFlight: null,
    selectedHotel: null,
    passengers: 1,
    nights: 4
  });

  // Notificación tipo toast para acciones (ej. guardado de viaje o reserva simulada)
  const [toastMessage, setToastMessage] = useState(null);

  const activeAbortControllerRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToastMessage({ message: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  /**
   * Carga el catálogo completo de destinos (o forzar recarga si forceRefresh es true).
   * Utiliza AbortController para cancelar peticiones obsoletas.
   */
  const loadDestinations = useCallback(async ({ forceRefresh = false, simulateError = '' } = {}) => {
    if (hasLoadedDestinations && !forceRefresh && !simulateError && destinations.length > 0) {
      return destinations;
    }

    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort('Petición anterior cancelada');
    }

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setPendingRequestsCount(prev => prev + 1);

    try {
      const data = await getDestinations({ simulateError, signal: controller.signal });
      setDestinations(data);
      setHasLoadedDestinations(true);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No fue posible cargar los destinos.');
      }
      throw err;
    } finally {
      setIsLoading(false);
      setPendingRequestsCount(prev => Math.max(0, prev - 1));
    }
  }, [hasLoadedDestinations, destinations]);

  /**
   * Carga destinos destacados para el Hero / Inicio.
   */
  const loadFeatured = useCallback(async ({ forceRefresh = false } = {}) => {
    if (hasLoadedFeatured && !forceRefresh && featuredDestinations.length > 0) {
      return featuredDestinations;
    }

    setIsFeaturedLoading(true);
    setFeaturedError(null);

    try {
      const data = await getFeaturedDestinations();
      setFeaturedDestinations(data);
      setHasLoadedFeatured(true);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setFeaturedError(err.message || 'No fue posible cargar los destinos destacados.');
      }
    } finally {
      setIsFeaturedLoading(false);
    }
  }, [hasLoadedFeatured, featuredDestinations]);

  const updateSelectedPlan = useCallback((updates) => {
    setSelectedPlan(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSelectedPlan = useCallback(() => {
    setSelectedPlan({
      destination: null,
      selectedFlight: null,
      selectedHotel: null,
      passengers: 1,
      nights: 4
    });
  }, []);

  const value = {
    destinations,
    featuredDestinations,
    isLoading,
    isFeaturedLoading,
    pendingRequestsCount,
    error,
    featuredError,
    loadDestinations,
    loadFeatured,
    selectedPlan,
    updateSelectedPlan,
    resetSelectedPlan,
    toastMessage,
    showToast
  };

  return (
    <DestinationsContext.Provider value={value}>
      {children}
    </DestinationsContext.Provider>
  );
}
