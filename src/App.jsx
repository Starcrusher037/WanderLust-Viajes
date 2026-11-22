import { Routes, Route } from 'react-router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Planner from './pages/Planner';
import TechDocs from './pages/TechDocs';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="app-root-layout">
      {/* Barra de Navegación con NavLink y control de ruta activa */}
      <Navbar />

      {/* Contenedor Principal de Vistas */}
      <main className="main-content-viewport" id="main-content">
        <Routes>
          {/* Ruta Principal / Inicio */}
          <Route path="/" element={<Home />} />

          {/* Catálogo de Destinos (REST) */}
          <Route path="/destinos" element={<Destinations />} />

          {/* Detalle Dinámico de Destino con Vuelos y Hoteles (REST + GraphQL) */}
          <Route path="/destinos/:id" element={<DestinationDetail />} />

          {/* Planificador de Viaje Completo */}
          <Route path="/planificador" element={<Planner />} />

          {/* Documentación de Arquitectura, Mocks y Consola de Pruebas */}
          <Route path="/servicios" element={<TechDocs />} />

          {/* Control 404 para cualquier recurso o ruta no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Notificaciones flotantes tipo Toast */}
      <Toast />

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
