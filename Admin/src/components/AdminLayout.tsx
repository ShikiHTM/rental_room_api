import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users as UsersIcon, Home, CalendarCheck, Receipt, LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'User Management', icon: UsersIcon },
  { to: '/rooms', label: 'Room Management', icon: Home },
  { to: '/bookings', label: 'Booking Management', icon: CalendarCheck },
  { to: '/payments', label: 'Payment History', icon: Receipt },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <ShieldCheck size={26} />
          <div>
            <div className="admin-brand-title">Quolifa</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item danger" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div />
          <div className="admin-topbar-user">
            <div className="admin-topbar-info">
              <div className="admin-topbar-name">{user?.fullName}</div>
              <div className="admin-topbar-role">System Administrator</div>
            </div>
            <div className="admin-avatar">{user?.fullName?.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="admin-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
