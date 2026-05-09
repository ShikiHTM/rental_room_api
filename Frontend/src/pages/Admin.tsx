import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { type User } from '../services/auth.service';
import { type Room } from '../services/room.service';
import toast from 'react-hot-toast';
import './Admin.css';

const UserRow = ({ user }: { user: User }) => {
  const [bannedAt, setBannedAt] = useState<string | null | undefined>(user.bannedAt);

  const handleBan = async () => {
    try {
      const updatedUser = await adminService.banUser(user.id);
      setBannedAt(updatedUser?.bannedAt || new Date().toISOString());
    } catch (error) {
      // Error handled in service
    }
  };

  const handleUnban = async () => {
    try {
      await adminService.unbanUser(user.id);
      setBannedAt(null);
    } catch (error) {
      // Error handled in service
    }
  };

  return (
    <tr>
      <td><strong>{user.fullName}</strong></td>
      <td>{user.email}</td>
      <td>
        <span className={`status-badge status-${user.role?.toLowerCase() || 'user'}`}>
          {user.role || 'USER'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {bannedAt ? (
            <button className="btn-text" style={{ color: 'var(--success)' }} onClick={handleUnban}>
              Unban
            </button>
          ) : (
            <button className="btn-text" style={{ color: 'var(--danger)' }} onClick={handleBan}>
              Ban User
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const RoomRow = ({ room }: { room: Room }) => {
  const [status, setStatus] = useState<string>(room.status || 'PENDING');

  const handleUpdateAction = async (action: 'APPROVE' | 'REJECT') => {
    try {
      await adminService.updateRoomStatus(room.id, action);
      setStatus(action === 'APPROVE' ? 'APPROVED' : 'REJECTED');
    } catch (error) {
      // Error handled in service
    }
  };

  return (
    <tr>
      <td><strong>{room.title}</strong></td>
      <td>{room.hostId || (room.host?.email)}</td>
      <td>{room.address}, {room.city}</td>
      <td>
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {status}
        </span>
      </td>
      <td>
        {status === 'PENDING' ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-text" style={{ color: 'var(--success)' }} onClick={() => handleUpdateAction('APPROVE')}>
              Approve
            </button>
            <button className="btn-text" style={{ color: 'var(--danger)' }} onClick={() => handleUpdateAction('REJECT')}>
              Reject
            </button>
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>No actions needed</span>
        )}
      </td>
    </tr>
  );
};

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'rooms'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      toast.error('Unauthorized access. Admin role required.');
      navigate('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, roomsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllRooms()
      ]);
      setUsers(Array.isArray(usersData) ? usersData : (usersData as any).data || []);
      setRooms(Array.isArray(roomsData) ? roomsData : (roomsData as any).data || []);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, roles, and property approvals.</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
        >
          Users Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} 
          onClick={() => setActiveTab('rooms')}
        >
          Property Approvals
        </button>
      </div>

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-container">Loading admin data...</div>
        ) : activeTab === 'users' ? (
          <div className="admin-users card">
            <h2>System Users</h2>
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="rooms-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <UserRow key={u.id} user={u} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-rooms card">
            <h2>Property Approvals</h2>
            {rooms.length === 0 ? (
              <p>No properties found.</p>
            ) : (
              <div className="rooms-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Host ID</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <RoomRow key={room.id} room={room} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
