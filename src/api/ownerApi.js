import axiosClient, { unwrapData, extractList, IS_STANDALONE_MODE } from './axiosClient';
import apiCache from '../utils/apiCache';

const normalizeVehicleType = (type) => {
  const t = (type || 'SUV').toUpperCase().trim();
  if (t === 'CONVERTIBLE') return 'COUPE';
  if (t === 'CAR') return 'SEDAN';
  return t;
};

const normalizeVehicleStatus = (status) => {
  const s = (status || 'AVAILABLE').toUpperCase().trim();
  if (s === 'ACTIVE' || s === 'APPROVED') return 'AVAILABLE';
  if (s === 'SUSPENDED') return 'INACTIVE';
  return s;
};

export const ownerApi = {
  // Owner Dashboard
  getDashboardStats: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:dashboard',
      async () => {
        try {
          const response = await axiosClient.get('/owners/dashboard');
          return unwrapData(response);
        } catch {
          return { message: 'Owner Dashboard' };
        }
      },
      { ttl: 30 * 1000, tags: ['dashboard', 'owners', 'vehicles', 'drivers', 'bookings'], bypassCache }
    );
  },

  // Owner Profile
  getProfile: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:profile',
      async () => {
        try {
          const response = await axiosClient.get('/owners/profile');
          return unwrapData(response);
        } catch {
          const response = await axiosClient.get('/auth/me');
          return unwrapData(response);
        }
      },
      { ttl: 2 * 60 * 1000, tags: ['profile', 'owners'], bypassCache }
    );
  },

  updateProfile: async (profileData) => {
    const nameParts = (profileData.name || '').trim().split(' ');
    const firstName = profileData.firstName || nameParts[0] || '';
    const lastName = profileData.lastName || nameParts.slice(1).join(' ') || firstName;
    const phoneNumber = profileData.phoneNumber || profileData.phone || '';

    const payload = {
      firstName,
      lastName,
      phoneNumber,
      willingToDrive: profileData.willingToDrive ?? profileData.wantsToDrive ?? false,
      drivingLicenseNumber: profileData.drivingLicenseNumber || profileData.licenseNumber || null,
      licenseExpiryDate: profileData.licenseExpiryDate || profileData.licenseExpiry || null,
    };

    if (profileData.reApply !== undefined) {
      payload.reApply = profileData.reApply;
    }
    if (profileData.approvalStatus !== undefined) {
      payload.approvalStatus = profileData.approvalStatus;
    }

    const response = await axiosClient.put('/owners/profile', payload);
    apiCache.invalidateTags(['profile', 'owners', 'dashboard', 'admin', 'approvals']);
    return unwrapData(response);
  },

  resubmitProfile: async (profileData) => {
    return ownerApi.updateProfile({ ...profileData, approvalStatus: 'PENDING', reApply: true });
  },

  getApprovalStatus: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:approval_status',
      async () => {
        try {
          const response = await axiosClient.get('/owners/profile');
          const data = unwrapData(response);
          const isApproved = (data?.status || 'APPROVED') === 'APPROVED' && (data?.approvalStatus || 'APPROVED') === 'APPROVED';
          return {
            approved: isApproved,
            status: data?.status || 'APPROVED',
            approvalStatus: data?.approvalStatus || data?.status || 'APPROVED',
            rejectionReason: data?.rejectionReason || null,
            willingToDrive: !!data?.willingToDrive,
          };
        } catch {
          return { approved: true, status: 'APPROVED', approvalStatus: 'APPROVED' };
        }
      },
      { ttl: 60 * 1000, tags: ['owners', 'approvals'], bypassCache }
    );
  },

  getOwnerStatus: async (options = {}) => {
    return ownerApi.getApprovalStatus(options);
  },

  // Vehicle Management
  getVehicles: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:vehicles',
      async () => {
        try {
          const response = await axiosClient.get('/owners/vehicles');
          return extractList(unwrapData(response));
        } catch {
          const response = await axiosClient.get('/vehicles');
          return extractList(unwrapData(response));
        }
      },
      { ttl: 2 * 60 * 1000, tags: ['vehicles', 'owners'], bypassCache }
    );
  },

  addVehicle: async (vehicleData) => {
    const payload = {
      brand: vehicleData.brand?.trim(),
      model: vehicleData.model?.trim(),
      year: parseInt(vehicleData.year, 10) || new Date().getFullYear(),
      licensePlate: (vehicleData.licensePlate || vehicleData.vehicleNumber)?.trim().toUpperCase(),
      pricePerKm: parseInt(vehicleData.pricePerKm || vehicleData.ratePerKm, 10) || 15,
      seatingCapacity: parseInt(vehicleData.seatingCapacity, 10) || 5,
      vehicleType: normalizeVehicleType(vehicleData.vehicleType),
      fuelType: (vehicleData.fuelType || 'DIESEL').toUpperCase(),
      status: normalizeVehicleStatus(vehicleData.status),
      location: vehicleData.location || vehicleData.city || 'Pune',
      imageUrls: Array.isArray(vehicleData.imageUrls)
        ? vehicleData.imageUrls
        : [
            vehicleData.frontImageUrl || vehicleData.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'
          ].filter(Boolean),
      description: vehicleData.description || `${vehicleData.brand} ${vehicleData.model} (${vehicleData.year || 2024})`,
    };

    const response = await axiosClient.post('/owners/vehicles', payload);
    apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
    return unwrapData(response);
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    const payload = {
      brand: vehicleData.brand?.trim(),
      model: vehicleData.model?.trim(),
      year: parseInt(vehicleData.year, 10) || 2024,
      licensePlate: (vehicleData.licensePlate || vehicleData.vehicleNumber)?.trim().toUpperCase(),
      pricePerKm: parseInt(vehicleData.pricePerKm || vehicleData.ratePerKm, 10) || 15,
      seatingCapacity: parseInt(vehicleData.seatingCapacity, 10) || 5,
      vehicleType: normalizeVehicleType(vehicleData.vehicleType),
      fuelType: (vehicleData.fuelType || 'DIESEL').toUpperCase(),
      status: normalizeVehicleStatus(vehicleData.status),
      location: vehicleData.location || vehicleData.city || 'Pune',
      imageUrls: Array.isArray(vehicleData.imageUrls)
        ? vehicleData.imageUrls
        : (vehicleData.imageUrl ? [vehicleData.imageUrl] : []),
      description: vehicleData.description || '',
    };

    if (vehicleData.approvalStatus !== undefined) payload.approvalStatus = vehicleData.approvalStatus;
    if (vehicleData.reApply !== undefined) payload.reApply = vehicleData.reApply;

    const response = await axiosClient.put(`/owners/vehicles/${vehicleId}`, payload);
    apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
    return unwrapData(response);
  },

  resubmitVehicle: async (vehicleId, vehicleData) => {
    const payload = {
      brand: vehicleData.brand?.trim(),
      model: vehicleData.model?.trim(),
      year: parseInt(vehicleData.year, 10) || 2024,
      licensePlate: (vehicleData.licensePlate || vehicleData.vehicleNumber)?.trim().toUpperCase(),
      pricePerKm: parseInt(vehicleData.pricePerKm || vehicleData.ratePerKm, 10) || 15,
      seatingCapacity: parseInt(vehicleData.seatingCapacity, 10) || 5,
      vehicleType: normalizeVehicleType(vehicleData.vehicleType),
      fuelType: (vehicleData.fuelType || 'DIESEL').toUpperCase(),
      status: 'AVAILABLE',
      location: vehicleData.location || vehicleData.city || 'Pune',
      imageUrls: Array.isArray(vehicleData.imageUrls)
        ? vehicleData.imageUrls
        : (vehicleData.imageUrl ? [vehicleData.imageUrl] : []),
      description: vehicleData.description || `${vehicleData.brand} ${vehicleData.model} (${vehicleData.year || 2024})`,
      approvalStatus: 'PENDING',
      reApply: true,
    };

    if (IS_STANDALONE_MODE) {
      const response = await axiosClient.put(`/owners/vehicles/${vehicleId}`, payload);
      apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
      return unwrapData(response);
    } else {
      const created = await ownerApi.addVehicle(payload);
      if (vehicleId) {
        try {
          await ownerApi.deleteVehicle(vehicleId);
        } catch {
          // ignore
        }
      }
      apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
      return created;
    }
  },

  updateVehicleAvailability: async (vehicleId, status) => {
    return ownerApi.updateVehicle(vehicleId, { status: normalizeVehicleStatus(status) });
  },

  deleteVehicle: async (vehicleId) => {
    const response = await axiosClient.delete(`/owners/vehicles/${vehicleId}`);
    apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
    return unwrapData(response);
  },

  // Driver Management
  getDrivers: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:drivers',
      async () => {
        try {
          const response = await axiosClient.get('/owners/drivers/available');
          return extractList(unwrapData(response));
        } catch {
          return [];
        }
      },
      { ttl: 2 * 60 * 1000, tags: ['drivers', 'owners'], bypassCache }
    );
  },

  getAvailableDrivers: async (options = {}) => {
    return ownerApi.getDrivers(options);
  },

  getAssignableDrivers: async (options = {}) => {
    return ownerApi.getDrivers(options);
  },

  addDriver: async (driverData) => {
    const nameParts = (driverData.name || '').trim().split(' ');
    const firstName = driverData.firstName || nameParts[0] || '';
    const lastName = driverData.lastName || nameParts.slice(1).join(' ') || firstName;
    const resolvedFullName = `${firstName} ${lastName}`.trim() || driverData.name || 'Driver';

    const payload = {
      name: resolvedFullName,
      firstName,
      lastName,
      email: (driverData.email || '').trim().toLowerCase(),
      phoneNumber: driverData.phoneNumber || driverData.phone || '',
      password: driverData.password || 'Password@123',
      licenseNumber: (driverData.licenseNumber || driverData.drivingLicenseNumber || '').trim().toUpperCase(),
      licenseExpiryDate: driverData.licenseExpiryDate || driverData.licenseExpiry || null,
      licenseFrontImage: driverData.licenseFrontImage || null,
      licenseBackImage: driverData.licenseBackImage || null,
      resolvedName: driverData.resolvedName || resolvedFullName,
    };

    const response = await axiosClient.post('/owners/drivers', payload);
    apiCache.invalidateTags(['drivers', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  verifyDriverEmail: async ({ email, otp }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();
    const response = await axiosClient.post('/auth/verify-email', { email: cleanEmail, otp: cleanOtp });
    apiCache.invalidateTags(['drivers', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  resendDriverVerification: async ({ email }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const response = await axiosClient.post('/auth/resend-verification-otp', { email: cleanEmail });
    return unwrapData(response);
  },

  // Booking Operations
  getBookings: async (options = {}) => {
    const { bypassCache = false, status } = options;
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiCache.fetchWithCache(
      `owner:bookings:${status || 'all'}`,
      async () => {
        try {
          const response = await axiosClient.get(`/owners/bookings${query}`);
          return extractList(unwrapData(response));
        } catch (err) {
          console.warn('Owner bookings fetch fallback:', err.message);
          return [];
        }
      },
      { ttl: 30 * 1000, tags: ['bookings', 'trips', 'owners'], bypassCache }
    );
  },

  getBookingById: async (bookingId) => {
    const response = await axiosClient.get(`/owners/bookings/${bookingId}`);
    return unwrapData(response);
  },

  assignDriver: async (bookingId, driverId) => {
    const numDriverId = Number(driverId);
    if (!numDriverId || isNaN(numDriverId)) {
      throw new Error('Invalid Driver ID provided for assignment');
    }
    const response = await axiosClient.post(`/owners/bookings/${bookingId}/assign-driver`, { driverId: numDriverId });
    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'vehicles', 'drivers']);
    return unwrapData(response);
  },

  updateBookingStatus: async (bookingId, status = 'CONFIRMED', reason = '') => {
    const payload = {
      status,
      reason: reason || `Status updated to ${status}`,
      bookingStatus: status,
    };
    const response = await axiosClient.patch(`/owners/bookings/${bookingId}/status`, payload);
    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  acceptBooking: async (bookingId, { driverId = null, useOwnerAsDriver = false, notes = '' } = {}) => {
    const cleanDriverId = Number(driverId);
    if (!useOwnerAsDriver && cleanDriverId && cleanDriverId !== 999 && !isNaN(cleanDriverId)) {
      return ownerApi.assignDriver(bookingId, cleanDriverId);
    }
    return ownerApi.updateBookingStatus(
      bookingId,
      'CONFIRMED',
      notes || 'Confirmed by owner (self-driving)'
    );
  },

  replaceVehicle: async (bookingId, { vehicleId = null, newVehicleId = null, reason = '' } = {}) => {
    const targetVehicleId = Number(newVehicleId || vehicleId);
    if (!targetVehicleId || isNaN(targetVehicleId)) {
      throw new Error('Invalid Vehicle ID for replacement');
    }
    const payload = {
      vehicleId: targetVehicleId,
      newVehicleId: targetVehicleId,
      effectiveVehicleId: targetVehicleId,
      reason: reason || 'Vehicle replaced by fleet owner',
    };
    const response = await axiosClient.post(`/owners/bookings/${bookingId}/replace-vehicle`, payload);
    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'vehicles']);
    return unwrapData(response);
  },

  replaceDriver: async (bookingId, { driverId = null, newDriverId = null, reason = '' } = {}) => {
    const targetDriverId = Number(newDriverId || driverId);
    if (!targetDriverId || isNaN(targetDriverId)) {
      throw new Error('Invalid Driver ID for replacement');
    }
    const payload = {
      driverId: targetDriverId,
      newDriverId: targetDriverId,
      effectiveDriverId: targetDriverId,
      reason: reason || 'Driver replaced by fleet owner',
    };
    const response = await axiosClient.post(`/owners/bookings/${bookingId}/replace-driver`, payload);
    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'drivers']);
    return unwrapData(response);
  },

  reassignBooking: async (bookingId, { vehicleId = null, driverId = null, useOwnerAsDriver = false, reassignmentReason = '' } = {}) => {
    const cleanDriverId = Number(driverId);
    const cleanVehicleId = Number(vehicleId);
    let result = null;

    if (cleanVehicleId && !isNaN(cleanVehicleId)) {
      result = await ownerApi.replaceVehicle(bookingId, {
        newVehicleId: cleanVehicleId,
        reason: reassignmentReason || 'Vehicle reassigned by owner',
      });
    }

    if (!useOwnerAsDriver && cleanDriverId && cleanDriverId !== 999 && !isNaN(cleanDriverId)) {
      try {
        result = await ownerApi.replaceDriver(bookingId, {
          newDriverId: cleanDriverId,
          reason: reassignmentReason || 'Driver reassigned by owner',
        });
      } catch {
        result = await ownerApi.assignDriver(bookingId, cleanDriverId);
      }
    } else if (useOwnerAsDriver) {
      result = await ownerApi.updateBookingStatus(
        bookingId,
        'CONFIRMED',
        reassignmentReason || 'Reassigned to owner (self-driving)'
      );
    }

    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'vehicles', 'drivers']);
    return result || { success: true };
  },

  rejectBooking: async (bookingId, rejectionReason) => {
    const reasonText = rejectionReason || 'Vehicle unavailable for requested dates';
    const payload = {
      status: 'REJECTED',
      reason: reasonText,
      rejectionReason: reasonText,
      bookingStatus: 'REJECTED',
    };
    const response = await axiosClient.patch(`/owners/bookings/${bookingId}/status`, payload);
    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  applyForDriver: async (driverData) => {
    return ownerApi.updateProfile({
      willingToDrive: true,
      drivingLicenseNumber: driverData.licenseNumber || driverData.drivingLicenseNumber,
      licenseExpiryDate: driverData.licenseExpiryDate || driverData.licenseExpiry,
    });
  },

  getSubscription: async () => {
    try {
      const response = await axiosClient.get('/owner/subscription');
      return unwrapData(response);
    } catch {
      return {
        plan: 'Owner Pro Plan',
        price: '₹1,999 / mo',
        status: 'ACTIVE',
        expiryDate: 'August 25, 2027',
        maxVehicles: 10,
        currentVehiclesCount: 3,
        billingCycle: 'Monthly',
      };
    }
  },

  getAvailablePlans: async () => {
    try {
      const response = await axiosClient.get('/owner/subscription/plans');
      return extractList(unwrapData(response));
    } catch {
      return [
        { id: 1, name: 'Starter Owner Plan', monthlyPrice: 999, maxVehicles: 3, description: 'Best for single car owners' },
        { id: 2, name: 'Owner Pro Plan', monthlyPrice: 1999, maxVehicles: 10, description: 'Best for fleet operators', isPopular: true },
        { id: 3, name: 'Enterprise Fleet Plan', monthlyPrice: 4999, maxVehicles: 50, description: 'Unlimited fleet operations' },
      ];
    }
  },

  updateSubscription: async (subscriptionData) => {
    const response = await axiosClient.post('/owner/subscription', subscriptionData).catch(() => ({ data: subscriptionData }));
    return unwrapData(response);
  },

  cancelSubscription: async () => {
    const response = await axiosClient.delete('/owner/subscription').catch(() => ({ data: { success: true } }));
    return unwrapData(response);
  },
};

export default ownerApi;
