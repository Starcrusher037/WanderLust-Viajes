# WanderLust Viajes - Agencia de Turismo

Plataforma web para una agencia de viajes interactiva construida como una Single Page Application (SPA) moderna con React, Vite y React Router. El sistema integra un catálogo de destinos turísticos internacionales, un cotizador dinámico de itinerarios y un módulo de reserva de vuelos y hoteles.

La comunicación de datos se realiza a través de una arquitectura híbrida que combina servicios REST y GraphQL, interceptados y resueltos en el cliente mediante Mock Service Worker (MSW).

---

## Caracteristicas Principales

- **Catalogo de Destinos Internacionales**: Exploracion de lugares turisticos con filtrado en tiempo real por busqueda de texto libre, pais de destino y categoria de viaje (playa, cultural, aventura, naturaleza).
- **Detalle de Destino y Cotizacion Dinamica**: Vista individual por destino con galeria, datos climaticos, tarifas base y actividades recomendadas.
- **Planificador de Viajes Integral**: Seleccion interactiva de vuelos comerciales (aerolinea, escalas, horarios, asientos) y hoteles asociados (estrellas, servicios, tarifas por noche).
- **Calculo de Presupuesto en Tiempo Real**: Calculo automatico del costo total segun la cantidad de pasajeros y el numero de noches seleccionadas, permitiendo generar confirmaciones de reserva.
- **Consola de Diagnostico Tecnico**: Panel interactivo integrado en la aplicacion para ejecutar y verificar en vivo las respuestas JSON de los servicios REST y GraphQL.
- **Resiliencia de Red y UX Accesible**:
  - Cancelacion automatica de peticiones obsoletas mediante `AbortController` para evitar condiciones de carrera.
  - Temporizador de seguridad (timeout) de 8000ms para evitar bloqueos por demoras de red.
  - Alertas accesibles con `role="alert"` y accion de reintento en caso de fallo.
  - Cache en memoria compartida a nivel de contexto (`DestinationsContext`) para optimizar la navegacion y evitar consultas repetidas.
  - Manejo de rutas no existentes con codigo HTTP 404 y vista visual amigable.

---

## Tecnologias Utilizadas

- **React 19**: Libreria principal para la construccion de la interfaz de usuario basada en componentes.
- **Vite 8**: Herramienta de compilacion y servidor de desarrollo ultrarrapido.
- **React Router 8**: Enrutamiento declarativo del lado del cliente sin recargas de pagina, con soporte para enlaces activos (`NavLink`) y parametros dinamicos (`:id`).
- **Mock Service Worker (MSW 3)**: Interceptacion de peticiones de red a nivel de Service Worker para simular APIs REST y GraphQL.
- **Lucide React**: Biblioteca de iconografia vectorial consistente y accesible.
- **Tailwind CSS 4**: Framework de utilidades CSS de última generación integrado nativamente mediante `@tailwindcss/vite` para estilos utilitarios ágiles y responsivos.
- **CSS3 Moderno**: Diseño responsivo con variables CSS, Flexbox, CSS Grid y diseño adaptable a dispositivos móviles y de escritorio.

---

## Rutas de la Aplicacion

| Ruta | Descripcion | Protocolo de Red |
|---|---|---|
| `/` | Pagina de inicio con presentacion del servicio y destinos destacados | REST (`GET /api/destinations/featured`) |
| `/destinos` | Catalogo completo con barra de busqueda y filtros combinados | REST (`GET /api/destinations`) |
| `/destinos/:id` | Detalle del destino con planificador integrado de vuelos y hoteles | REST (`GET /api/destinations/:id`) + GraphQL (`GetDestinationPlan`) |
| `/planificador` | Planificador global con selector dinamico de destino | GraphQL (`GetDestinationPlan`) |
| `/servicios` | Documentacion de arquitectura y consola interactiva de pruebas | REST y GraphQL |
| `*` | Pagina de error 404 para URLs no registradas | Enrutador React Router |

---

## Documentacion de la API para Terceros

El frontend realiza solicitudes HTTP convencionales (`fetch`) contra rutas relativas que son interceptadas de forma transparente por el Service Worker.

### 1. Endpoints REST

#### Obtener destinos destacados
- **Metodo**: `GET`
- **Ruta**: `/api/destinations/featured`
- **Descripcion**: Retorna un listado curado con los destinos marcados como destacados para la pantalla principal.
- **Respuesta (200 OK)**:
```json
[
  {
    "id": "cancun",
    "name": "Cancun y Riviera Maya",
    "country": "Mexico",
    "priceFrom": 750,
    "climate": "Tropical calido (28 C)",
    "featured": true,
    "activities": ["Snorkel en arrecifes", "Visita a ruinas mayas de Tulum"]
  }
]
```

