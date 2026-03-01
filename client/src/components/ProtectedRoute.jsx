import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require authentication. Redirects to /login if no token.
 * If requireRole="host", redirects to / when the user is not a host.
 */
export function ProtectedRoute({ children, requireRole }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole === 'host' && user?.role !== 'host') {
    return <Navigate to="/" state={{ message: 'Only hosts can manage listings.' }} replace />;
  }

  return children;
}
