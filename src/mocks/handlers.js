import { http, HttpResponse, delay } from 'msw';
import { graphql } from 'msw/graphql';
import { DESTINATIONS_DATA, FLIGHTS_AND_HOTELS_DATA } from './data';

const gql = graphql.link('/graphql');

export const handlers = [
  // 1. REST: Destacados (Colocado ANTES de :id para proteger la ruta del parámetro dinámico)
  http.get('/api/destinations/featured', async () => {
    await delay(350);
    const featured = DESTINATIONS_DATA.filter(d => d.featured);
    return HttpResponse.json(featured, { status: 200 });
  }),

  // 2. REST: Listado general de destinos (con soporte de filtros y simulación de error/demora)
  http.get('/api/destinations', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const search = url.searchParams.get('q')?.toLowerCase() || '';
    const country = url.searchParams.get('country') || '';
    const category = url.searchParams.get('category') || '';
    const simulateError = url.searchParams.get('simulateError');

    // Permite simular un fallo 500 para probar la respuesta del frontend y botón de reintento
    if (simulateError === '500') {
      return HttpResponse.json(
        { message: 'Error interno simulado en el servidor de destinos' },
        { status: 500 }
      );
    }
    if (simulateError === 'network') {
      return HttpResponse.error();
    }

    let results = DESTINATIONS_DATA;

    if (country && country !== 'all') {
      results = results.filter(d => d.country.toLowerCase() === country.toLowerCase());
    }

    if (category && category !== 'all') {
      results = results.filter(d => d.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search) {
      results = results.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.country.toLowerCase().includes(search) ||
        d.activities.some(act => act.toLowerCase().includes(search))
      );
    }

    return HttpResponse.json(results, { status: 200 });
  }),

  // 3. REST: Detalle dinámico de un destino por ID con respuesta 404 controlada
  http.get('/api/destinations/:id', async ({ params }) => {
    await delay(250);
    const { id } = params;
    const destination = DESTINATIONS_DATA.find(d => d.id === id);

    if (!destination) {
      return HttpResponse.json(
        {
          error: 'Not Found',
          message: `El destino con identificador "${id}" no existe en el catálogo.`
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(destination, { status: 200 });
  }),

  // 4. GraphQL: Consulta de vuelos y hoteles disponibles por destino
  gql.query('GetDestinationPlan', async ({ variables }) => {
    await delay(400);
    const destinationId = variables?.destinationId;

    if (!destinationId || !FLIGHTS_AND_HOTELS_DATA[destinationId]) {
      return HttpResponse.json({
        errors: [
          {
            message: `No se encontraron opciones de vuelos y hoteles para el destino "${destinationId}".`,
            extensions: { code: 'DESTINATION_NOT_FOUND' }
          }
        ],
        data: null
      });
    }

    const plan = FLIGHTS_AND_HOTELS_DATA[destinationId];

    return HttpResponse.json({
      data: {
        destinationPlan: {
          destinationId,
          flights: plan.flights,
          hotels: plan.hotels
        }
      }
    });
  }),

  // 5. GraphQL fallback HTTP POST: Para compatibilidad universal con peticiones POST directas a /graphql
  http.post('/graphql', async ({ request }) => {
    await delay(350);
    try {
      const body = await request.json();
      const destinationId = body.variables?.destinationId;

      if (!destinationId || !FLIGHTS_AND_HOTELS_DATA[destinationId]) {
        return HttpResponse.json({
          errors: [
            {
              message: `No se encontraron opciones para el destino "${destinationId}".`,
              extensions: { code: 'DESTINATION_NOT_FOUND' }
            }
          ],
          data: null
        });
      }

      const plan = FLIGHTS_AND_HOTELS_DATA[destinationId];

      return HttpResponse.json({
        data: {
          destinationPlan: {
            destinationId,
            flights: plan.flights,
            hotels: plan.hotels
          }
        }
      });
    } catch {
      return HttpResponse.json(
        { errors: [{ message: 'Cuerpo de petición GraphQL inválido.' }] },
        { status: 400 }
      );
    }
  })
];
