import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Loader2, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { isLoading, isAuthenticated, isAdmin, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={28} color="var(--primary)" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="forbidden-screen">
        <div className="forbidden-card fade-in">
          <ShieldOff size={36} color="var(--danger)" />
          <h1>Access denied</h1>
          <p>This account does not have administrator privileges.</p>
          <button className="btn-primary" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
