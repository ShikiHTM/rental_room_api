import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { type User } from '../services/auth.service';
import { type Room } from '../services/room.service';
import { 
  Users, 
  Home, 
  ShieldCheck, 
  UserX, 
  CheckCircle, 
  XCircle, 
  LayoutDashboard, 
  LogOut, 
  ExternalLink,
  Search,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

const UserRow = ({ user, onAction }: { user: User, onAction: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBan = async () => {
    setIsProcessing(true);
    try {
      await adminService.banUser(user.id);
      toast.success(`User ${user.fullName} has been banned`);
      onAction();
    } catch (error) {
      toast.error('Failed to ban user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnban = async () => {
    setIsProcessing(true);
    try {
      await adminService.unbanUser(user.id);
      toast.success(`User ${user.fullName} has been unbanned`);
      onAction();
    } catch (error) {
      toast.error('Failed to unban user');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="admin-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {user.fullName.charAt(0)}
          </div>
          <span style={{ fontWeight: 500 }}>{user.fullName}</span>
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        <span className={`admin-badge ${user.role === 'ADMIN' ? 'badge-danger' : user.role === 'HOST' ? 'badge-info' : 'badge-success'}`}>
          {user.role || 'USER'}
        </span>
      </td>
      <td>
        {user.bannedAt ? (
          <span className="admin-badge badge-danger">Banned</span>
        ) : (
          <span className="admin-badge badge-success">Active</span>
        )}
      </td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user.bannedAt ? (
            <button className="action-btn" onClick={handleUnban} disabled={isProcessing} title="Unban User">
              <CheckCircle size={16} color="var(--success)" />
            </button>
          ) : (
            <button className="action-btn" onClick={handleBan} disabled={isProcessing || user.role === 'ADMIN'} title="Ban User">
              <UserX size={16} color={user.role === 'ADMIN' ? '#ccc' : 'var(--danger)'} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const RoomRow = ({ room, onAction }: { room: Room, onAction: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateAction = async (action: 'APPROVE' | 'REJECT') => {
    setIsProcessing(true);
    try {
      await adminService.updateRoomStatus(room.id, action);
      toast.success(`Property ${action === 'APPROVE' ? 'approved' : 'rejected'}`);
      onAction();
    } catch (error) {
      toast.error('Failed to update property status');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500 }}>{room.title}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {room.id.substring(0, 8)}...</div>
      </td>
      <td>{room.host?.fullName || 'Unknown Host'}</td>
      <td>{room.city}</td>
      <td>
        <span className={`admin-badge ${
          room.status === 'APPROVED' ? 'badge-success' : 
          room.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
        }`}>
          {room.status}
        </span>
      </td>
      <td>
        {room.status === 'PENDING' ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="action-btn" onClick={() => handleUpdateAction('APPROVE')} disabled={isProcessing} title="Approve">
              <CheckCircle size={16} color="var(--success)" />
            </button>
            <button className="action-btn" onClick={() => handleUpdateAction('REJECT')} disabled={isProcessing} title="Reject">
              <XCircle size={16} color="var(--danger)" />
            </button>
          </div>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Completed</span>
        )}
      </td>
    </tr>
  );
};

const Admin = () => {
  const { user, isAuthenticated, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const pendingApprovals = rooms.filter(r => r.status === 'PENDING').length;
  const totalHosts = users.filter(u => u.role === 'HOST').length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <ShieldCheck size={28} color="var(--primary)" />
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>Users Management</span>
          </button>
          
          <button 
            className={`admin-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <Home size={20} />
            <span>Property Approvals</span>
          </button>

          <div style={{ marginTop: '2rem', padding: '0 1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System
          </div>
          
          <Link to="/" className="admin-nav-item">
            <ExternalLink size={20} />
            <span>Go to Website</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {activeTab === 'users' ? 'User Management' : 'Property Approvals'}
            </h1>
          </div>
          
          <div className="admin-topbar-user">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>System Administrator</div>
            </div>
            <div className="admin-user-avatar">
              {user.fullName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <div className="stat-value">{users.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Hosts</h3>
              <div className="stat-value">{totalHosts}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
              <Home size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Properties</h3>
              <div className="stat-value">{rooms.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <Bell size={24} />
            </div>
            <div className="stat-info">
              <h3>Pending Approvals</h3>
              <div className="stat-value">{pendingApprovals}</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content-card">
          <div className="admin-table-header">
            <h2>{activeTab === 'users' ? 'System Users' : 'Properties Queue'}</h2>
            <button className="action-btn" onClick={fetchData} title="Refresh Data">
              Refresh
            </button>
          </div>

          <div className="admin-table-container">
            {isLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                Loading system data...
              </div>
            ) : activeTab === 'users' ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <UserRow key={u.id} user={u} onAction={fetchData} />
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Host</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <RoomRow key={r.id} room={r} onAction={fetchData} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
