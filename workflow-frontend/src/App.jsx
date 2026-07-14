import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminBranchesPage from './pages/AdminBranchesPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminStaffPage from './pages/AdminStaffPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminVouchersPage from './pages/AdminVouchersPage';
import HomePage from './pages/HomePage';
import PaymentResultPage from './pages/PaymentResultPage';
import { PrivateRoute, AdminRoute, StaffRoute } from './components/Guard';
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
        
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          
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
            <Route path="/admin/booking" element={<BookingPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/staff" element={<AdminStaffPage />} />
            <Route path="/admin/branches" element={<AdminBranchesPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
          </Route>
        </Route>

        {/* Staff Routes */}
        <Route element={<StaffRoute />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<StaffDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
