import { Star, MapPin, CheckCircle2, BedDouble, Check } from 'lucide-react';

export default function HotelCard({ hotel, isSelected, onSelect }) {
  return (
    <div className={`travel-item-card hotel-card ${isSelected ? 'selected' : ''}`}>
      <div className="hotel-card-inner">
        <div className="hotel-image-wrap">
          <img src={hotel.imageUrl} alt={hotel.name} className="hotel-photo" loading="lazy" />
          <div className="hotel-rating-chip">
            <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
            <span>{hotel.rating}</span>
            <span className="reviews-sub">({hotel.reviewsCount})</span>
          </div>
        </div>

        <div className="hotel-content-wrap">
          <div className="hotel-header-info">
            <div className="stars-row">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />
              ))}
              <span className="hotel-stars-label">{hotel.stars} Estrellas</span>
            </div>
            <h4 className="hotel-name">{hotel.name}</h4>
            <p className="hotel-address">
              <MapPin size={13} /> {hotel.address}
            </p>
          </div>

          <div className="room-type-info">
            <BedDouble size={14} className="room-icon" />
            <span>{hotel.roomType}</span>
            <span className="rooms-left">({hotel.availableRooms} habitaciones disponibles)</span>
          </div>

          <div className="amenities-tags-list">
            {hotel.amenities.map((amenity, idx) => (
              <span key={idx} className="amenity-chip">
                <Check size={11} /> {amenity}
              </span>
            ))}
          </div>

          <div className="card-footer-row hotel-footer">
            <div className="price-tag">
              <span className="currency">$</span>
              <span className="amount">{hotel.pricePerNight}</span>
              <span className="unit">USD / noche</span>
            </div>

            <button
              type="button"
              className={`btn-select-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(hotel)}
            >
              {isSelected ? (
                <>
                  <CheckCircle2 size={16} /> Hotel Seleccionado
                </>
              ) : (
                'Elegir este hotel'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
