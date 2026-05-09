import { useState, useEffect } from 'react';
import { bookingService, type Booking } from '../services/booking.service';
import { reviewService } from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  
  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', images: [''] });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(Array.isArray(data) ? data : (data as any).data || []);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, navigate]);

  const handleCancel = async () => {
    if (!bookingToCancel) return;
    try {
      await bookingService.cancelBooking(bookingToCancel);
      toast.success('Booking cancelled successfully');
      setBookingToCancel(null);
      // Refresh
      const data = await bookingService.getMyBookings();
      setBookings(Array.isArray(data) ? data : (data as any).data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleMockComplete = (bookingId: string) => {
    // For testing purposes, mock completing a booking
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'COMPLETED' as any } : b));
    toast.success('Mock: Booking marked as COMPLETED');
  };

  const submitReview = async () => {
    if (!reviewBooking) return;
    try {
      await reviewService.createReview(reviewBooking.id, {
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images.filter(img => img.trim() !== '')
      });
      toast.success('Review submitted successfully!');
      setReviewBooking(null);
      setReviewData({ rating: 5, comment: '', images: [''] });
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) return <div className="loading-container">Loading your bookings...</div>;

  return (
    <div className="bookings-page animate-fade-in">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage your upcoming and past stays.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state card">
          <h2>No bookings found</h2>
          <p>You haven't booked any rooms yet.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Explore Rooms
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="card booking-card">
              <div className="booking-info">
                <h3>{booking.room?.title || 'Unknown Room'}</h3>
                <div className="booking-dates">
                  <p><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                  <p><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                </div>
                <div className="booking-price">
                  <strong>Total:</strong> ${booking.totalPrice}
                </div>
              </div>

              <div className="booking-actions">
                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>

                {booking.status === 'PENDING' && (
                  <button onClick={() => setBookingToCancel(booking.id)} className="btn-cancel">
                    Cancel Booking
                  </button>
                )}
                
                {booking.status === 'CONFIRMED' && (
                  <button onClick={() => handleMockComplete(booking.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Mock Checkout
                  </button>
                )}

                {booking.status === 'COMPLETED' && (
                  <button onClick={() => setReviewBooking(booking)} className="btn-primary" style={{ backgroundColor: 'var(--success)' }}>
                    Write Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!bookingToCancel} onClose={() => setBookingToCancel(null)} title="Cancel Booking">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn-text" onClick={() => setBookingToCancel(null)}>Keep Booking</button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--danger)' }} onClick={handleCancel}>Confirm Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!reviewBooking} onClose={() => setReviewBooking(null)} title="Write a Review">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>How was your stay at <strong>{reviewBooking?.room?.title}</strong>?</p>
          
          <div className="input-group">
            <label>Rating (1-5)</label>
            <input 
              type="number" min="1" max="5" 
              value={reviewData.rating} 
              onChange={e => setReviewData({...reviewData, rating: Number(e.target.value)})} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
            />
          </div>

          <div className="input-group">
            <label>Comment</label>
            <textarea 
              rows={4} 
              value={reviewData.comment} 
              onChange={e => setReviewData({...reviewData, comment: e.target.value})} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', resize: 'vertical' }}
            />
          </div>

          <div className="input-group">
            <label>Image URL (Optional)</label>
            <input 
              type="text" 
              value={reviewData.images[0]} 
              onChange={e => setReviewData({...reviewData, images: [e.target.value]})} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn-text" onClick={() => setReviewBooking(null)}>Cancel</button>
            <button className="btn-primary" onClick={submitReview}>Submit Review</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