#### Listar y filtrar destinos
- **Metodo**: `GET`
- **Ruta**: `/api/destinations`
- **Parametros de consulta (Query Params)**:
  - `search` (opcional): Filtra por nombre, pais o actividad.
  - `country` (opcional): Filtra por pais especifico.
  - `category` (opcional): Filtra por categoria (`playa`, `cultural`, `aventura`, `naturaleza`).
  - `simulateError` (opcional): Valores `500` o `network` para pruebas de tolerancia a fallos.
- **Respuesta (200 OK)**: Coleccion de objetos de destino que coinciden con los criterios.

#### Obtener detalle de un destino por ID
- **Metodo**: `GET`
- **Ruta**: `/api/destinations/:id`
- **Parametros de ruta**: `id` (identificador unico, ej. `cancun`, `tokyo`, `paris`).
- **Codigos de respuesta**:
  - `200 OK`: Devuelve el objeto del destino solicitado.
  - `404 Not Found`: Si el identificador no existe en el catalogo.

---

### 2. Endpoint GraphQL

- **Metodo**: `POST`
- **Ruta**: `/graphql`
- **Cabeceras**: `Content-Type: application/json`

#### Operacion: `GetDestinationPlan`
Consulta el inventario de vuelos disponibles y opciones de hospedaje asociadas a un destino particular.

**Documento de Consulta**:
```graphql
query GetDestinationPlan($destinationId: ID!) {
  destinationPlan(destinationId: $destinationId) {
    destinationId
    destinationName
    flights {
      id
      airline
      flightNumber
      origin
      destination
      departureTime
      arrivalTime
      stops
      cabinClass
      price
      availableSeats
    }
    hotels {
      id
      name
      stars
      rating
      reviewsCount
      address
      amenities
      roomType
      pricePerNight
      availableRooms
      imageUrl
    }
  }
}
```

**Variables**:
```json
{
  "destinationId": "tokyo"
}
```

---

## Guia de Instalacion y Puesta en Marcha

### Prerrequisitos
- Node.js version 18.0 o superior.
- Gestor de paquetes npm (incluido con Node.js).

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd agencia-turismo
npm install
```

### 2. Iniciar el entorno de desarrollo
```bash
npm run dev
```
La aplicacion estara disponible localmente en `http://localhost:5173`. Al cargar la pagina, el Service Worker se registrara automaticamente e interceptara las peticiones de datos.

### 3. Ejecutar analisis estatico (Linter)
```bash
npm run lint
```

### 4. Compilar para produccion
```bash
npm run build
```
Genera los archivos optimizados dentro del directorio `dist/`.

### 5. Previsualizar la compilacion de produccion
```bash
npm run preview
```

### 6. Despliegue en GitHub Pages (gh-pages)

Existen dos alternativas automatizadas para publicar el proyecto en GitHub Pages:

#### Opcion A: Despliegue automatico mediante GitHub Actions (Recomendado)
El proyecto incluye el flujo de trabajo configurado en `.github/workflows/deploy.yml`. 
1. Sube tu codigo a GitHub:
   ```bash
   git add .
   git commit -m "feat: proyecto agencia de turismo"
   git push origin main
   ```
2. En GitHub, ingresa a **Settings > Pages** y en **Build and deployment > Source** selecciona **GitHub Actions**. La aplicacion se compilara y desplegara de forma automatica en cada push a `main`.

#### Opcion B: Despliegue manual con script npm
```bash
npm run deploy
```
Este comando ejecuta automaticamente `npm run build` y publica la carpeta `dist/` en la rama `gh-pages` de tu repositorio remoto.

---

## Compatibilidad y Pruebas en Navegadores

La aplicacion ha sido disenada y testeada siguiendo los estandares web modernos (W3C, ECMAScript 2022, Service Workers API, Fetch API y CSS Grid / Flexbox).

| Navegador | Estado de Compatibilidad | Pruebas Realizadas |
|---|---|---|
| Google Chrome (v100+) | 100% Compatible | Interceptacion de Service Worker, renderizado responsivo y navegacion fluida. |
| Mozilla Firefox (v100+) | 100% Compatible | Resolucion de promesas asincronas, cache en contexto y consultas GraphQL. |
| Microsoft Edge (v100+) | 100% Compatible | Consola tecnica interactiva, estilos Tailwind y cancelacion con AbortController. |
| Apple Safari (v15.4+) | 100% Compatible | Flexbox gap, CSS Grid dinámico, compatibilidad con Service Workers en iOS y macOS. |
| Navegadores Moviles (Chrome Android / Mobile Safari) | 100% Compatible | Interfaz tactil responsiva, modales adaptables y formulario de planificacion. |

---

## Estructura del Proyecto

