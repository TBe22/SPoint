import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Staff from './pages/Staff';
import Appointments from './pages/Appointments';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import api from './lib/api';
import { useAuthStore } from './store/useAuthStore';
import Configuration from './pages/admin/Configuration';
import MessageCenter from './pages/admin/MessageCenter';
import Home from './pages/Home';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientInbox from './pages/client/ClientInbox';
import BookingPage from './pages/client/BookingPage';
import Storefront from './pages/client/Storefront';
import OrderHistory from './pages/client/OrderHistory';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists but user is not loaded, we should show a loading state
  // or wait for the user profile to be fetched.
  if (!user && token) {
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirect to their respective dashboard instead of "/"
    const target = user.role === 'CLIENT' ? '/my-dashboard' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user, token, login, logout } = useAuthStore();

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        try {
          const response = await api.get('/auth/profile');
          login(response.data, token); // Update store with user info
        } catch (error) {
          console.error('Failed to fetch profile', error);
          logout(); // Clear invalid token
        }
      }
    };
    fetchProfile();
  }, [token, user, login, logout]);

  return (
    <Router>
      <Routes>
        {/* Public Routes with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={
            token ? (
              user?.role === 'CLIENT'
                ? <Navigate to="/my-dashboard" replace />
                : <Navigate to="/dashboard" replace />
            ) : (
              <Home />
            )
          } />
          <Route path="/book-online" element={<BookingPage />} />
          <Route path="/shop" element={<Storefront />} />
          <Route path="/storefront" element={<Storefront />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App Routes */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Admin & Staff Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute roles={['ADMIN', 'STAFF']}><Dashboard /></ProtectedRoute>
          } />
          <Route path="clients" element={
            <ProtectedRoute roles={['ADMIN']}><Clients /></ProtectedRoute>
          } />
          <Route path="services" element={
            <ProtectedRoute roles={['ADMIN']}><Services /></ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute roles={['ADMIN']}><Staff /></ProtectedRoute>
          } />
          <Route path="appointments" element={
            <ProtectedRoute roles={['ADMIN', 'STAFF']}><Appointments /></ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute roles={['ADMIN']}><Products /></ProtectedRoute>
          } />
          <Route path="sales" element={
            <ProtectedRoute roles={['ADMIN', 'STAFF']}><Sales /></ProtectedRoute>
          } />
          <Route path="configuration" element={
            <ProtectedRoute roles={['ADMIN']}><Configuration /></ProtectedRoute>
          } />
          <Route path="/message-center" element={
            <ProtectedRoute roles={['ADMIN', 'STAFF']}><MessageCenter /></ProtectedRoute>
          } />

          {/* Client Authenticated Routes */}
          <Route path="my-dashboard" element={<ProtectedRoute roles={['CLIENT']}><ClientDashboard /></ProtectedRoute>} />
          <Route path="my-orders" element={<ProtectedRoute roles={['CLIENT']}><OrderHistory /></ProtectedRoute>} />
          <Route path="my-inbox" element={<ProtectedRoute roles={['CLIENT']}><ClientInbox /></ProtectedRoute>} />
          <Route path="my-booking" element={<ProtectedRoute roles={['CLIENT']}><BookingPage /></ProtectedRoute>} />
          <Route path="online-store" element={<ProtectedRoute roles={['CLIENT']}><Storefront /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
