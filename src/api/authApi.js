import axiosClient, { IS_STANDALONE_MODE, executeRefreshToken } from './axiosClient';
import { getRefreshToken } from '../utils/authStorage';

export const DEFAULT_ACCOUNTS = {
  'customer@carrental.com': { name: 'John Doe', roles: ['ROLE_CUSTOMER'], password: 'Password@123' },
  'owner@carrental.com': { name: 'Robert Brown', roles: ['ROLE_OWNER'], password: 'Password@123' },
  'driver@carrental.com': { name: 'Michael Knight', roles: ['ROLE_DRIVER'], password: 'Password@123' },
  'admin@carrental.com': { name: 'System Super Admin', roles: ['ROLE_ADMIN'], password: 'Admin@123' },
};

export const normalizeRole = (roleStr) => {
  if (!roleStr) return 'ROLE_CUSTOMER';
  const r = String(roleStr).toUpperCase().trim();
  if (r.startsWith('ROLE_')) return r;
  return `ROLE_${r}`;
};

export const normalizeRoles = (rolesOrUser) => {
  if (!rolesOrUser) return ['ROLE_CUSTOMER'];
  if (Array.isArray(rolesOrUser)) {
    return rolesOrUser.map(normalizeRole);
  }
  if (typeof rolesOrUser === 'object') {
    const rList = rolesOrUser.roles || (rolesOrUser.role ? [rolesOrUser.role] : []);
    const norm = rList.map(normalizeRole);
    if (norm.length === 0) norm.push('ROLE_CUSTOMER');
    if (rolesOrUser.willingToDrive && norm.includes('ROLE_OWNER') && !norm.includes('ROLE_DRIVER')) {
      norm.push('ROLE_DRIVER');
    }
    return norm;
  }
  return [normalizeRole(rolesOrUser)];
};

export const authApi = {
  login: async (credentials) => {
    try {
      const isRoleAdmin = credentials.role === 'ROLE_ADMIN' || (credentials.email || '').includes('admin');
      const endpoint = isRoleAdmin ? '/auth/admin/login' : '/auth/login';

      const response = await axiosClient.post(endpoint, {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      const resData = response?.data || response;
      const payload = (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;

      if (payload && (payload.accessToken || payload.token)) {
        const accessToken = payload.accessToken || payload.token;
        const refreshToken = payload.refreshToken || null;
        const rawUser = payload.user || { name: credentials.email.split('@')[0], email: credentials.email };
        const fullName = rawUser.fullName || (rawUser.firstName ? `${rawUser.firstName} ${rawUser.lastName || ''}`.trim() : rawUser.name) || credentials.email.split('@')[0];
        const user = { ...rawUser, name: fullName };
        const roles = normalizeRoles(payload.roles || rawUser);

        return {
          accessToken,
          refreshToken,
          user,
          roles,
        };
      }
      return payload;
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      console.warn('[Offline Mode] Using default account fallback:', err.message);
    }

    // Standalone fallback
    const email = (credentials?.email || 'customer@carrental.com').toLowerCase().trim();
    const account = DEFAULT_ACCOUNTS[email] || { name: email.split('@')[0] || 'Customer', roles: ['ROLE_CUSTOMER'] };

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: { id: Date.now(), name: account.name, email },
      roles: account.roles,
    };
  },

  register: async (userData) => {
    const nameParts = (userData?.name || '').trim().split(' ');
    const firstName = userData?.firstName || nameParts[0] || 'User';
    const lastName = userData?.lastName || nameParts.slice(1).join(' ') || firstName;
    const phone = userData?.phone || userData?.phoneNumber || '9876543210';
    const password = userData?.password || 'Password@123';
    const confirmPassword = userData?.confirmPassword || password;
    const isOwner = userData?.role === 'ROLE_OWNER';

    try {
      const endpoint = isOwner ? '/auth/owner/signup' : '/auth/customer/signup';
      const payload = isOwner
        ? {
            firstName,
            lastName,
            email: userData.email.trim(),
            password,
            confirmPassword,
            phoneNumber: phone,
            willingToDrive: !!userData.wantsToDrive,
            drivingLicenseNumber: userData.licenseNumber || null,
            licenseExpiryDate: userData.licenseExpiry || null,
          }
        : {
            firstName,
            lastName,
            email: userData.email.trim(),
            password,
            confirmPassword,
            phoneNumber: phone,
          };

      const response = await axiosClient.post(endpoint, payload);
      const resData = response?.data || response;
      const dataPayload = (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;

      return {
        success: true,
        message: resData?.message || 'Signup successful. Please verify email using the OTP sent.',
        data: dataPayload,
      };
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      console.warn('[Offline Mode] Registering mock user:', err.message);
    }

    const email = (userData?.email || 'customer@carrental.com').toLowerCase().trim();
    const roles = normalizeRoles(userData);

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: {
        id: Date.now(),
        name: `${firstName} ${lastName}`.trim(),
        email,
      },
      roles,
      success: true,
    };
  },

  sendOtp: async ({ email }) => {
    try {
      const response = await axiosClient.post('/auth/resend-verification-otp', { email: email.trim() });
      const resData = response?.data || response;
      return (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      return { success: true, message: `OTP sent to ${email}`, otp: '123456' };
    }
  },

  verifyOtp: async ({ email, otp, password }) => {
    const formattedEmail = (email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    try {
      const response = await axiosClient.post('/auth/verify-email', {
        email: formattedEmail,
        otp: cleanOtp,
      });

      const resData = response?.data || response;

      // If credentials provided, log the user in immediately after OTP verification
      if (password) {
        try {
          return await authApi.login({ email: formattedEmail, password });
        } catch {
          // fall through to verification confirmation
        }
      }

      return {
        success: true,
        requiresLogin: true,
        message: resData?.message || 'Email verified successfully.',
      };
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
    }

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: { id: Date.now(), name: formattedEmail.split('@')[0], email: formattedEmail },
      roles: ['ROLE_CUSTOMER'],
      success: true,
    };
  },

  forgotPassword: async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email: cleanEmail });
      const resData = response?.data || response;
      return {
        success: true,
        message: resData?.message || 'Password reset instructions have been sent.',
      };
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      return { success: true, message: 'Password reset code sent.', token: '123456' };
    }
  },

  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    const cleanToken = String(token || '').trim();
    const cleanPassword = newPassword || confirmPassword;
    const finalConfirm = confirmPassword || cleanPassword;

    try {
      const response = await axiosClient.post('/auth/reset-password', {
        token: cleanToken,
        newPassword: cleanPassword,
        confirmPassword: finalConfirm,
      });
      const resData = response?.data || response;
      return (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      return { success: true, message: 'Password reset successfully!' };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      const resData = response?.data || response;
      return (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;
    } catch {
      return null;
    }
  },

  refreshToken: async (providedToken) => {
    const tokenToUse = providedToken || getRefreshToken();
    if (!tokenToUse) {
      throw new Error('No refresh token available');
    }
    return await executeRefreshToken(tokenToUse);
  },

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout notification error:', err.message);
    }
  },
};

export default authApi;
