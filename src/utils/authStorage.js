import { STORAGE_KEYS } from './constants';
import apiCache from './apiCache';

/**
 * Saves auth payload into LocalStorage.
 * Stores ONLY accessToken, user details, and roles (NO PASSWORDS).
 */
export const saveAuth = (authData = {}) => {
  apiCache.clear();
  const accessToken = authData.accessToken || authData.token || authData.jwt || authData.access_token;
  const refreshToken = authData.refreshToken || authData.refresh_token;
  const user = authData.user;
  const roles = authData.roles || (user?.roles) || (user?.role ? [user.role] : null);

  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  if (user) {
    // Sanitize user object just in case password exists
    const sanitizedUser = { ...user };
    delete sanitizedUser.password;
    delete sanitizedUser.confirmPassword;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sanitizedUser));
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
  }
  if (roles && Array.isArray(roles) && roles.length > 0) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    // Set default active role if not already set or invalid
    const currentActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    if (!currentActive || !roles.includes(currentActive)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roles[0] || 'ROLE_CUSTOMER');
    }
  }
  window.dispatchEvent(new Event('authChange'));
};

export const getAccessToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('accessToken') || null;
};

export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || localStorage.getItem('refreshToken') || null;
};

export const updateTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  window.dispatchEvent(new Event('authChange'));
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    return null;
  }
};

export const getRoles = () => {
  try {
    const rolesStr = localStorage.getItem(STORAGE_KEYS.ROLES);
    return rolesStr ? JSON.parse(rolesStr) : [];
  } catch (err) {
    console.error('Failed to parse roles from localStorage:', err);
    return [];
  }
};

export const getActiveRole = () => {
  const activeRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
  const roles = getRoles();
  if (activeRole && roles.includes(activeRole)) {
    return activeRole;
  }
  return roles[0] || null;
};

export const setActiveRole = (role) => {
  const roles = getRoles();
  if (roles.includes(role)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    apiCache.clear();
    window.dispatchEvent(new Event('roleChange'));
    return true;
  }
  return false;
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

export const hasRole = (requiredRoles = []) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const userRoles = getRoles();
  const activeRole = getActiveRole();

  // Allow match if activeRole is included OR if any userRole is included
  if (activeRole && requiredRoles.includes(activeRole)) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
};

export const updateUserAndRoles = ({ user, roles }) => {
  const currentUser = getUser() || {};
  const updatedUser = { ...currentUser, ...user };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

  if (roles && Array.isArray(roles)) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }

  apiCache.invalidateTags(['profile', 'auth', 'dashboard']);
  window.dispatchEvent(new Event('authChange'));
  window.dispatchEvent(new Event('roleChange'));
  return updatedUser;
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem('user');
  localStorage.removeItem(STORAGE_KEYS.ROLES);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
  apiCache.clear();
  window.dispatchEvent(new Event('authChange'));
};

