import { Plane, Clock, CheckCircle2, Users } from 'lucide-react';

export default function FlightCard({ flight, isSelected, onSelect }) {
  return (
    <div className={`travel-item-card flight-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header-row">
        <div className="airline-badge">
          <Plane size={18} className="item-icon-blue" />
          <span className="airline-name">{flight.airline}</span>
          <span className="flight-number">({flight.flightNumber})</span>
        </div>
        <span className="cabin-badge">{flight.cabinClass}</span>
      </div>

      <div className="flight-itinerary-grid">
        <div className="time-block">
          <div className="time-text">{flight.departureTime}</div>
          <div className="airport-label">{flight.origin}</div>
        </div>

        <div className="flight-path-middle">
          <div className="duration-label">
            <Clock size={12} /> {flight.duration}
          </div>
          <div className="path-visual-line">
            <span className="dot start-dot" />
            <span className="line" />
            <Plane size={14} className="plane-flying" />
            <span className="line" />
            <span className="dot end-dot" />
          </div>
          <div className="stops-label">{flight.stops}</div>
        </div>

        <div className="time-block text-right">
          <div className="time-text">{flight.arrivalTime}</div>
          <div className="airport-label">{flight.destination}</div>
        </div>
      </div>

      <div className="card-footer-row">
        <div className="availability-info">
          <Users size={14} />
          <span>{flight.availableSeats} asientos disponibles</span>
        </div>

        <div className="pricing-action-block">
          <div className="price-tag">
            <span className="currency">$</span>
            <span className="amount">{flight.price}</span>
            <span className="unit">USD / persona</span>
          </div>

          <button
            type="button"
            className={`btn-select-item ${isSelected ? 'active' : ''}`}
            onClick={() => onSelect(flight)}
          >
            {isSelected ? (
              <>
                <CheckCircle2 size={16} /> Vuelo Seleccionado
              </>
            ) : (
              'Elegir este vuelo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
