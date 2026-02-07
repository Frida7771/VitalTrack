import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import FullScreenLoader from './FullScreenLoader.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader tip="Checking session" />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.number),
};

export default ProtectedRoute;
