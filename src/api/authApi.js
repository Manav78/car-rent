import axiosClient, { IS_STANDALONE_MODE, executeRefreshToken } from './axiosClient';
import { getRefreshToken } from '../utils/authStorage';

export const DEFAULT_ACCOUNTS = {
  'customer@carrental.com': { name: 'John Doe', roles: ['ROLE_CUSTOMER'], password: 'Password@123' },
  'owner@carrental.com': { name: 'Robert Brown', roles: ['ROLE_OWNER'], password: 'Password@123' },
  'driver@carrental.com': { name: 'Michael Knight', roles: ['ROLE_DRIVER'], password: 'Password@123' },
  'admin@carrental.com': { name: 'System Super Admin', roles: ['ROLE_ADMIN'], password: 'Admin@123' },
  'customer@demo.com': { name: 'Demo Customer', roles: ['ROLE_CUSTOMER'], password: 'Password@123' },
  'owner@demo.com': { name: 'Vehicle Owner', roles: ['ROLE_OWNER'], password: 'Password@123' },
  'driver@demo.com': { name: 'Verified Driver', roles: ['ROLE_DRIVER'], password: 'Password@123' },
  'admin@demo.com': { name: 'Super Admin', roles: ['ROLE_ADMIN'], password: 'Admin@123' },
  'multirole@demo.com': { name: 'Multi-Role User', roles: ['ROLE_OWNER', 'ROLE_DRIVER'], password: 'Password@123' },
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
    let norm = rList.map(normalizeRole);
    if (norm.length === 0) norm = ['ROLE_CUSTOMER'];
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

      let response;
      try {
        response = await axiosClient.post(endpoint, {
          email: credentials.email,
          password: credentials.password,
        });
      } catch (adminErr) {
        if (isRoleAdmin && (adminErr?.response?.status === 404 || adminErr?.status === 404)) {
          response = await axiosClient.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });
        } else {
          throw adminErr;
        }
      }

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
      console.warn('[Backend Offline] Using default account fallback:', err.message);
    }

    // Fallback logic for offline / standalone mode
    const email = (credentials?.email || 'customer@carrental.com').toLowerCase().trim();
    let account = DEFAULT_ACCOUNTS[email];
    
    if (!account) {
      if (email.includes('owner')) account = DEFAULT_ACCOUNTS['owner@carrental.com'];
      else if (email.includes('driver')) account = DEFAULT_ACCOUNTS['driver@carrental.com'];
      else if (email.includes('admin')) account = DEFAULT_ACCOUNTS['admin@carrental.com'];
      else if (email.includes('multi')) account = DEFAULT_ACCOUNTS['multirole@demo.com'];
      else account = { name: email.split('@')[0] || 'Demo Customer', roles: ['ROLE_CUSTOMER'] };
    }

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
            email: userData.email,
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
            email: userData.email,
            password,
            confirmPassword,
            phoneNumber: phone,
          };

      const response = await axiosClient.post(endpoint, payload);
      const resData = response?.data || response;
      const dataPayload = (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;

      if (dataPayload && (dataPayload.accessToken || dataPayload.token)) {
        const accessToken = dataPayload.accessToken || dataPayload.token;
        const refreshToken = dataPayload.refreshToken || null;
        const user = dataPayload.user || { name: `${firstName} ${lastName}`.trim(), email: userData.email };
        const roles = normalizeRoles(dataPayload.roles || user);
        return {
          accessToken,
          refreshToken,
          user,
          roles,
          success: true,
        };
      }
      return {
        success: true,
        message: resData?.message || 'Signup successful. Please enter OTP to verify.',
        data: dataPayload,
      };
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      console.warn('[Backend Offline] Using standalone register fallback:', err.message);
    }

    const email = (userData?.email || 'customer@carrental.com').toLowerCase().trim();
    let roles = normalizeRoles(userData);
    const name = `${firstName} ${lastName}`.trim() || email.split('@')[0];

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: {
        id: Date.now(),
        name,
        email,
        wantsToDrive: !!userData?.wantsToDrive,
        licenseNumber: userData?.licenseNumber || null,
        licenseExpiry: userData?.licenseExpiry || null,
      },
      roles,
      success: true,
    };
  },

  sendOtp: async ({ email, phone, purpose = 'REGISTRATION' }) => {
    try {
      const response = await axiosClient.post('/auth/resend-verification-otp', { email });
      const resData = response?.data || response;
      return (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        try {
          const res2 = await axiosClient.post('/auth/send-otp', { email, phone, purpose });
          const resData2 = res2?.data || res2;
          return (resData2?.data !== undefined && resData2?.success !== undefined) ? resData2.data : resData2;
        } catch (err2) {
          throw err;
        }
      }
      console.warn('[Backend Offline] Using sendOtp fallback:', err.message);
    }

    const mockCode = '123456';
    return {
      success: true,
      message: `OTP sent successfully to ${email}${phone ? ` and +91 ${phone}` : ''}`,
      otp: mockCode,
      expiresInSeconds: 300,
    };
  },

  verifyOtp: async ({ email, otp, password, registrationData }) => {
    const formattedEmail = (email || registrationData?.email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();
    const userPassword = password || registrationData?.password;

    try {
      const verifyPayload = {
        email: formattedEmail,
        otp: cleanOtp,
        token: cleanOtp,
        verificationCode: cleanOtp,
        code: cleanOtp,
      };

      let response;
      try {
        response = await axiosClient.post('/auth/verify-email', verifyPayload);
      } catch (err1) {
        // If /auth/verify-email returned 404, fallback to /auth/verify-otp or /auth/verify
        if (err1?.response?.status === 404 || err1?.status === 404) {
          try {
            response = await axiosClient.post('/auth/verify-otp', verifyPayload);
          } catch (err2) {
            if (err2?.response?.status === 404 || err2?.status === 404) {
              response = await axiosClient.post('/auth/verify', verifyPayload);
            } else {
              throw err2;
            }
          }
        } else {
          // If error is 400/401/etc. (e.g. Invalid OTP code, OTP expired), throw directly
          throw err1;
        }
      }

      const resData = response?.data || response;
      const payload = (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;

      // 1. If backend directly provided tokens and user object in verification response
      if (payload && (payload.accessToken || payload.token)) {
        const accessToken = payload.accessToken || payload.token;
        const refreshToken = payload.refreshToken || null;
        const user = payload.user || { name: registrationData?.name || formattedEmail.split('@')[0], email: formattedEmail };
        const roles = payload.roles || user.roles || (user.role ? [user.role] : [registrationData?.role || 'ROLE_CUSTOMER']);
        return {
          accessToken,
          refreshToken,
          user,
          roles,
          success: true,
        };
      }

      // 2. If OTP verification succeeded and we have the password, auto-login to obtain auth session
      if (userPassword) {
        try {
          const loginData = await authApi.login({
            email: formattedEmail,
            password: userPassword,
          });
          if (loginData && (loginData.accessToken || loginData.token)) {
            return loginData;
          }
        } catch (loginErr) {
          console.warn('Auto-login after OTP verification skipped/failed:', loginErr?.message || loginErr);
        }
      }

      // 3. Fallback: Email verified successfully, return confirmation
      return {
        success: true,
        requiresLogin: true,
        message: resData?.message || 'Email verified successfully! Please sign in with your credentials.',
        user: { name: registrationData?.name || formattedEmail.split('@')[0], email: formattedEmail },
        roles: [registrationData?.role || 'ROLE_CUSTOMER'],
      };
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      console.warn('[Backend Offline] Using standalone verifyOtp fallback:', err?.message || err);
    }

    // Standalone / Offline fallback
    const mockUserEmail = formattedEmail || 'customer@demo.com';
    let roles = registrationData?.roles || [registrationData?.role || 'ROLE_CUSTOMER'];
    if (registrationData?.role === 'ROLE_OWNER' && registrationData?.wantsToDrive) {
      roles = ['ROLE_OWNER', 'ROLE_DRIVER'];
    }
    const userName = registrationData?.name || mockUserEmail.split('@')[0] || 'New User';

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: {
        id: Date.now(),
        name: userName,
        email: mockUserEmail,
        wantsToDrive: !!registrationData?.wantsToDrive,
        licenseNumber: registrationData?.licenseNumber || null,
        licenseExpiry: registrationData?.licenseExpiry || null,
      },
      roles,
      success: true,
    };
  },

  forgotPassword: async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const payload = { email: cleanEmail };

    const candidateCalls = [
      () => axiosClient.post('/auth/forgot-password', payload),
      () => axiosClient.post('/auth/forgotPassword', payload),
      () => axiosClient.post('/auth/password/forgot', payload),
      () => axiosClient.post('/auth/request-password-reset', payload),
      () => axiosClient.post('/auth/password-reset/request', payload),
      () => axiosClient.post('/users/forgot-password', payload),
      () => axiosClient.post('/user/forgot-password', payload),
      () => axiosClient.post(`/auth/forgot-password?email=${encodeURIComponent(cleanEmail)}`, payload),
      () => axiosClient.get(`/auth/forgot-password?email=${encodeURIComponent(cleanEmail)}`),
    ];

    let lastError = null;
    let response = null;

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status || err?.statusCode;
        // If 404 (endpoint not found) or 405 (method not allowed), continue to next endpoint
        if (status === 404 || status === 405 || !status) {
          continue;
        }
        // If 400 with specific business error (e.g., user not found), stop and throw
        const msg = (err?.message || err?.error || '').toLowerCase();
        if (status === 400 && (msg.includes('user') || msg.includes('email') || msg.includes('found'))) {
          throw err;
        }
      }
    }

    if (!response) {
      if (!IS_STANDALONE_MODE) {
        throw lastError || new Error('Forgot password endpoint could not be reached.');
      }
      return { 
        success: true, 
        message: 'Password reset code has been sent to your email.', 
        token: '123456', 
        otp: '123456' 
      };
    }

    const resData = response?.data || response;
    const dataPayload = (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;

    // Extract any token or OTP returned by the backend response
    let token = dataPayload?.token || dataPayload?.resetToken || dataPayload?.otp || dataPayload?.code || 
                resData?.token || resData?.resetToken || resData?.otp || resData?.code || 
                (typeof dataPayload === 'string' && dataPayload.length > 3 ? dataPayload : null);

    if (!token && typeof resData?.message === 'string') {
      const match = resData.message.match(/(?:token|otp|code)[\s:=]+([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        token = match[1];
      }
    }

    if (token) {
      console.log('🔑 [Forgot Password] Reset token/OTP received from server:', token);
    }

    return {
      success: true,
      message: resData?.message || dataPayload?.message || 'Password reset code/token sent successfully.',
      token,
      resetToken: token,
      otp: token,
      data: dataPayload,
    };
  },

  resetPassword: async ({ email, otp, token, newPassword, confirmPassword }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanToken = String(token || otp || '').trim();
    const cleanPassword = newPassword || confirmPassword;
    const finalConfirm = confirmPassword || cleanPassword;

    // Standard DTO formats for various Spring Boot / Express / Django backends
    const payloadStandard = {
      email: cleanEmail,
      token: cleanToken,
      newPassword: cleanPassword,
    };

    const payloadTokenOnly = {
      token: cleanToken,
      newPassword: cleanPassword,
    };

    const payloadWithConfirm = {
      email: cleanEmail,
      token: cleanToken,
      newPassword: cleanPassword,
      confirmPassword: finalConfirm,
    };

    const payloadPasswordAliases = {
      email: cleanEmail,
      token: cleanToken,
      otp: cleanToken,
      resetToken: cleanToken,
      code: cleanToken,
      verificationCode: cleanToken,
      password: cleanPassword,
      newPassword: cleanPassword,
      confirmPassword: finalConfirm,
    };

    const candidateCalls = [
      // 1. Primary: Standard POST /auth/reset-password with standard DTO
      () => axiosClient.post('/auth/reset-password', payloadStandard),
      // 2. Token-only DTO (common in token-verified resets)
      () => axiosClient.post('/auth/reset-password', payloadTokenOnly),
      // 3. With confirmPassword
      () => axiosClient.post('/auth/reset-password', payloadWithConfirm),
      // 4. Query param token with body
      () => axiosClient.post(`/auth/reset-password?token=${encodeURIComponent(cleanToken)}&email=${encodeURIComponent(cleanEmail)}`, {
        newPassword: cleanPassword,
        confirmPassword: finalConfirm,
        password: cleanPassword,
      }),
      () => axiosClient.post(`/auth/reset-password?token=${encodeURIComponent(cleanToken)}`, {
        newPassword: cleanPassword,
        confirmPassword: finalConfirm,
        password: cleanPassword,
      }),
      // 5. Alternate camelCase / REST endpoints
      () => axiosClient.post('/auth/resetPassword', payloadStandard),
      () => axiosClient.post('/auth/password/reset', payloadStandard),
      () => axiosClient.post('/auth/change-password', payloadPasswordAliases),
      () => axiosClient.post('/auth/set-password', payloadPasswordAliases),
      () => axiosClient.post('/users/reset-password', payloadStandard),
      () => axiosClient.post('/user/reset-password', payloadStandard),
      // 6. PUT method variants
      () => axiosClient.put('/auth/reset-password', payloadStandard),
      () => axiosClient.put('/auth/resetPassword', payloadStandard),
      () => axiosClient.put('/auth/password/reset', payloadStandard),
      () => axiosClient.put(`/auth/reset-password?token=${encodeURIComponent(cleanToken)}&email=${encodeURIComponent(cleanEmail)}`, {
        newPassword: cleanPassword,
      }),
      // 7. Rich payload fallback with all aliases
      () => axiosClient.post('/auth/reset-password', payloadPasswordAliases),
    ];

    let lastError = null;
    let response = null;

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status || err?.statusCode;
        // If 404 (endpoint not found), 405 (method not allowed), or 400 (unrecognized property or bad payload format), try next candidate
        if (status === 404 || status === 405 || status === 400 || !status) {
          continue;
        }
        // If explicit token validation error (e.g. Invalid token, Expired token), stop and throw immediately
        const msg = (err?.message || err?.error || '').toLowerCase();
        if (msg.includes('token') || msg.includes('expired') || msg.includes('invalid') || msg.includes('match')) {
          throw err;
        }
      }
    }

    if (!response) {
      if (!IS_STANDALONE_MODE) {
        throw lastError || new Error('Failed to reset password. Please check your token and try again.');
      }
      return { success: true, message: 'Password reset successfully!' };
    }

    const resData = response?.data || response;
    return (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      const resData = response?.data || response;
      return (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;
    } catch (err) {
      return null;
    }
  },

  refreshToken: async (providedToken) => {
    try {
      const tokenToUse = providedToken || getRefreshToken();
      if (!tokenToUse) {
        throw new Error('No refresh token available');
      }
      return await executeRefreshToken(tokenToUse);
    } catch (err) {
      if (!IS_STANDALONE_MODE) {
        throw err;
      }
      return {
        accessToken: `mock_jwt_token_refreshed_${Date.now()}`,
        refreshToken: `mock_refresh_token_refreshed_${Date.now()}`,
        token: `mock_jwt_token_refreshed_${Date.now()}`,
      };
    }
  },

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout notification error:', err.message);
    }
  }
};
