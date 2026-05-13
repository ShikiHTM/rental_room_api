import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
