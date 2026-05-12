import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import { useAuthStore } from './store/authStore';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminBranchesPage from './pages/AdminBranchesPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminStaffPage from './pages/AdminStaffPage';
import { PrivateRoute, AdminRoute } from './components/Guard';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<ServicesPage />} />
          
          {/* Protected Customer Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/my-appointments" element={<MyAppointmentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/staff" element={<AdminStaffPage />} />
            <Route path="/admin/branches" element={<AdminBranchesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
