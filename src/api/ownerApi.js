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
  // Owner Dashboard (/api/owners/dashboard, /api/owners/dashboard)
  getDashboardStats: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:dashboard',
      async () => {
        try {
          const response = await axiosClient.get('/owners/dashboard').catch(() => axiosClient.get('/owners/dashboard'));
          return unwrapData(response);
        } catch (err) {
          return { message: 'Owner Dashboard' };
        }
      },
      { ttl: 30 * 1000, tags: ['dashboard', 'owners', 'vehicles', 'drivers', 'bookings'], bypassCache }
    );
  },

  // Owner Profile (/api/owners/profile, /api/owners/profile)
  getProfile: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:profile',
      async () => {
        try {
          const response = await axiosClient.get('/owners/profile').catch(() => axiosClient.get('/owners/profile'));
          return unwrapData(response);
        } catch (err) {
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

    // OwnerProfileUpdateRequest schema: firstName, lastName, phoneNumber, willingToDrive, drivingLicenseNumber, licenseExpiryDate
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

    const response = await axiosClient.put('/owners/profile', payload).catch(() =>
      axiosClient.put('/owners/profile', payload)
    );
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
          const response = await axiosClient.get('/owners/profile').catch(() => axiosClient.get('/owners/profile'));
          const data = unwrapData(response);
          const isApproved = (data?.status || 'APPROVED') === 'APPROVED' && (data?.approvalStatus || 'APPROVED') === 'APPROVED';
          return {
            approved: isApproved,
            status: data?.status || 'APPROVED',
            approvalStatus: data?.approvalStatus || data?.status || 'APPROVED',
            rejectionReason: data?.rejectionReason || null,
            willingToDrive: !!data?.willingToDrive,
          };
        } catch (err) {
          return { approved: true, status: 'APPROVED', approvalStatus: 'APPROVED' };
        }
      },
      { ttl: 60 * 1000, tags: ['owners', 'approvals'], bypassCache }
    );
  },

  getOwnerStatus: async (options = {}) => {
    return ownerApi.getApprovalStatus(options);
  },

  // Vehicle Management (/api/owners/vehicles, /api/owners/vehicles)
  getVehicles: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:vehicles',
      async () => {
        try {
          const response = await axiosClient.get('/owners/vehicles').catch(() => axiosClient.get('/owners/vehicles'));
          return extractList(unwrapData(response));
        } catch (err) {
          const response = await axiosClient.get('/vehicles/my-vehicles').catch(() => axiosClient.get('/vehicles'));
          return extractList(unwrapData(response));
        }
      },
      { ttl: 2 * 60 * 1000, tags: ['vehicles', 'owners'], bypassCache }
    );
  },

  addVehicle: async (vehicleData) => {
    // VehicleRequest schema: brand, model, year, licensePlate, pricePerKm, seatingCapacity, vehicleType, fuelType, status, location, imageUrls, description
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

    const response = await axiosClient.post('/owners/vehicles', payload).catch(() =>
      axiosClient.post('/owners/vehicles', payload).catch(() =>
        axiosClient.post('/vehicles', payload)
      )
    );
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

    if (vehicleData.approvalStatus !== undefined) {
      payload.approvalStatus = vehicleData.approvalStatus;
    }
    if (vehicleData.reApply !== undefined) {
      payload.reApply = vehicleData.reApply;
    }

    const response = await axiosClient.put(`/owners/vehicles/${vehicleId}`, payload).catch(() =>
      axiosClient.put(`/owners/vehicles/${vehicleId}`, payload).catch(() =>
        axiosClient.put(`/vehicles/${vehicleId}`, payload)
      )
    );
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
      const response = await axiosClient.put(`/owners/vehicles/${vehicleId}`, payload).catch(() =>
        axiosClient.put(`/owners/vehicles/${vehicleId}`, payload).catch(() =>
          axiosClient.put(`/vehicles/${vehicleId}`, payload)
        )
      );
      apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
      return unwrapData(response);
    } else {
      const created = await ownerApi.addVehicle(payload);
      if (vehicleId) {
        try {
          await ownerApi.deleteVehicle(vehicleId);
        } catch (delErr) {
          console.warn('Failed to delete old rejected vehicle:', delErr.message);
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
    const response = await axiosClient.delete(`/owners/vehicles/${vehicleId}`).catch(() =>
      axiosClient.delete(`/owners/vehicles/${vehicleId}`).catch(() =>
        axiosClient.delete(`/vehicles/${vehicleId}`)
      )
    );
    apiCache.invalidateTags(['vehicles', 'owners', 'dashboard', 'admin', 'approvals']);
    return unwrapData(response);
  },

  // Driver Management (/api/owners/drivers/available, /api/owners/drivers)
  getDrivers: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'owner:drivers',
      async () => {
        try {
          const response = await axiosClient.get('/owners/drivers/available').catch(() =>
            axiosClient.get('/owners/drivers/available').catch(() =>
              axiosClient.get('/drivers/available')
            )
          );
          return extractList(unwrapData(response));
        } catch (err) {
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

  // Dedicated Driver Registration Endpoint (POST /api/owners/drivers, /api/owners/drivers)
  // Request Schema: CreateDriverRequest (name, firstName, lastName, email, phoneNumber, password, licenseNumber, licenseExpiryDate, licenseFrontImage, licenseBackImage, resolvedName)
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

    const response = await axiosClient.post('/owners/drivers', payload).catch(() =>
      axiosClient.post('/owners/drivers', payload)
    );
    apiCache.invalidateTags(['drivers', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  // Driver Email Verification (POST /api/auth/verify-email)
  // Request Schema: VerifyEmailRequest (email, otp)
  verifyDriverEmail: async ({ email, otp, registrationData }) => {
    const cleanEmail = (email || registrationData?.email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();
    const verifyPayload = {
      email: cleanEmail,
      otp: cleanOtp,
      token: cleanOtp,
      verificationCode: cleanOtp,
      code: cleanOtp,
    };

    let response;
    try {
      response = await axiosClient.post('/auth/verify-email', verifyPayload);
    } catch (err1) {
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
        throw err1;
      }
    }
    apiCache.invalidateTags(['drivers', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  // Resend Driver Verification OTP (POST /api/auth/resend-verification-otp)
  resendDriverVerification: async ({ email, phone }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      const response = await axiosClient.post('/auth/resend-verification-otp', { email: cleanEmail });
      return unwrapData(response);
    } catch (err) {
      const res2 = await axiosClient.post('/auth/send-otp', {
        email: cleanEmail,
        phone: phone || '',
        purpose: 'DRIVER_REGISTRATION',
      });
      return unwrapData(res2);
    }
  },

  // Booking Operations (/api/owners/bookings)
  getBookings: async (options = {}) => {
    const { bypassCache = false, status } = options;
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiCache.fetchWithCache(
      `owner:bookings:${status || 'all'}`,
      async () => {
        try {
          const response = await axiosClient.get(`/owners/bookings${query}`).catch(() =>
            axiosClient.get(`/owners/bookings${query}`).catch(() =>
              axiosClient.get('/bookings/owner-bookings')
            )
          );
          return extractList(unwrapData(response));
        } catch (err) {
          console.warn('Owner bookings query fallback:', err.message);
          return [];
        }
      },
      { ttl: 30 * 1000, tags: ['bookings', 'trips', 'owners'], bypassCache }
    );
  },

  getBookingById: async (bookingId) => {
    const response = await axiosClient.get(`/owners/bookings/${bookingId}`).catch(() =>
      axiosClient.get(`/owners/bookings/${bookingId}`).catch(() =>
        axiosClient.get(`/bookings/${bookingId}`)
      )
    );
    return unwrapData(response);
  },

  // Driver Assignment Endpoint (POST /api/owners/bookings/{id}/assign-driver)
  // Request Schema: DriverAssignmentRequest (driverId: int64)
  assignDriver: async (bookingId, driverId) => {
    const numDriverId = Number(driverId);
    if (!numDriverId || isNaN(numDriverId)) {
      throw new Error('Invalid Driver ID provided for assignment');
    }
    const payload = { driverId: numDriverId };

    let response = null;
    let lastError = null;

    const candidateCalls = [
      () => axiosClient.post(`/owners/bookings/${bookingId}/assign-driver`, payload),
      () => axiosClient.post(`/owners/bookings/${bookingId}/assign-driver`, payload),
      () => axiosClient.post(`/bookings/${bookingId}/assign-driver`, payload),
    ];

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status;
        if (status === 404 || status === 405) continue;
        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'vehicles', 'drivers']);
    return unwrapData(response);
  },

  // Booking Status Update Endpoint (PATCH/PUT /api/owners/bookings/{id}/status)
  // Request Schema: BookingStatusUpdateRequest (status, reason, rejectionReason, bookingStatus)
  updateBookingStatus: async (bookingId, status = 'CONFIRMED', reason = '') => {
    const payload = {
      status,
      reason: reason || `Status updated to ${status}`,
      bookingStatus: status,
    };

    let response = null;
    let lastError = null;

    const candidateCalls = [
      () => axiosClient.patch(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.put(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.patch(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.put(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.patch(`/bookings/${bookingId}/status`, payload),
    ];

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const statusCode = err?.status || err?.response?.status;
        if (statusCode === 404 || statusCode === 405) continue;
        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  // Accept Booking (Delegates directly to assignDriver for commercial drivers, or updateBookingStatus for owner self-driving)
  acceptBooking: async (bookingId, { driverId = null, useOwnerAsDriver = false, notes = '' } = {}) => {
    const cleanDriverId = Number(driverId);

    // If a commercial driver is selected, hit the dedicated driver assignment endpoint directly
    if (!useOwnerAsDriver && cleanDriverId && cleanDriverId !== 999 && !isNaN(cleanDriverId)) {
      return ownerApi.assignDriver(bookingId, cleanDriverId);
    }

    // Otherwise, for self-driving owner, update the booking status directly to CONFIRMED
    return ownerApi.updateBookingStatus(
      bookingId,
      'CONFIRMED',
      notes || 'Confirmed by owner (self-driving)'
    );
  },

  // Dedicated Vehicle Replacement Endpoint (POST /api/owners/bookings/{id}/replace-vehicle)
  // Request Schema: VehicleReplacementRequest (vehicleId, newVehicleId, reason, effectiveVehicleId)
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

    let response = null;
    let lastError = null;

    const candidateCalls = [
      () => axiosClient.post(`/owners/bookings/${bookingId}/replace-vehicle`, payload),
      () => axiosClient.post(`/owners/bookings/${bookingId}/replace-vehicle`, payload),
    ];

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status;
        if (status === 404 || status === 405) continue;
        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'vehicles']);
    return unwrapData(response);
  },

  // Dedicated Driver Replacement Endpoint (POST /api/owners/bookings/{id}/replace-driver)
  // Request Schema: DriverReplacementRequest (driverId, newDriverId, reason, effectiveDriverId)
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

    let response = null;
    let lastError = null;

    const candidateCalls = [
      () => axiosClient.post(`/owners/bookings/${bookingId}/replace-driver`, payload),
      () => axiosClient.post(`/owners/bookings/${bookingId}/replace-driver`, payload),
    ];

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status;
        if (status === 404 || status === 405) continue;
        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    apiCache.invalidateTags(['bookings', 'trips', 'owners', 'dashboard', 'drivers']);
    return unwrapData(response);
  },

  reassignBooking: async (bookingId, { vehicleId = null, driverId = null, useOwnerAsDriver = false, reassignmentReason = '' } = {}) => {
    const cleanDriverId = Number(driverId);
    const cleanVehicleId = Number(vehicleId);

    let result = null;

    // 1. If a new vehicle is selected, invoke replaceVehicle
    if (cleanVehicleId && !isNaN(cleanVehicleId)) {
      result = await ownerApi.replaceVehicle(bookingId, {
        newVehicleId: cleanVehicleId,
        reason: reassignmentReason || 'Vehicle reassigned by owner',
      });
    }

    // 2. If a commercial driver is assigned, invoke replaceDriver or assignDriver
    if (!useOwnerAsDriver && cleanDriverId && cleanDriverId !== 999 && !isNaN(cleanDriverId)) {
      try {
        result = await ownerApi.replaceDriver(bookingId, {
          newDriverId: cleanDriverId,
          reason: reassignmentReason || 'Driver reassigned by owner',
        });
      } catch (driverErr) {
        const status = driverErr?.status || driverErr?.response?.status;
        if (status === 404 || status === 405) {
          result = await ownerApi.assignDriver(bookingId, cleanDriverId);
        } else {
          throw driverErr;
        }
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

    let response = null;
    let lastError = null;

    const candidateCalls = [
      () => axiosClient.patch(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.put(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.patch(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.put(`/owners/bookings/${bookingId}/status`, payload),
      () => axiosClient.patch(`/bookings/${bookingId}/status`, payload),
    ];

    for (const call of candidateCalls) {
      try {
        response = await call();
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status;
        if (status === 404 || status === 405) continue;
        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

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

  // Subscription management helpers for OwnerSubscription.jsx
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
