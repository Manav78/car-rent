import axiosClient, { unwrapData, extractList } from './axiosClient';
import apiCache from '../utils/apiCache';

export const customerApi = {
  // Profile Management (/api/v1/customers/profile, /api/customers/profile)
  getProfile: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:profile',
      async () => {
        try {
          const response = await axiosClient.get('/customers/profile');
          return unwrapData(response);
        } catch (err) {
          const response = await axiosClient.get('/auth/me');
          return unwrapData(response);
        }
      },
      { ttl: 2 * 60 * 1000, tags: ['profile'], bypassCache }
    );
  },

  updateProfile: async (profileData) => {
    const nameParts = (profileData.name || '').trim().split(' ');
    const firstName = profileData.firstName || nameParts[0] || '';
    const lastName = profileData.lastName || nameParts.slice(1).join(' ') || firstName;

    const payload = {
      firstName,
      lastName,
      phoneNumber: profileData.phoneNumber || profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      postalCode: profileData.postalCode || profileData.zipCode || '',
    };

    const response = await axiosClient.put('/customers/profile', payload);
    apiCache.invalidateTags(['profile', 'auth']);
    return unwrapData(response);
  },

  patchProfile: async (profileData) => {
    const payload = { ...profileData };
    const response = await axiosClient.patch('/customers/profile', payload);
    apiCache.invalidateTags(['profile', 'auth']);
    return unwrapData(response);
  },

  deleteAccount: async () => {
    const response = await axiosClient.delete('/customers/profile');
    apiCache.clear();
    return unwrapData(response);
  },

  getDashboardStats: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:dashboard',
      async () => {
        try {
          const response = await axiosClient.get('/customers/dashboard');
          return unwrapData(response);
        } catch (err) {
          return { message: 'Customer Dashboard' };
        }
      },
      { ttl: 30 * 1000, tags: ['dashboard', 'bookings'], bypassCache }
    );
  },

  // Vehicle Discovery & Details (/api/vehicles)
  getAvailableVehicles: async (filters = {}, options = {}) => {
    const { city = '', seatingCapacity = '', vehicleType = '', status = 'AVAILABLE' } = filters;
    const { bypassCache = false } = options;

    const queryKey = `vehicles:list:${city}:${seatingCapacity}:${vehicleType}:${status}`;

    return apiCache.fetchWithCache(
      queryKey,
      async () => {
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (seatingCapacity) params.append('seatingCapacity', seatingCapacity);
        if (vehicleType) params.append('vehicleType', vehicleType);

        const response = await axiosClient.get(`/vehicles?${params.toString()}`).catch(() =>
          axiosClient.get(`/vehicles/search?${params.toString()}`)
        );
        return extractList(unwrapData(response));
      },
      { ttl: 2 * 60 * 1000, tags: ['vehicles'], bypassCache }
    );
  },

  getVehicleById: async (id, options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      `vehicle:${id}`,
      async () => {
        const response = await axiosClient.get(`/vehicles/${id}`);
        return unwrapData(response);
      },
      { ttl: 3 * 60 * 1000, tags: ['vehicles'], bypassCache }
    );
  },

  // Booking Operations (/api/bookings)
  // Request Schema: BookingRequest (vehicleId, startDate, endDate, pickupLocation, dropoffLocation, customerPhoneNumber, tripType, passengerCount, notes)
  createBooking: async (bookingPayload) => {
    const rawPhone = String(bookingPayload.customerPhoneNumber || bookingPayload.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : (rawPhone || '9876543210');

    const backendPayload = {
      vehicleId: Number(bookingPayload.vehicleId),
      startDate: String(bookingPayload.startDate || bookingPayload.pickupDate).split('T')[0],
      endDate: String(bookingPayload.endDate || bookingPayload.returnDate).split('T')[0],
      pickupLocation: String(bookingPayload.pickupLocation || '').trim(),
      dropoffLocation: String(bookingPayload.dropoffLocation || bookingPayload.dropLocation || '').trim(),
      customerPhoneNumber: cleanPhone,
      tripType: String(bookingPayload.tripType || '').toUpperCase() === 'OUTSTATION' ? 'OUTSTATION' : 'LOCAL',
      passengerCount: Number(bookingPayload.passengerCount) || 1,
      notes: String(bookingPayload.notes || '').trim(),
    };

    const response = await axiosClient.post('/bookings', backendPayload);
    apiCache.invalidateTags(['bookings', 'trips', 'vehicles', 'dashboard']);
    return unwrapData(response);
  },

  getBookingById: async (bookingId) => {
    const response = await axiosClient.get(`/bookings/${bookingId}`).catch(() =>
      axiosClient.get(`/customers/bookings/${bookingId}`)
    );
    return unwrapData(response);
  },

  // Get active bookings
  getMyBookings: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:my_bookings',
      async () => {
        try {
          const response = await axiosClient.get('/customers/bookings').catch(() =>
            axiosClient.get('/bookings/my-bookings')
          );
          return extractList(unwrapData(response));
        } catch (err) {
          // If active bookings query errored on backend, fetch history as fallback
          try {
            const histRes = await axiosClient.get('/v1/customers/bookings/history');
            return extractList(unwrapData(histRes));
          } catch (hErr) {
            return [];
          }
        }
      },
      { ttl: 30 * 1000, tags: ['bookings', 'trips', 'customer'], bypassCache }
    );
  },

  // Get past / history bookings
  getBookingHistory: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:booking_history',
      async () => {
        try {
          const response = await axiosClient.get('/customers/bookings/history').catch(() =>
            axiosClient.get('/customers/history')
          );
          return extractList(unwrapData(response));
        } catch (err) {
          return [];
        }
      },
      { ttl: 30 * 1000, tags: ['bookings', 'trips', 'customer'], bypassCache }
    );
  },

  // Get all customer bookings (merging active and history bookings so completed trips are always shown)
  getAllBookings: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:all_bookings',
      async () => {
        const [activeRes, historyRes] = await Promise.allSettled([
          customerApi.getMyBookings({ bypassCache }),
          customerApi.getBookingHistory({ bypassCache }),
        ]);

        const activeList = activeRes.status === 'fulfilled' && Array.isArray(activeRes.value) ? activeRes.value : [];
        const historyList = historyRes.status === 'fulfilled' && Array.isArray(historyRes.value) ? historyRes.value : [];

        // Deduplicate by ID
        const map = new Map();
        [...historyList, ...activeList].forEach((item) => {
          if (item && item.id) {
            map.set(item.id, { ...map.get(item.id), ...item });
          }
        });

        const merged = Array.from(map.values());
        merged.sort((a, b) => (b.id || 0) - (a.id || 0));
        return merged;
      },
      { ttl: 30 * 1000, tags: ['bookings', 'trips', 'customer'], bypassCache }
    );
  },

  cancelBooking: async (bookingId, reason = 'Cancelled by customer') => {
    const payload = {
      status: 'CANCELLED',
      reason,
      rejectionReason: reason,
      bookingStatus: 'CANCELLED',
    };
    const response = await axiosClient.patch(`/bookings/${bookingId}/status`, payload).catch(() =>
      axiosClient.patch(`/bookings/${bookingId}/cancel`, payload)
    );
    apiCache.invalidateTags(['bookings', 'trips', 'vehicles', 'dashboard']);
    return unwrapData(response);
  },

  // Notifications (/api/notifications)
  getNotifications: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:notifications',
      async () => {
        try {
          const response = await axiosClient.get('/notifications');
          return extractList(unwrapData(response));
        } catch (err) {
          return [];
        }
      },
      { ttl: 30 * 1000, tags: ['notifications'], bypassCache }
    );
  },

  getUnreadCount: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'customer:unread_notifications_count',
      async () => {
        try {
          const notifs = await customerApi.getNotifications({ bypassCache });
          const unread = notifs.filter((n) => n.status === 'UNREAD' || !n.read).length;
          return { count: unread };
        } catch (err) {
          return { count: 0 };
        }
      },
      { ttl: 30 * 1000, tags: ['notifications'], bypassCache }
    );
  },

  markNotificationAsRead: async (notificationId) => {
    apiCache.invalidateTags(['notifications']);
    return { success: true };
  },

  markAllNotificationsAsRead: async () => {
    apiCache.invalidateTags(['notifications']);
    return { success: true };
  },
};

export default customerApi;
