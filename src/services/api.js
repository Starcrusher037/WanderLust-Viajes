/**
 * Capa de servicio centralizada para peticiones REST y GraphQL.
 * Incorpora:
 * - Soporte para cancelación mediante AbortController / AbortSignal
 * - Límite de tiempo con AbortSignal.timeout o temporizador de seguridad
 * - Mensajes de error claros y amigables (reemplaza 'Failed to fetch')
 * - Manejo específico de respuestas HTTP 404 y 500
 */

const DEFAULT_TIMEOUT_MS = 8000;

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Combina la señal externa (si existe) con un timeout configurable.
 */
function createCombinedSignal(externalSignal, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('Tiempo de espera agotado. El servidor tardó demasiado en responder.', 'TimeoutError'));
  }, timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        controller.abort(externalSignal.reason);
      }, { once: true });
    }
  }

  return { signal: controller.signal, cleanup: () => clearTimeout(timeoutId) };
}

/**
 * Traduce fallos de red y rechazos a mensajes comprensibles para el usuario.
 */
function formatFetchError(error) {
  if (error.name === 'AbortError') {
    // Si fue cancelada voluntariamente por cambio de ruta o filtro
    return error;
  }
  if (error.name === 'TimeoutError' || error.message?.includes('Tiempo de espera agotado')) {
    return new ApiError('Tiempo de espera agotado al conectar con el servicio. Por favor, reintenta.', 408);
  }
  if (error instanceof ApiError) {
    return error;
  }
  // Reemplaza el genérico 'Failed to fetch'
  return new ApiError('No fue posible comunicarse con el servicio. Comprueba tu conexión a la red y vuelve a intentar.', 0);
}

// ==========================================
// SERVICIOS REST
// ==========================================

/**
 * Obtiene la lista completa o filtrada de destinos disponibles (REST).
 */
export async function getDestinations({ search = '', country = '', category = '', simulateError = '', signal = null } = {}) {
  const { signal: combinedSignal, cleanup } = createCombinedSignal(signal);

  try {
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (country && country !== 'all') params.append('country', country);
    if (category && category !== 'all') params.append('category', category);
    if (simulateError) params.append('simulateError', simulateError);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/destinations${queryString}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: combinedSignal
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new ApiError('No se encontraron destinos con los criterios seleccionados.', 404);
      }
      if (res.status >= 500) {
        throw new ApiError('El servidor de destinos experimentó un problema temporal (Error 500).', res.status);
      }
      throw new ApiError(`Error al consultar destinos (${res.status}).`, res.status);
    }

    return await res.json();
  } catch (err) {
    throw formatFetchError(err);
  } finally {
    cleanup();
  }
}

/**
 * Obtiene los destinos destacados para la página de inicio (REST).
 */
export async function getFeaturedDestinations({ signal = null } = {}) {
  const { signal: combinedSignal, cleanup } = createCombinedSignal(signal);

  try {
    const res = await fetch('/api/destinations/featured', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: combinedSignal
    });

    if (!res.ok) {
      throw new ApiError(`No se pudieron cargar los destinos destacados (${res.status}).`, res.status);
    }

    return await res.json();
  } catch (err) {
    throw formatFetchError(err);
  } finally {
    cleanup();
  }
}

/**
 * Obtiene el detalle de un destino específico por ID (REST).
 * Maneja el 404 si el destino no existe en el catálogo.
 */
export async function getDestinationById(id, { signal = null } = {}) {
  const { signal: combinedSignal, cleanup } = createCombinedSignal(signal);

  try {
    const res = await fetch(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: combinedSignal
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new ApiError(`El destino con ID "${id}" no existe o fue retirado del catálogo.`, 404);
      }
      throw new ApiError(`Error al obtener información del destino (${res.status}).`, res.status);
    }

    return await res.json();
  } catch (err) {
    throw formatFetchError(err);
  } finally {
    cleanup();
  }
}

// ==========================================
// SERVICIOS GRAPHQL
// ==========================================

export const GET_DESTINATION_PLAN_QUERY = `
  query GetDestinationPlan($destinationId: ID!) {
    destinationPlan(destinationId: $destinationId) {
      destinationId
      flights {
        id
        airline
        flightNumber
        origin
        destination
        departureTime
        arrivalTime
        duration
        price
        stops
        availableSeats
        cabinClass
      }
      hotels {
        id
        name
        stars
        pricePerNight
        address
        amenities
        rating
        reviewsCount
        roomType
        availableRooms
        imageUrl
      }
    }
  }
`;

/**
 * Consulta vuelos y hoteles correspondientes a un destino mediante GraphQL.
 */
export async function getDestinationPlan(destinationId, { signal = null } = {}) {
  const { signal: combinedSignal, cleanup } = createCombinedSignal(signal);

  try {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: GET_DESTINATION_PLAN_QUERY,
        variables: { destinationId }
      }),
      signal: combinedSignal
    });

    if (!res.ok) {
      throw new ApiError(`El servicio de vuelos y hoteles respondió con código ${res.status}.`, res.status);
    }

    const result = await res.json();

    if (result.errors && result.errors.length > 0) {
      const mainError = result.errors[0];
      throw new ApiError(mainError.message || 'Error al procesar la consulta GraphQL de opciones de viaje.', 404, result.errors);
    }

    return result.data?.destinationPlan || null;
  } catch (err) {
    throw formatFetchError(err);
  } finally {
    cleanup();
  }
}
