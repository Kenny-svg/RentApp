import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-app py-12 text-sm text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    const homePath = user.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant';
    return <Navigate to={homePath} replace />;
  }

  return children;
}

export default ProtectedRoute;
