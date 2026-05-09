import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { type User } from '../services/auth.service';
import { type Room } from '../services/room.service';
import toast from 'react-hot-toast';
import './Admin.css';

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

  const handleBanUser = async (userId: string) => {
    try {
      await adminService.banUser(userId);
      toast.success(`User has been banned.`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, bannedAt: new Date().toISOString() } : u));
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await adminService.unbanUser(userId);
      toast.success(`User has been unbanned.`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, bannedAt: null } : u));
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminService.updateRoomStatus(roomId, status);
      toast.success(`Room ${status.toLowerCase()} successfully`);
      // Optimistically update UI
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: status as any } : r));
    } catch (error) {
      toast.error(`Failed to update room status to ${status}`);
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
                      <tr key={u.id}>
                        <td><strong>{u.fullName}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`status-badge status-${u.role?.toLowerCase() || 'user'}`}>
                            {u.role || 'USER'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {u.bannedAt ? (
                              <button className="btn-text" style={{ color: 'var(--success)' }} onClick={() => handleUnbanUser(u.id)}>
                                Unban
                              </button>
                            ) : (
                              <button className="btn-text" style={{ color: 'var(--danger)' }} onClick={() => handleBanUser(u.id)}>
                                Ban User
                              </button>
                            )}
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
                      <tr key={room.id}>
                        <td><strong>{room.title}</strong></td>
                        <td>{room.hostId || (room.host?.email)}</td>
                        <td>{room.address}, {room.city}</td>
                        <td>
                          <span className={`status-badge status-${room.status?.toLowerCase() || 'pending'}`}>
                            {room.status || 'PENDING'}
                          </span>
                        </td>
                        <td>
                          {room.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-text" style={{ color: 'var(--success)' }} onClick={() => handleUpdateRoomStatus(room.id, 'APPROVED')}>
                                Approve
                              </button>
                              <button className="btn-text" style={{ color: 'var(--danger)' }} onClick={() => handleUpdateRoomStatus(room.id, 'REJECTED')}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>No actions needed</span>
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
    </div>
  );
};

export default Admin;
