import axios from 'axios';
import { getAccessToken, getRefreshToken, updateTokens, clearAuth } from '../utils/authStorage';
import { handleMockRequest } from './mockAdapter';
import apiCache from '../utils/apiCache';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// Set VITE_USE_MOCK=false in your .env file to route all API calls to your live backend server
export const IS_STANDALONE_MODE = import.meta.env.VITE_USE_MOCK === 'false' ? false : true;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Execute silent refresh against backend using plain axios instance to avoid interceptor recursion
 */
export const executeRefreshToken = async (rawRefreshToken) => {
  const currentRefreshToken = rawRefreshToken || getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }

  const payload = {
    refreshToken: currentRefreshToken,
  };

  const candidateEndpoints = [
    '/auth/refresh-token',
    '/auth/refresh',
    '/auth/token/refresh',
    '/auth/refreshtoken',
  ];

  let lastError = null;

  for (const endpoint of candidateEndpoints) {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const resData = response?.data || response;
      const dataPayload = (resData?.data !== undefined && resData?.success !== undefined) ? resData.data : resData;

      const newAccessToken = dataPayload?.accessToken || dataPayload?.token || dataPayload?.jwt || dataPayload?.access_token ||
                             resData?.accessToken || resData?.token || resData?.jwt || resData?.access_token;
      
      const newRefreshToken = dataPayload?.refreshToken || dataPayload?.refresh_token ||
                              resData?.refreshToken || resData?.refresh_token || currentRefreshToken;

      if (newAccessToken) {
        updateTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      }
    } catch (err) {
      lastError = err;
      const status = err?.response?.status || err?.status;
      if (status === 404 || status === 405 || !status) {
        continue;
      }
      if (status === 401 || status === 403) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All token refresh endpoints failed');
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: IS_STANDALONE_MODE ? 4000 : 15000,
  // When in standalone mode, serve responses instantly via mock adapter.
  // When connecting to real backend (VITE_USE_MOCK=false), adapter is undefined so axios performs real HTTP calls.
  adapter: IS_STANDALONE_MODE
    ? async (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        const mockResponse = await handleMockRequest(config);
        return {
          data: mockResponse.data,
          status: mockResponse.status || 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }
    : undefined,
});

// Helper to transparently unwrap Spring Boot ApiResponse { success, message, data } & Pageable responses
export const unwrapData = (response) => {
  if (response === undefined || response === null) return response;
  const body = response.data !== undefined ? response.data : response;
  if (body && typeof body === 'object') {
    if (body.success !== undefined && body.data !== undefined) {
      return unwrapData(body.data);
    }
    if (Array.isArray(body.content)) {
      return body.content;
    }
  }
  return body;
};

// Robust helper to guarantee an array from any backend list or pageable response
export const extractList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.content && Array.isArray(data.content)) return data.content;
  if (data.vehicles && Array.isArray(data.vehicles)) return data.vehicles;
  if (data.bookings && Array.isArray(data.bookings)) return data.bookings;
  if (data.drivers && Array.isArray(data.drivers)) return data.drivers;
  if (data.owners && Array.isArray(data.owners)) return data.owners;
  if (data.users && Array.isArray(data.users)) return data.users;
  if (data.trips && Array.isArray(data.trips)) return data.trips;
  if (data.plans && Array.isArray(data.plans)) return data.plans;
  if (data.pendingVehicles && Array.isArray(data.pendingVehicles)) return data.pendingVehicles;
  if (data.pendingDrivers && Array.isArray(data.pendingDrivers)) return data.pendingDrivers;
  if (data.pendingOwners && Array.isArray(data.pendingOwners)) return data.pendingOwners;
  return [];
};

// Request Interceptor: Attach Authorization Bearer Token automatically
axiosClient.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized, Silent JWT Refresh & Automatic Cache Invalidation
axiosClient.interceptors.response.use(
  (response) => {
    const method = (response.config?.method || '').toLowerCase();
    const url = (response.config?.url || '').toLowerCase();

    // Automatically invalidate corresponding frontend caches on mutations
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (url.includes('vehicle')) {
        apiCache.invalidateTags(['vehicles', 'dashboard', 'admin']);
      }
      if (url.includes('booking') || url.includes('trip')) {
        apiCache.invalidateTags(['bookings', 'trips', 'dashboard', 'vehicles']);
      }
      if (url.includes('driver')) {
        apiCache.invalidateTags(['drivers', 'dashboard', 'admin']);
      }
      if (url.includes('owner')) {
        apiCache.invalidateTags(['owners', 'dashboard', 'admin']);
      }
      if (url.includes('approval')) {
        apiCache.invalidateTags(['approvals', 'admin', 'owners', 'drivers', 'vehicles']);
      }
      if (url.includes('plan')) {
        apiCache.invalidateTags(['plans', 'admin']);
      }
      if (url.includes('profile') || url.includes('/me')) {
        apiCache.invalidateTags(['profile', 'auth', 'dashboard']);
      }
      if (url.includes('notification')) {
        apiCache.invalidateTags(['notifications']);
      }
    }

    return response;
  },
  async (error) => {
    if (IS_STANDALONE_MODE) {
      const mockRes = await handleMockRequest(error.config || {});
      return mockRes;
    }

    const originalRequest = error.config;

    // Handle 401 Unauthorized & Token Refresh
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = (originalRequest.url || '').toLowerCase();
      const isAuthUrl = requestUrl.includes('/auth/login') ||
                        requestUrl.includes('/auth/signup') ||
                        requestUrl.includes('/auth/forgot-password') ||
                        requestUrl.includes('/auth/reset-password') ||
                        requestUrl.includes('/auth/refresh');

      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      // Only attempt refresh or handle expiration if the user actually had an active session
      if (!isAuthUrl && (accessToken || refreshToken)) {
        if (refreshToken) {
          if (isRefreshing) {
            // If already refreshing, wait in queue for new access token
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosClient(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshResult = await executeRefreshToken(refreshToken);
            const newAccessToken = refreshResult?.accessToken;

            if (newAccessToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              processQueue(null, newAccessToken);
              isRefreshing = false;

              return axiosClient(originalRequest);
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            isRefreshing = false;

            clearAuth();
            return Promise.reject(refreshErr);
          }
        } else {
          clearAuth();
        }
      }
    }

    if (error.response) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        if (!errorData.status) {
          errorData.status = error.response.status;
        }
        if (!errorData.response) {
          errorData.response = error.response;
        }
        return Promise.reject(errorData);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Universal cached GET helper with request deduplication & SWR
 */
export const cachedGet = async (url, params = {}, options = {}) => {
  const cacheKey = apiCache.generateKey(url, params);
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      const response = await axiosClient.get(url, { params, ...options });
      return unwrapData(response);
    },
    options
  );
};

export default axiosClient;
