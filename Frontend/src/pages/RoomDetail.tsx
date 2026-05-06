import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, ArrowLeft } from 'lucide-react';
import { roomService, type Room } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { reviewService, type Review } from '../services/review.service';
import { paymentService } from '../services/payment.service';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './RoomDetail.css';

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingStatus, setBookingStatus] = useState<{ loading: boolean; error: string; success: boolean }>({
    loading: false, error: '', success: false
  });

  // Image Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'ONLINE'>('ONLINE');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchRoom = async () => {
      try {
        const data = await roomService.getRoomById(id);
        setRoom((data as any).data || data); // Adjust based on API wrapper
        
        // Fetch reviews
        const reviewsData = await reviewService.getRoomReviews(id);
        setReviews(Array.isArray(reviewsData) ? reviewsData : (reviewsData as any).data || []);
      } catch (error) {
        console.error('Failed to fetch room details or reviews', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleNextImage = () => {
    if (!room?.images || room.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % room.images!.length);
  };

  const handlePrevImage = () => {
    if (!room?.images || room.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + room.images!.length) % room.images!.length);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!room) return;

    setBookingStatus({ loading: true, error: '', success: false });

    // Calculate total price based on days
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * room.pricePerNight;

    if (diffDays <= 0) {
      setBookingStatus({ loading: false, error: 'Checkout date must be after Checkin date', success: false });
      return;
    }

    try {
      // Step 1: Open payment modal instead of directly booking
      setShowPaymentModal(true);
    } catch (error: any) {
      setBookingStatus({
        loading: false,
        error: error.response?.data?.message || 'Failed to prepare booking',
        success: false
      });
    }
  };

  const processBookingAndPayment = async () => {
    if (!room) return;
    setIsProcessingPayment(true);
    setBookingStatus({ loading: true, error: '', success: false });

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * room.pricePerNight;

    try {
      // Step 1: Create booking
      const bookingData = await bookingService.createBooking({
        roomId: room.id,
        checkIn: inDate.toISOString(),
        checkOut: outDate.toISOString()
      });

      // Step 2: Process payment
      await paymentService.processPayment({
        bookingId: (bookingData as any).data?.id || (bookingData as any).id || 'mock-id',
        method: paymentMethod,
        amount: totalPrice
      });

      setBookingStatus({ loading: false, error: '', success: true });
      toast.success('Booking and Payment Successful!');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (error: any) {
      setBookingStatus({
        loading: false,
        error: error.response?.data?.message || 'Failed to process booking/payment',
        success: false
      });
      toast.error('Payment failed');
    } finally {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  if (isLoading) return <div className="loading-container">Loading room details...</div>;
  if (!room) return <div className="loading-container">Room not found</div>;

  const imageUrl = room.images && room.images.length > 0
    ? room.images[currentImageIndex].url
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200';

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !room) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * room.pricePerNight : 0;
  };

  return (
    <div className="room-detail-page animate-fade-in">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back to Rooms
      </button>

      <div className="room-detail-header">
        <h1>{room.title}</h1>
        <div className="room-meta-info">
          <span><MapPin size={18} /> {room.address}, {room.city}</span>
          <span><Users size={18} /> Up to {room.maxGuests} guests</span>
        </div>
      </div>

      <div className="room-gallery">
        {room.images && room.images.length > 1 && (
          <button className="gallery-btn prev" onClick={handlePrevImage}>&lt;</button>
        )}
        <img src={imageUrl} alt={room.title} className="main-image" />
        {room.images && room.images.length > 1 && (
          <button className="gallery-btn next" onClick={handleNextImage}>&gt;</button>
        )}
        {room.images && room.images.length > 1 && (
          <div className="gallery-indicators">
            {room.images.map((_, idx) => (
              <span key={idx} className={`indicator ${idx === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(idx)}></span>
            ))}
          </div>
        )}
      </div>

      <div className="room-content-grid">
        <div className="room-description">
          <h2>About this space</h2>
          <p>{room.description || 'No description provided.'}</p>

          {room.host && (
            <div className="host-info">
              <h3>Hosted by {room.host.fullName}</h3>
            </div>
          )}
        </div>

        <div className="room-booking-card">
          <div className="card sticky-card">
            <div className="booking-price">
              <h3>${room.pricePerNight}</h3> <span>/ night</span>
            </div>

            <form onSubmit={handleBooking} className="booking-form">
              <div className="date-inputs">
                <div className="input-group">
                  <label>Check-in</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="input-group">
                  <label>Checkout</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {bookingStatus.error && <div className="alert alert-error">{bookingStatus.error}</div>}
              {bookingStatus.success && <div className="alert alert-success">Booking requested! Redirecting...</div>}

              {user?.role === 'HOST' || user?.role === 'ADMIN' ? (
                <button type="button" className="btn-primary" disabled>
                  Hosts cannot book rooms
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={bookingStatus.loading || bookingStatus.success}
                >
                  {bookingStatus.loading ? 'Processing...' : 'Reserve'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="room-reviews-section">
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card card">
                <div className="review-header">
                  <strong>{review.user?.fullName || 'Anonymous'}</strong>
                  <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                {review.createdAt && <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>}
                <p>{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img.url} alt={`Review ${idx}`} className="review-thumbnail" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Complete Your Booking">
        <div className="payment-modal-content">
          <p><strong>Total Amount:</strong> ${calculateTotalPrice()}</p>
          <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Select Payment Method</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
            >
              <option value="ONLINE">Online Payment (Credit Card/PayPal)</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash on Arrival</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn-text" onClick={() => setShowPaymentModal(false)} disabled={isProcessingPayment}>Cancel</button>
            <button className="btn-primary" onClick={processBookingAndPayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomDetail;
