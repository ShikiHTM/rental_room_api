import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { type Room } from '../services/room.service';
import './RoomCard.css';

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  const imageUrl = room.images && room.images.length > 0 
    ? room.images[0].url 
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'; // High-quality fallback image

  return (
    <Link to={`/rooms/${room.id}`} className="card room-card animate-fade-in">
      <div className="room-image">
        <img src={imageUrl} alt={room.title} loading="lazy" />
        <div className="room-price-badge">
          ${room.pricePerNight.toLocaleString()} <span>/ night</span>
        </div>
      </div>
      <div className="room-content">
        <h3 className="room-title">{room.title}</h3>
        <p className="room-description-snippet">{room.description ? room.description.substring(0, 60) + '...' : 'Beautiful stay...'}</p>
        <div className="room-meta">
          <span className="meta-item">
            <MapPin size={16} />
            {room.city}
          </span>
          <span className="meta-item">
            <Users size={16} />
            Up to {room.maxGuests}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
