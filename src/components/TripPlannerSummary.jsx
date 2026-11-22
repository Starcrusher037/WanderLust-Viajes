import { useState } from 'react';
import { useDestinationsContext } from '../hooks/useDestinationsContext';
import { Plane, Hotel, Calendar, Users, CheckCircle, Sparkles, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export default function TripPlannerSummary({ destination }) {
  const { selectedPlan, updateSelectedPlan, resetSelectedPlan, showToast } = useDestinationsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [reservationCode, setReservationCode] = useState('');

  const { selectedFlight, selectedHotel, passengers, nights } = selectedPlan;

  const flightTotal = selectedFlight ? selectedFlight.price * passengers : 0;
  const hotelTotal = selectedHotel ? selectedHotel.pricePerNight * nights : 0;
  const grandTotal = flightTotal + hotelTotal;

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    const newCode = `WL-${Math.floor(100000 + Math.random() * 900000)}`;
    setReservationCode(newCode);
    setBookingCompleted(true);
    showToast(`¡Reserva confirmada con éxito para ${destination?.name || 'tu viaje'}!`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (bookingCompleted) {
      setBookingCompleted(false);
      resetSelectedPlan();
    }
  };

  return (
    <aside className="planner-summary-sidebar">
      <div className="planner-box">
        <div className="planner-header">
          <div className="header-badge">
            <Sparkles size={16} /> Experiencia Completa
          </div>
          <h3 className="planner-title">Tu Plan de Viaje</h3>
          <p className="planner-subtitle">
            Combina Vuelos + Hoteles consultados en tiempo real por GraphQL.
          </p>
        </div>

        {/* Destino Seleccionado */}
        <div className="selected-destination-chip">
          <span className="chip-label">Destino:</span>
          <strong>{destination?.name || 'Selecciona un destino'}</strong>
          <span className="country-sub">({destination?.country || '-'})</span>
        </div>

        {/* Parámetros del viaje */}
        <div className="planner-controls-grid">
          <div className="control-item">
            <label htmlFor="passengers-select">
              <Users size={14} /> Pasajeros
            </label>
            <select
              id="passengers-select"
              value={passengers}
              onChange={(e) => updateSelectedPlan({ passengers: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
          </div>

          <div className="control-item">
            <label htmlFor="nights-select">
              <Calendar size={14} /> Noches
            </label>
            <select
              id="nights-select"
              value={nights}
              onChange={(e) => updateSelectedPlan({ nights: Number(e.target.value) })}
            >
              {[2, 3, 4, 5, 7, 10, 14].map(num => (
                <option key={num} value={num}>
                  {num} noches
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Elementos seleccionados */}
        <div className="selection-status-list">
          <div className={`status-item ${selectedFlight ? 'confirmed' : 'empty'}`}>
            <div className="status-item-header">
              <Plane size={16} />
              <span>Vuelo seleccionado</span>
            </div>
            {selectedFlight ? (
              <div className="status-item-body">
                <strong>{selectedFlight.airline} ({selectedFlight.flightNumber})</strong>
                <div>{selectedFlight.origin} → {selectedFlight.destination}</div>
                <div className="sub-price">${selectedFlight.price} USD × {passengers} = <strong>${flightTotal} USD</strong></div>
              </div>
            ) : (
              <div className="status-item-placeholder">No has seleccionado un vuelo aún.</div>
            )}
          </div>

          <div className={`status-item ${selectedHotel ? 'confirmed' : 'empty'}`}>
            <div className="status-item-header">
              <Hotel size={16} />
              <span>Hotel seleccionado</span>
            </div>
            {selectedHotel ? (
              <div className="status-item-body">
                <strong>{selectedHotel.name}</strong>
                <div>{selectedHotel.roomType}</div>
                <div className="sub-price">${selectedHotel.pricePerNight} USD/noche × {nights} noches = <strong>${hotelTotal} USD</strong></div>
              </div>
            ) : (
              <div className="status-item-placeholder">No has seleccionado un hotel aún.</div>
            )}
          </div>
        </div>

        {/* Total y Acción */}
        <div className="planner-total-section">
          <div className="total-row">
            <span className="total-label">Inversión Estimada:</span>
            <span className="total-value">${grandTotal} <small>USD</small></span>
          </div>

          <button
            type="button"
            className="btn-reserve-plan"
            disabled={!selectedFlight && !selectedHotel}
            onClick={() => setIsModalOpen(true)}
          >
            Confirmar y Reservar Plan
            <ArrowRight size={16} />
          </button>

          {!selectedFlight && !selectedHotel && (
            <p className="notice-empty">
              Selecciona al menos una opción de vuelo u hotel para reservar.
            </p>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Reserva Simulada */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={handleCloseModal} aria-label="Cerrar ventana">
              <X size={20} />
            </button>

            {!bookingCompleted ? (
              <div>
                <div className="modal-header">
                  <Sparkles size={24} className="accent-sparkle" />
                  <h3>Confirmar Plan de Viaje a {destination?.name}</h3>
                  <p>Revisa el desglose de tu viaje antes de completar la reserva simulada.</p>
                </div>

                <div className="reservation-breakdown">
                  <div className="breakdown-card">
                    <h4>Detalle de Pasajeros y Estadía</h4>
                    <p><strong>Pasajeros:</strong> {passengers} | <strong>Duración:</strong> {nights} noches</p>
                  </div>

                  {selectedFlight && (
                    <div className="breakdown-card">
                      <div className="card-badge"><Plane size={14} /> Vuelo</div>
                      <p><strong>{selectedFlight.airline}</strong> ({selectedFlight.flightNumber})</p>
                      <p>{selectedFlight.origin} → {selectedFlight.destination} ({selectedFlight.departureTime})</p>
                      <p className="price-line">Total vuelo: ${flightTotal} USD</p>
                    </div>
                  )}

                  {selectedHotel && (
                    <div className="breakdown-card">
                      <div className="card-badge"><Hotel size={14} /> Hotel</div>
                      <p><strong>{selectedHotel.name}</strong> ({selectedHotel.stars} estrellas)</p>
                      <p>{selectedHotel.roomType}</p>
                      <p className="price-line">Total hotel: ${hotelTotal} USD</p>
                    </div>
                  )}

                  <div className="breakdown-total">
                    <span>Total Final:</span>
                    <strong>${grandTotal} USD</strong>
                  </div>
                </div>

                <form onSubmit={handleConfirmReservation} className="reservation-form">
                  <div className="form-group">
                    <label>Nombre del Pasajero Principal:</label>
                    <input type="text" required placeholder="Ej. Camila Morales" defaultValue="Leonardo Explorador" />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico de Confirmación:</label>
                    <input type="email" required placeholder="tu-correo@ejemplo.com" defaultValue="viajero@wanderlust.com" />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                      Modificar Selección
                    </button>
                    <button type="submit" className="btn-primary">
                      Emitir Reserva Simulada
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="booking-success-view">
                <div className="success-icon-wrap">
                  <CheckCircle size={48} className="success-icon" />
                </div>
                <h3>¡Tu Viaje ha sido Confirmado!</h3>
                <p>
                  Código de reserva simulada: <strong>{reservationCode}</strong>
                </p>
                <p className="success-sub">
                  Se ha enviado la confirmación con los itinerarios de vuelos y el bono de hotel a tu correo.
                </p>
                <div className="success-actions">
                  <button type="button" className="btn-primary" onClick={handleCloseModal}>
                    Aceptar y Planificar Otro Viaje
                  </button>
                  <Link to="/destinos" className="btn-secondary" onClick={handleCloseModal}>
                    Ver Más Destinos
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
