import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Layout.css';

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <div className="layout">

      {showLogoutConfirm && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="modal-actions">
              <button className="btn-text" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn-primary" style={{backgroundColor: 'var(--danger)'}} onClick={confirmLogout}>Log out</button>
            </div>
          </div>
        </div>
      )}

      <header className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="brand">
            <HomeIcon className="brand-icon" />
            <span>Quolifa</span>
          </Link>
          
          <nav className="nav-links">
            <Link to="/" className="nav-link">Rooms</Link>
            
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="btn-dropdown user-greeting" onClick={() => setShowDropdown(!showDropdown)}>
                  Hi, {user?.fullName} <ChevronDown size={16} />
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu animate-fade-in">
                    <div className="dropdown-section-title">My Account</div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>Profile</Link>
                    <Link to="/my-bookings" className="dropdown-item" onClick={() => setShowDropdown(false)}>My Bookings</Link>
                    
                    {user?.role !== 'ADMIN' && (
                      <>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-section-title">Hosting</div>
                        <Link to="/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          {user?.role === 'USER' ? 'Become a Host' : 'Host Dashboard'}
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>
                    <button onClick={() => { setShowDropdown(false); setShowLogoutConfirm(true); }} className="dropdown-item text-danger">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-login">
                  <LogIn size={18} />
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p>&copy; {new Date().getFullYear()} Quolifa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
