import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { roomService, type Room } from '../services/room.service';
import { bookingService, type Booking } from '../services/booking.service';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import {
    Home,
    MapPin,
    DollarSign,
    Image as ImageIcon,
    Edit,
    Trash2,
    ChevronLeft,
    CheckCircle,
    XCircle,
    LayoutDashboard
} from 'lucide-react';
import Modal from '../components/Modal';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');
    const [myRooms, setMyRooms] = useState<Room[]>([]);
    const [myReservations, setMyReservations] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
    const [formData, setFormData] = useState({
        title: '', description: '', address: '', city: '', pricePerNight: 0, maxGuests: 1, images: ['']
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (user?.role === 'HOST' || user?.role === 'ADMIN') {
                const [roomsData, bookingsData] = await Promise.all([
                    roomService.getAllRooms(),
                    bookingService.getHostReservations()
                ]);

                const allRooms = Array.isArray(roomsData) ? roomsData : (roomsData as any).data || [];
                setMyRooms(allRooms.filter((r: Room) => r.hostId === user.id));
                setMyReservations(Array.isArray(bookingsData) ? bookingsData : (bookingsData as any).data || []);
            }
        } catch (error) {
            console.error('Failed to fetch host data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyHost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editingRoomId) {
                await roomService.updateRoom(editingRoomId, formData);
                toast.success('Room updated successfully!');
            } else if (user?.role === 'USER') {
                await roomService.applyToBeHost(formData);
                toast.success('Application sent successfully! Please wait for admin approval.');
            } else {
                await roomService.createRoom(formData);
                toast.success('Room created successfully! Please wait for admin approval.');
            }
            fetchData();
            closeForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to apply/create/update');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditingRoomId(null);
        setFormData({ title: '', description: '', address: '', city: '', pricePerNight: 0, maxGuests: 1, images: [''] });
    };

    const openEditForm = (room: Room) => {
        setFormData({
            title: room.title,
            description: room.description || '',
            address: room.address,
            city: room.city,
            pricePerNight: Number(room.pricePerNight),
            maxGuests: room.maxGuests,
            images: room.images && room.images.length > 0 ? [room.images[0].imageUrl] : ['']
        });
        setEditingRoomId(room.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!roomToDelete) return;
        try {
            await roomService.deleteRoom(roomToDelete.id);
            toast.success('Room deleted successfully!');
            setRoomToDelete(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete room');
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        try {
            await bookingService.updateBookingStatus(bookingId, status);
            toast.success(`Booking ${status.toLowerCase()} successfully!`);
            setMyReservations(prev => prev.map(res => res.id === bookingId ? { ...res, status: status as any } : res));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update booking status');
        }
    };

    const renderRoomForm = () => (
        <div className="dashboard-form-container">
            <div className="card" style={{ padding: '2rem' }}>
                <div className="form-header">
                    <div className="flex-between">
                        <h2>{isEditing ? 'Edit Property Details' : user?.role === 'USER' ? 'Apply to become a Host' : 'Add New Property'}</h2>
                        <LayoutDashboard size={24} color="var(--primary)" />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {user?.role === 'USER'
                            ? 'Tell us about your first property to get started.'
                            : 'Fill in the details below to list your property.'}
                    </p>
                </div>

                <form onSubmit={handleApplyHost}>
                    <div className="form-section">
                        <h3 className="form-section-title"><Home size={18} /> Basic Information</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Property Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Cozy Apartment near City Center"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Describe your space, amenities, and surroundings..."
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title"><MapPin size={18} /> Location Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Street address"
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="City"
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title"><DollarSign size={18} /> Pricing & Capacity</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Price Per Night ($)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0"
                                    required
                                    min="0"
                                    value={formData.pricePerNight}
                                    onChange={e => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Max Guests</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="1"
                                    required
                                    min="1"
                                    value={formData.maxGuests}
                                    onChange={e => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title"><ImageIcon size={18} /> Property Images</h3>
                        <div className="form-group full-width">
                            <label>Images (URLs)</label>
                            <div className="image-inputs">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="image-input-item">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="https://example.com/image.jpg"
                                            required={index === 0}
                                            value={img}
                                            onChange={e => {
                                                const newImages = [...formData.images];
                                                newImages[index] = e.target.value;
                                                setFormData({ ...formData, images: newImages });
                                            }}
                                            style={{ flex: 1 }}
                                        />
                                        {formData.images.length > 1 && (
                                            <button type="button" className="btn-text" style={{ color: 'var(--danger)' }} onClick={() => {
                                                const newImages = formData.images.filter((_, i) => i !== index);
                                                setFormData({ ...formData, images: newImages });
                                            }}>Remove</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="btn-text" style={{ marginTop: '0.5rem' }} onClick={() => {
                                    setFormData({ ...formData, images: [...formData.images, ''] });
                                }}>+ Add another image URL</button>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={closeForm} className="btn-text" style={{ color: 'var(--text-secondary)' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEditing ? 'Update Property' : user?.role === 'USER' ? 'Submit Application' : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (user?.role === 'USER') {
        return (
            <div className="dashboard-page animate-fade-in">
                {!showForm ? (
                    <div className="card onboarding-card">
                        <div className="onboarding-icon-container">
                            <Home size={48} color="var(--primary)" />
                        </div>
                        <h2>Ready to Host?</h2>
                        <p>
                            Join our community of hosts and start earning. Share your space,
                            meet new people, and create unforgettable experiences for travelers.
                        </p>
                        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem', borderRadius: 'var(--radius-lg)' }}>
                            Apply to become a Host
                        </button>
                    </div>
                ) : (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={closeForm} className="btn-text" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <ChevronLeft size={18} /> Back to Overview
                        </button>
                        {renderRoomForm()}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="dashboard-page animate-fade-in">
            <div className="dashboard-header">
                <h1>Host Dashboard</h1>
                <p>Manage your properties and reservations.</p>
            </div>

            <div className="dashboard-tabs">
                <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
                    My Rooms
                </button>
                <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    Reservations
                </button>
            </div>

            <div className="dashboard-content">
                {isLoading ? (
                    <div className="loading-container">Loading data...</div>
                ) : activeTab === 'rooms' ? (
                    <div className="host-rooms">
                        <div className="flex-between" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Your Properties</h2>
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Room</button>
                        </div>

                        {showForm && renderRoomForm()}

                        {!showForm && myRooms.length === 0 ? (
                            <div className="card text-center" style={{ padding: '3rem 1rem' }}>
                                <p>You haven't added any properties yet.</p>
                            </div>
                        ) : !showForm && (
                            <div className="rooms-table-container card">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr><th>Property Name</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {myRooms.map(room => (
                                            <tr key={room.id}>
                                                <td><strong>{room.title}</strong></td>
                                                <td>{room.city}</td>
                                                <td>{formatCurrency(room.pricePerNight)}</td>
                                                <td><span className={`status-badge status-${room.status?.toLowerCase() || 'pending'}`}>{room.status || 'PENDING'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button className="btn-icon-text" onClick={() => openEditForm(room)} title="Edit">
                                                            <Edit size={16} /> Edit
                                                        </button>
                                                        <button className="btn-icon-text danger" onClick={() => setRoomToDelete(room)} title="Delete">
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="host-bookings">
                        <h2>Reservations</h2>
                        {myReservations.length === 0 ? (
                            <div className="card text-center" style={{ padding: '3rem 1rem' }}>
                                <p>No reservations for your properties yet.</p>
                            </div>
                        ) : (
                            <div className="rooms-table-container card">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr><th>Room</th><th>Guest</th><th>Dates</th><th>Status</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {myReservations.map(res => (
                                            <tr key={res.id}>
                                                <td>{res.room?.title}</td>
                                                <td>{res.user?.fullName} ({res.user?.email})</td>
                                                <td>{new Date(res.checkInDate).toLocaleDateString()} - {new Date(res.checkOutDate).toLocaleDateString()}</td>
                                                <td><span className={`status-badge status-${res.status?.toLowerCase()}`}>{res.status}</span></td>
                                                <td>
                                                    {res.status === 'PENDING' && (
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <button className="btn-icon-text success" onClick={() => handleStatusUpdate(res.id, 'CONFIRMED')}>
                                                                <CheckCircle size={16} /> Accept
                                                            </button>
                                                            <button className="btn-icon-text danger" onClick={() => handleStatusUpdate(res.id, 'CANCELLED')}>
                                                                <XCircle size={16} /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={!!roomToDelete} onClose={() => setRoomToDelete(null)} title="Confirm Deletion">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p>Are you sure you want to delete the property <strong>{roomToDelete?.title}</strong>? This action cannot be undone.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn-text" onClick={() => setRoomToDelete(null)}>Cancel</button>
                        <button className="btn-primary" style={{ backgroundColor: 'var(--danger)' }} onClick={confirmDelete}>Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
