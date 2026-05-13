import { useState, useEffect } from 'react';
import { roomService, type Room } from '../services/room.service';
import RoomCard from '../components/RoomCard';
import './HomeBG.css';

const Home = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const data = await roomService.searchRooms(searchQuery.trim());
        if (!cancelled) setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to search rooms', error);
        if (!cancelled) setRooms([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, searchQuery ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchQuery]);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Find your perfect stay.</h1>
          <p>Discover beautiful places to stay and work anywhere in the country.</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Where are you going? (e.g. city, title)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-search">Search</button>
          </div>
        </div>
      </section>

      <section className="featured-rooms">
        <h2>Featured Rooms</h2>
        {isLoading ? (
          <div className="rooms-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="card room-card skeleton-card">
                <div className="skeleton skeleton-img"></div>
                <div className="room-content">
                  <div className="skeleton skeleton-text" style={{width: '80%', height: '24px', marginBottom: '1rem'}}></div>
                  <div className="skeleton skeleton-text" style={{width: '100%', height: '16px'}}></div>
                  <div className="skeleton skeleton-text" style={{width: '60%', height: '16px', marginTop: '0.5rem'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))
            ) : (
              <div className="empty-state">
                <h3>No rooms found</h3>
                <p>We couldn't find any rooms matching your search. Try a different query.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