```
agencia-turismo/
├── public/
│   ├── favicon.svg             # Icono de la aplicacion
│   ├── icons.svg               # Conjunto de recursos vectoriales
│   └── mockServiceWorker.js    # Script oficial del Service Worker generado por MSW
├── src/
│   ├── assets/                 # Recursos multimedia e imagenes de apoyo
│   ├── components/             # Componentes reutilizables de la interfaz
│   │   ├── AlertError.jsx      # Componente de error accesible con boton de reintento
│   │   ├── FlightCard.jsx      # Tarjeta descriptiva de vuelos comerciales
│   │   ├── Footer.jsx          # Pie de pagina institucional y navegacion
│   │   ├── HotelCard.jsx       # Tarjeta de opciones hoteleras y servicios
│   │   ├── Navbar.jsx          # Barra superior con enlaces activos e indicador MSW
│   │   ├── Toast.jsx           # Notificaciones emergentes
│   │   └── TripPlannerSummary.jsx # Resumen de itinerario y modal de confirmacion
│   ├── context/
│   │   └── DestinationsContext.jsx # Estado global y almacenamiento en cache en memoria
│   ├── hooks/
│   │   └── useDestinationsContext.js # Hook personalizado para acceder al contexto
│   ├── mocks/
│   │   ├── browser.js          # Inicializacion del worker de MSW en el navegador
│   │   ├── data.js             # Base de datos simulada (destinos, vuelos y hoteles)
│   │   └── handlers.js         # Interceptores para endpoints REST y operaciones GraphQL
│   ├── pages/
│   │   ├── Home.jsx            # Pantalla principal con hero y destacados
│   │   ├── Destinations.jsx    # Catalogo filtrable de destinos
│   │   ├── DestinationDetail.jsx # Detalle del destino con planificador integrado
│   │   ├── Planner.jsx         # Planificador global con calculo de presupuesto
│   │   ├── TechDocs.jsx        # Documentacion tecnica interna y consola de pruebas
│   │   └── NotFound.jsx        # Vista 404 para rutas inexistentes
│   ├── services/
│   │   └── api.js              # Capa de consumo de API con AbortController y Timeout
│   ├── App.jsx                 # Configuracion de rutas principales de la aplicacion
│   ├── index.css               # Sistema de diseno y estilos globales
│   └── main.jsx                # Punto de entrada; inicializa MSW antes del montaje de React
├── eslint.config.js            # Configuracion de reglas de ESLint
├── index.html                  # Plantilla HTML raiz
├── package.json                # Definicion de dependencias y scripts del proyecto
└── vite.config.js              # Configuracion del empaquetador Vite
```

---

## Simulacion de Backend mediante Mock Service Worker (MSW)

Este proyecto esta concebido como una aplicacion donde se busca **simular completamente el comportamiento de un backend real a traves de Mock Service Worker (MSW)**.

En lugar de desplegar una infraestructura de servidor separada (como Express, NestJS o Django) o utilizar datos estaticos importados directamente en los componentes, la aplicacion utiliza la API de Service Workers nativa del navegador para capturar las peticiones en la capa de red:

1. **Interceptacion a Nivel de Red**:
   Cuando la aplicacion ejecuta una llamada `fetch('/api/destinations')` o un `fetch('/graphql')`, el Service Worker de MSW captura la peticion antes de que viaje a Internet, ejecutando los manejadores definidos en `src/mocks/handlers.js`.

2. **Consumo de APIs Realista**:
   Desde la perspectiva de los componentes de React y de la capa de servicios (`src/services/api.js`), la aplicacion se comporta exactamente igual que si estuviera conectada a un servidor de produccion. Los datos se envian y reciben mediante cabeceras HTTP reales, serializacion JSON, codigos de estado (200, 404, 500) y tiempos de respuesta simulados.

3. **Arquitectura Hibrida REST y GraphQL**:
   El proyecto demuestra como simular simultaneamente dos paradigmas de comunicacion ampliamente utilizados en la industria:
   - **REST**: Para recursos estructurados y operaciones CRUD de catalogo.
   - **GraphQL**: Para consultas complejas y anidadas que relacionan destinos, vuelos y hoteles en una sola operacion.

4. **Ventajas de esta Simulacion**:
   - **Desacoplamiento Total**: Permite desarrollar, evaluar y probar flujos complejos de usuario sin dependencia de un servidor backend activo.
   - **Pruebas de Resiliencia**: Facilita la simulacion de caidas del servidor (errores 500), fallos de conexion de red y limites de tiempo (timeouts).
   - **Facilidad de Despliegue**: El proyecto puede compilarse y publicarse en cualquier servicio de hosting estatico (Vercel, Netlify, GitHub Pages) manteniendo todas sus funcionalidades operativas para terceros.
