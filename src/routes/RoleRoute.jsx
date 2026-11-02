import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getActiveRole, getRoles, hasRole } from '../utils/authStorage';
import { DEFAULT_ROLE_REDIRECTS } from '../utils/constants';

const RoleRoute = ({ allowedRoles = [] }) => {
  const activeRole = getActiveRole();
  const userRoles = getRoles();

  // Check if active role or any user role satisfies allowedRoles
  const isAuthorized = hasRole(allowedRoles);

  if (!isAuthorized) {
    // Redirect to default page for user's primary/active role
    const fallbackPath = DEFAULT_ROLE_REDIRECTS[activeRole] || DEFAULT_ROLE_REDIRECTS[userRoles[0]] || '/login';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
