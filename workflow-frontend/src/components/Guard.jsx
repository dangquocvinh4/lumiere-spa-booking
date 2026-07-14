import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.roles?.some(role => 
    role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER' || role === 'ROLE_RECEPTIONIST'
  );

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export const StaffRoute = () => {
    const { isAuthenticated, user } = useAuthStore();
    const isStaff = user?.roles?.some(role => 
      role === 'ROLE_STAFF' || role === 'ROLE_THERAPIST' || role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER'
    );
  
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return isStaff ? <Outlet /> : <Navigate to="/" replace />;
};
