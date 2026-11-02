import axiosClient, { unwrapData, extractList } from './axiosClient';
import apiCache from '../utils/apiCache';

export const driverApi = {
  // Driver Dashboard (/api/drivers/dashboard)
  getDashboard: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:dashboard',
      async () => {
        try {
          const response = await axiosClient.get('/drivers/dashboard');
          return unwrapData(response);
        } catch (err) {
          return { message: 'Driver Dashboard' };
        }
      },
      { ttl: 30 * 1000, tags: ['dashboard', 'drivers', 'trips'], bypassCache }
    );
  },

  // Driver Profile (/api/drivers/profile)
  getProfile: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:profile',
      async () => {
        try {
          const response = await axiosClient.get('/drivers/profile');
          return unwrapData(response);
        } catch (err) {
          const response = await axiosClient.get('/auth/me');
          return unwrapData(response);
        }
      },
      { ttl: 2 * 60 * 1000, tags: ['profile', 'drivers'], bypassCache }
    );
  },

  getApprovalStatus: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:approval_status',
      async () => {
        try {
          const profile = await driverApi.getProfile({ bypassCache });
          return {
            approved: (profile?.status || 'APPROVED') !== 'PENDING' && (profile?.status || 'APPROVED') !== 'REJECTED',
            status: profile?.status || 'APPROVED',
            licenseExpiryDate: profile?.licenseExpiryDate || profile?.licenseExpiry,
          };
        } catch (err) {
          return { approved: true, status: 'APPROVED' };
        }
      },
      { ttl: 60 * 1000, tags: ['drivers', 'approvals'], bypassCache }
    );
  },

  getDriverStatus: async (options = {}) => {
    return driverApi.getApprovalStatus(options);
  },

  getAvailableDrivers: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:available_list',
      async () => {
        try {
          const response = await axiosClient.get('/drivers/available');
          return extractList(unwrapData(response));
        } catch (err) {
          return [];
        }
      },
      { ttl: 60 * 1000, tags: ['drivers'], bypassCache }
    );
  },

  // Driver Update (/api/drivers/profile)
  updateProfile: async (profileData) => {
    let normalizedStatus = undefined;
    if (profileData.status) {
      const s = String(profileData.status).toUpperCase();
      if (s === 'ACTIVE' || s === 'AVAILABLE' || s === 'APPROVED') normalizedStatus = 'ACTIVE';
      else if (s === 'INACTIVE' || s === 'OFFLINE' || s === 'SUSPENDED') normalizedStatus = 'INACTIVE';
      else if (s === 'ON_TRIP') normalizedStatus = 'ON_TRIP';
    }

    const payload = {
      licenseNumber: profileData.licenseNumber || profileData.drivingLicenseNumber || '',
      licenseExpiryDate: profileData.licenseExpiryDate || profileData.licenseExpiry || '',
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(profileData.inactiveReason ? { inactiveReason: profileData.inactiveReason } : {}),
    };
    const response = await axiosClient.put('/drivers/profile', payload);
    apiCache.invalidateTags(['profile', 'drivers', 'dashboard']);
    return unwrapData(response);
  },

  renewLicense: async (renewalData) => {
    return driverApi.updateProfile(renewalData);
  },

  // Driver Status Update (/api/drivers/status)
  getAvailability: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:availability',
      async () => {
        try {
          const profile = await driverApi.getProfile({ bypassCache });
          const rawStatus = (profile?.status || profile?.availabilityStatus || 'ACTIVE').toUpperCase();
          const isInactive = rawStatus === 'INACTIVE' || rawStatus === 'OFFLINE';
          const normalizedStatus = isInactive ? 'INACTIVE' : 'ACTIVE';
          return {
            status: normalizedStatus,
            availabilityStatus: normalizedStatus,
            isAvailable: !isInactive,
            inactivityReason: profile?.inactiveReason || '',
          };
        } catch (err) {
          return { status: 'ACTIVE', availabilityStatus: 'ACTIVE', isAvailable: true, inactivityReason: '' };
        }
      },
      { ttl: 30 * 1000, tags: ['drivers', 'profile'], bypassCache }
    );
  },

  // Updates driver duty status using backend DriverStatusUpdateRequest (status: ACTIVE | INACTIVE, inactiveReason)
  updateStatus: async (status, inactiveReason = '') => {
    const isTargetActive = status === 'ACTIVE' || status === 'AVAILABLE' || status === 'ON_DUTY';
    const backendStatus = isTargetActive ? 'ACTIVE' : 'INACTIVE';
    const payload = {
      status: backendStatus,
      inactiveReason: isTargetActive ? '' : (inactiveReason || 'Off-Duty Rest'),
    };
    const response = await axiosClient.patch('/drivers/status', payload);
    apiCache.invalidateTags(['drivers', 'profile', 'dashboard', 'trips', 'owners']);
    return unwrapData(response);
  },

  updateAvailability: async (status, inactiveReason = '') => {
    return driverApi.updateStatus(status, inactiveReason);
  },

  // Assigned Trips (/api/drivers/trips)
  getAssignedTrips: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:assigned_trips',
      async () => {
        try {
          const response = await axiosClient.get('/drivers/trips');
          return extractList(unwrapData(response));
        } catch (err) {
          console.warn('Driver trips fetch fallback:', err.message);
          return [];
        }
      },
      { ttl: 30 * 1000, tags: ['trips', 'bookings', 'drivers'], bypassCache }
    );
  },

  updateTripStatus: async (tripId, status, reason = '') => {
    const payload = {
      status,
      reason: reason || `Trip status updated to ${status}`,
      rejectionReason: reason,
      bookingStatus: status,
    };
    const response = await axiosClient.patch(`/drivers/trips/${tripId}/status`, payload);
    apiCache.invalidateTags(['trips', 'bookings', 'drivers', 'dashboard', 'vehicles', 'customer', 'owners', 'profile']);
    return unwrapData(response);
  },

  startTrip: async (tripId) => {
    return driverApi.updateTripStatus(tripId, 'IN_PROGRESS', 'Trip started by driver');
  },

  endTrip: async (tripId) => {
    return driverApi.updateTripStatus(tripId, 'COMPLETED', 'Trip completed by driver');
  },

  getTripHistory: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'driver:trip_history',
      async () => {
        try {
          const trips = await driverApi.getAssignedTrips({ bypassCache });
          return trips.filter((t) => t.status === 'COMPLETED' || t.status === 'TRIP_COMPLETED' || t.status === 'CANCELLED' || t.status === 'REJECTED');
        } catch (err) {
          return [];
        }
      },
      { ttl: 30 * 1000, tags: ['trips', 'bookings', 'drivers'], bypassCache }
    );
  },
};

export default driverApi;

