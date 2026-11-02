import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES, DEFAULT_ROLE_REDIRECTS } from '../utils/constants';
import { getActiveRole, isAuthenticated } from '../utils/authStorage';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import VehicleDiscovery from '../pages/customer/VehicleDiscovery';
import CreateBooking from '../pages/customer/CreateBooking';
import MyBookings from '../pages/customer/MyBookings';
import CustomerProfile from '../pages/customer/CustomerProfile';

// Owner Pages
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import OwnerVehicles from '../pages/owner/OwnerVehicles';
import OwnerDrivers from '../pages/owner/OwnerDrivers';
import OwnerBookings from '../pages/owner/OwnerBookings';
import OwnerProfile from '../pages/owner/OwnerProfile';
import OwnerSubscription from '../pages/owner/OwnerSubscription';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverTrips from '../pages/driver/DriverTrips';
import DriverProfile from '../pages/driver/DriverProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminApprovals from '../pages/admin/AdminApprovals';
import AdminPlans from '../pages/admin/AdminPlans';
import AdminOwners from '../pages/admin/AdminOwners';
import AdminDrivers from '../pages/admin/AdminDrivers';
import AdminVehicles from '../pages/admin/AdminVehicles';
import AdminAccounts from '../pages/admin/AdminAccounts';

// Dynamic root redirect based on user role (Only for non-customer specialized roles)
const DynamicStorefrontOrRedirect = () => {
  if (!isAuthenticated()) {
    return <VehicleDiscovery />;
  }
  const activeRole = getActiveRole();
  if (activeRole === ROLES.CUSTOMER) {
    return <VehicleDiscovery />;
  }
  // For specialized back-office roles, redirect to their operations dashboard
  const targetPath = DEFAULT_ROLE_REDIRECTS[activeRole] || '/customer';
  return <Navigate to={targetPath} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<LoginPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />
      <Route path="/auth/reset-password" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<LoginPage />} />

      {/* Public Storefront & Browsing (Inside AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DynamicStorefrontOrRedirect />} />
        <Route path="/vehicles" element={<VehicleDiscovery />} />
        <Route path="/customer/vehicles" element={<VehicleDiscovery />} />
      </Route>

      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          
          {/* Customer Protected Routes */}
          <Route element={<RoleRoute allowedRoles={[ROLES.CUSTOMER]} />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/bookings/create" element={<CreateBooking />} />
            <Route path="/customer/bookings" element={<MyBookings />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
          </Route>

          {/* Owner Protected Routes */}
          <Route element={<RoleRoute allowedRoles={[ROLES.OWNER]} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/vehicles" element={<OwnerVehicles />} />
            <Route path="/owner/drivers" element={<OwnerDrivers />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
            <Route path="/owner/subscription" element={<OwnerSubscription />} />
          </Route>

          {/* Driver Protected Routes */}
          <Route element={<RoleRoute allowedRoles={[ROLES.DRIVER]} />}>
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/driver/trips" element={<DriverTrips />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/owners" element={<AdminOwners />} />
            <Route path="/admin/drivers" element={<AdminDrivers />} />
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/accounts" element={<AdminAccounts />} />
            <Route path="/admin/users" element={<AdminAccounts />} />
          </Route>

        </Route>
      </Route>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

