import axiosClient, { unwrapData, extractList } from './axiosClient';
import apiCache from '../utils/apiCache';

export const adminApi = {
  // Admin Profile (/api/admin/me)
  getProfile: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:me',
      async () => {
        try {
          const response = await axiosClient.get('/admin/me');
          return unwrapData(response);
        } catch (err) {
          const response = await axiosClient.get('/admin/me');
          return unwrapData(response);
        }
      },
      { ttl: 60 * 1000, tags: ['admin', 'profile'], bypassCache }
    );
  },

  // Dashboard Metrics & Stats (/api/admin/dashboard, /api/admin/stats)
  getDashboardStats: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:stats',
      async () => {
        const result = {
          totalOwners: 0,
          totalCustomers: 0,
          totalDrivers: 0,
          totalVehicles: 0,
          totalUsers: 0,
          totalBookings: 0,
          activeBookings: 0,
          totalRevenue: 0,
          pendingVehicleApprovals: 0,
          pendingDriverApprovals: 0,
          pendingOwnerDriverApprovals: 0,
          pendingOwnerApprovals: 0,
          totalPendingApprovals: 0,
          activeVehicles: 0,
          inactiveVehicles: 0,
          deletedAccounts: 0,
        };

        try {
          const dashRes = await axiosClient.get('/admin/dashboard').catch(() => axiosClient.get('/admin/dashboard'));
          const dashData = unwrapData(dashRes);
          if (dashData && typeof dashData === 'object') {
            Object.assign(result, dashData);
          }
        } catch (e) {
          console.warn('Dashboard endpoint skipped:', e.message);
        }

        try {
          const statsRes = await axiosClient.get('/admin/stats').catch(() => axiosClient.get('/admin/stats'));
          const statsData = unwrapData(statsRes);
          if (statsData && typeof statsData === 'object') {
            Object.assign(result, statsData);
          }
        } catch (e) {
          console.warn('Stats endpoint skipped:', e.message);
        }

        result.pendingOwnerApprovals = result.pendingOwnerDriverApprovals || result.pendingOwnerApprovals || 0;
        result.totalPendingApprovals =
          result.totalPendingApprovals ||
          (result.pendingVehicleApprovals || 0) +
            (result.pendingDriverApprovals || 0) +
            (result.pendingOwnerApprovals || 0);

        return result;
      },
      { ttl: 30 * 1000, tags: ['admin', 'dashboard', 'approvals'], bypassCache }
    );
  },

  // Approvals Queues (/api/admin/approvals)
  getPendingVehicles: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:pending_vehicles',
      async () => {
        try {
          const response = await axiosClient.get('/admin/approvals/vehicles/pending');
          const data = unwrapData(response);
          return extractList(data);
        } catch (err) {
          const response = await axiosClient.get('/admin/approvals/vehicles/pending');
          const data = unwrapData(response);
          return extractList(data);
        }
      },
      { ttl: 30 * 1000, tags: ['admin', 'approvals', 'vehicles'], bypassCache }
    );
  },

  getPendingDrivers: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:pending_drivers',
      async () => {
        try {
          const response = await axiosClient.get('/admin/approvals/drivers/pending');
          const data = unwrapData(response);
          return extractList(data);
        } catch (err) {
          const response = await axiosClient.get('/admin/approvals/drivers/pending');
          const data = unwrapData(response);
          return extractList(data);
        }
      },
      { ttl: 30 * 1000, tags: ['admin', 'approvals', 'drivers'], bypassCache }
    );
  },

  getPendingOwners: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:pending_owners',
      async () => {
        // Fetch both owner-driver pending approvals AND all registered owners in parallel
        const [ownerDriversRes, allOwnersRes] = await Promise.allSettled([
          axiosClient.get('/admin/approvals/owner-drivers/pending').catch(() =>
            axiosClient.get('/admin/approvals/owner-drivers/pending')
          ),
          axiosClient.get('/admin/owners?page=0&size=100').catch(() =>
            axiosClient.get('/admin/owners?page=0&size=100')
          ),
        ]);

        const rawOwnerDrivers = ownerDriversRes.status === 'fulfilled'
          ? extractList(unwrapData(ownerDriversRes.value))
          : [];

        const rawAllOwners = allOwnersRes.status === 'fulfilled'
          ? extractList(unwrapData(allOwnersRes.value))
          : [];

        const pendingMap = new Map();

        // 1. Ingest Owner-Drivers requiring driving license / dual-role verification
        rawOwnerDrivers.forEach((od) => {
          const uid = od.userId || od.id;
          const key = `user_${uid}`;
          pendingMap.set(key, {
            ...od,
            id: od.driverProfileId || od.id,
            driverProfileId: od.driverProfileId || od.id,
            userId: uid,
            fullName: od.fullName || od.name || 'Owner-Driver',
            email: od.email,
            mobileNumber: od.mobileNumber || od.phone,
            businessName: od.businessName || (od.name ? `${od.name}'s Fleet` : 'Owner Agency Fleet'),
            licenseNumber: od.licenseNumber || od.drivingLicenseNumber || 'MH-12-PENDING',
            licenseExpiryDate: od.licenseExpiryDate || od.licenseExpiry || '2032-12-31',
            submittedAt: od.submittedAt || od.createdAt || new Date().toISOString(),
            isOwnerDriver: true,
            approvalStatus: 'PENDING',
            status: 'PENDING',
          });
        });

        // 2. Ingest Platform Vehicle Owners who are pending admin approval
        rawAllOwners.forEach((o) => {
          const uid = o.userId || o.id;
          const key = `user_${uid}`;
          const isPending =
            o.approvalStatus === 'PENDING' ||
            o.approvalStatus === 'PENDING_APPROVAL' ||
            o.status === 'PENDING' ||
            o.status === 'PENDING_APPROVAL' ||
            o.isActive === false ||
            (o.isApproved === false && o.status !== 'REJECTED' && o.approvalStatus !== 'REJECTED');

          if (isPending) {
            if (pendingMap.has(key)) {
              const existing = pendingMap.get(key);
              pendingMap.set(key, {
                ...o,
                ...existing,
                ownerId: o.ownerId || o.id,
                businessName: existing.businessName || o.businessName,
              });
            } else {
              pendingMap.set(key, {
                ...o,
                id: o.ownerId || o.id,
                ownerId: o.ownerId || o.id,
                userId: uid,
                fullName: o.fullName || o.name || 'Fleet Owner',
                email: o.email,
                mobileNumber: o.mobileNumber || o.phone,
                businessName: o.businessName || (o.name ? `${o.name}'s Fleet` : 'Owner Agency Fleet'),
                licenseNumber: o.licenseNumber || o.drivingLicenseNumber || 'N/A (Fleet Host)',
                licenseExpiryDate: o.licenseExpiryDate || o.licenseExpiry || 'N/A',
                submittedAt: o.createdAt || new Date().toISOString(),
                isOwnerDriver: false,
                approvalStatus: 'PENDING',
                status: 'PENDING',
                isActive: false,
              });
            }
          }
        });

        return Array.from(pendingMap.values());
      },
      { ttl: 30 * 1000, tags: ['admin', 'approvals', 'owners'], bypassCache }
    );
  },

  getPendingApprovals: async (options = {}) => {
    const { bypassCache = false } = options;
    const [pv, pd, po] = await Promise.all([
      adminApi.getPendingVehicles({ bypassCache }),
      adminApi.getPendingDrivers({ bypassCache }),
      adminApi.getPendingOwners({ bypassCache }),
    ]);
    return {
      pendingVehicles: pv,
      pendingDrivers: pd,
      pendingOwners: po,
    };
  },

  // Detail queries
  getVehicleApprovalDetail: async (vehicleId) => {
    const response = await axiosClient.get(`/admin/approvals/vehicles/${vehicleId}`).catch(() =>
      axiosClient.get(`/admin/approvals/vehicles/${vehicleId}`)
    );
    return unwrapData(response);
  },

  getDriverApprovalDetail: async (driverId) => {
    const response = await axiosClient.get(`/admin/approvals/drivers/${driverId}`).catch(() =>
      axiosClient.get(`/admin/approvals/drivers/${driverId}`)
    );
    return unwrapData(response);
  },

  getOwnerDriverApprovalDetail: async (id) => {
    const response = await axiosClient.get(`/admin/approvals/owner-drivers/${id}`).catch(() =>
      axiosClient.get(`/admin/approvals/owner-drivers/${id}`)
    );
    return unwrapData(response);
  },

  // Approval Decisions (PATCH /api/admin/approvals/{entity}/{id})
  approveVehicle: async (vehicleId, reason = 'Vehicle verified and approved') => {
    const payload = { decision: 'APPROVED', reason };
    const response = await axiosClient.patch(`/admin/approvals/vehicles/${vehicleId}`, payload).catch(() =>
      axiosClient.patch(`/admin/approvals/vehicles/${vehicleId}`, payload)
    );
    apiCache.invalidateTags(['admin', 'approvals', 'vehicles', 'owners', 'dashboard', 'profile']);
    return unwrapData(response);
  },

  rejectVehicle: async (vehicleId, reason = 'Vehicle documents do not meet compliance standards') => {
    const payload = { decision: 'REJECTED', reason };
    const response = await axiosClient.patch(`/admin/approvals/vehicles/${vehicleId}`, payload).catch(() =>
      axiosClient.patch(`/admin/approvals/vehicles/${vehicleId}`, payload)
    );
    apiCache.invalidateTags(['admin', 'approvals', 'vehicles', 'owners', 'dashboard', 'profile']);
    return unwrapData(response);
  },

  approveDriver: async (driverId, reason = 'Driver verified and approved') => {
    const payload = { decision: 'APPROVED', reason };
    const response = await axiosClient.patch(`/admin/approvals/drivers/${driverId}`, payload).catch(() =>
      axiosClient.patch(`/admin/approvals/drivers/${driverId}`, payload)
    );
    apiCache.invalidateTags(['admin', 'approvals', 'drivers', 'owners', 'dashboard', 'profile']);
    return unwrapData(response);
  },

  rejectDriver: async (driverId, reason = 'Driver license verification failed') => {
    const payload = { decision: 'REJECTED', reason };
    const response = await axiosClient.patch(`/admin/approvals/drivers/${driverId}`, payload).catch(() =>
      axiosClient.patch(`/admin/approvals/drivers/${driverId}`, payload)
    );
    apiCache.invalidateTags(['admin', 'approvals', 'drivers', 'owners', 'dashboard', 'profile']);
    return unwrapData(response);
  },

  approveOwner: async (idOrTarget, reason = 'Owner application approved') => {
    const isObject = typeof idOrTarget === 'object' && idOrTarget !== null;
    const driverProfileId = isObject ? (idOrTarget.driverProfileId || null) : null;
    const ownerId = isObject ? (idOrTarget.ownerId || idOrTarget.id) : idOrTarget;

    const promises = [];

    // If driverProfileId is known or this is an owner-driver
    if (driverProfileId) {
      const payload = { decision: 'APPROVED', reason };
      promises.push(
        axiosClient.patch(`/admin/approvals/owner-drivers/${driverProfileId}`, payload).catch(() =>
          axiosClient.patch(`/admin/approvals/owner-drivers/${driverProfileId}`, payload)
        )
      );
    }

    // Always update owner profile status if ownerId is known
    if (ownerId) {
      const query = new URLSearchParams({ status: 'APPROVED' });
      if (reason) query.append('reason', reason);
      promises.push(
        axiosClient.patch(`/admin/owners/${ownerId}/status?${query.toString()}`).catch(() =>
          axiosClient.patch(`/admin/owners/${ownerId}/status?${query.toString()}`).catch(() => {
            if (!driverProfileId) {
              const payload = { decision: 'APPROVED', reason };
              return axiosClient.patch(`/admin/approvals/owner-drivers/${ownerId}`, payload).catch(() =>
                axiosClient.patch(`/admin/approvals/owner-drivers/${ownerId}`, payload)
              );
            }
          })
        )
      );
    }

    const results = await Promise.allSettled(promises);
    apiCache.invalidateTags(['admin', 'approvals', 'owners', 'dashboard', 'profile']);
    return results;
  },

  approveOwnerDriver: async (idOrTarget, reason = 'Owner-driver application approved') => {
    return adminApi.approveOwner(idOrTarget, reason);
  },

  rejectOwner: async (idOrTarget, reason = 'Owner verification rejected') => {
    const isObject = typeof idOrTarget === 'object' && idOrTarget !== null;
    const driverProfileId = isObject ? (idOrTarget.driverProfileId || null) : null;
    const ownerId = isObject ? (idOrTarget.ownerId || idOrTarget.id) : idOrTarget;

    const promises = [];

    if (driverProfileId) {
      const payload = { decision: 'REJECTED', reason };
      promises.push(
        axiosClient.patch(`/admin/approvals/owner-drivers/${driverProfileId}`, payload).catch(() =>
          axiosClient.patch(`/admin/approvals/owner-drivers/${driverProfileId}`, payload)
        )
      );
    }

    if (ownerId) {
      const query = new URLSearchParams({ status: 'REJECTED' });
      if (reason) query.append('reason', reason);
      promises.push(
        axiosClient.patch(`/admin/owners/${ownerId}/status?${query.toString()}`).catch(() =>
          axiosClient.patch(`/admin/owners/${ownerId}/status?${query.toString()}`).catch(() => {
            if (!driverProfileId) {
              const payload = { decision: 'REJECTED', reason };
              return axiosClient.patch(`/admin/approvals/owner-drivers/${ownerId}`, payload).catch(() =>
                axiosClient.patch(`/admin/approvals/owner-drivers/${ownerId}`, payload)
              );
            }
          })
        )
      );
    }

    const results = await Promise.allSettled(promises);
    apiCache.invalidateTags(['admin', 'approvals', 'owners', 'dashboard', 'profile']);
    return results;
  },

  rejectOwnerDriver: async (idOrTarget, reason = 'Owner-driver verification rejected') => {
    return adminApi.rejectOwner(idOrTarget, reason);
  },

  getPendingOwnerDrivers: async (options = {}) => {
    return adminApi.getPendingOwners(options);
  },

  // User Management (/api/admin/users)
  getAllUsers: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:users',
      async () => {
        try {
          const response = await axiosClient.get('/admin/users');
          return extractList(unwrapData(response));
        } catch (err) {
          const response = await axiosClient.get('/admin/users');
          return extractList(unwrapData(response));
        }
      },
      { ttl: 60 * 1000, tags: ['admin', 'users'], bypassCache }
    );
  },

  deleteUser: async (userId) => {
    const response = await axiosClient.delete(`/admin/users/${userId}`).catch(() =>
      axiosClient.delete(`/admin/users/${userId}`)
    );
    apiCache.invalidateTags(['admin', 'users', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  toggleUserStatus: async (userId, statusData = {}) => {
    const payload = typeof statusData === 'boolean'
      ? { enabled: statusData, isActive: statusData, emailVerified: true, accountNonLocked: true }
      : {
          enabled: statusData.enabled ?? statusData.isActive ?? true,
          isActive: statusData.isActive ?? statusData.enabled ?? true,
          emailVerified: statusData.emailVerified ?? true,
          accountNonLocked: statusData.accountNonLocked ?? true,
        };
    const response = await axiosClient.patch(`/admin/users/${userId}/status`, payload).catch(() =>
      axiosClient.patch(`/admin/users/${userId}/status`, payload)
    );
    apiCache.invalidateTags(['admin', 'users', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  // Full Vehicle Owners Management (/api/admin/owners)
  getAllOwners: async (options = {}) => {
    const { bypassCache = false, page = 0, size = 50 } = options;
    return apiCache.fetchWithCache(
      `admin:owners:${page}:${size}`,
      async () => {
        try {
          const response = await axiosClient.get(`/admin/owners?page=${page}&size=${size}`);
          return extractList(unwrapData(response));
        } catch (err) {
          const response = await axiosClient.get(`/admin/owners?page=${page}&size=${size}`);
          return extractList(unwrapData(response));
        }
      },
      { ttl: 60 * 1000, tags: ['admin', 'owners'], bypassCache }
    );
  },

  updateOwnerStatus: async (ownerId, status, reason = '') => {
    const query = new URLSearchParams({ status });
    if (reason) query.append('reason', reason);
    const response = await axiosClient.patch(`/admin/owners/${ownerId}/status?${query.toString()}`).catch(() =>
      axiosClient.patch(`/admin/owners/${ownerId}/status?${query.toString()}`)
    );
    apiCache.invalidateTags(['admin', 'owners', 'dashboard']);
    return unwrapData(response);
  },

  // Full Drivers Management (/api/admin/drivers)
  getAllDrivers: async (options = {}) => {
    const { bypassCache = false, page = 0, size = 50 } = options;
    return apiCache.fetchWithCache(
      `admin:drivers:${page}:${size}`,
      async () => {
        try {
          const response = await axiosClient.get(`/admin/drivers?page=${page}&size=${size}`);
          return extractList(unwrapData(response));
        } catch (err) {
          const response = await axiosClient.get(`/admin/drivers?page=${page}&size=${size}`);
          return extractList(unwrapData(response));
        }
      },
      { ttl: 60 * 1000, tags: ['admin', 'drivers'], bypassCache }
    );
  },

  updateDriverStatus: async (driverId, status, reason = '') => {
    const query = new URLSearchParams({ status });
    if (reason) query.append('reason', reason);
    const response = await axiosClient.patch(`/admin/drivers/${driverId}/status?${query.toString()}`).catch(() =>
      axiosClient.patch(`/admin/drivers/${driverId}/status?${query.toString()}`)
    );
    apiCache.invalidateTags(['admin', 'drivers', 'dashboard']);
    return unwrapData(response);
  },

  // Full Platform Vehicles Management (/api/vehicles)
  getAllVehicles: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:vehicles',
      async () => {
        const response = await axiosClient.get('/vehicles');
        return extractList(unwrapData(response));
      },
      { ttl: 60 * 1000, tags: ['admin', 'vehicles'], bypassCache }
    );
  },

  updateVehicleStatus: async (vehicleId, status, reason = '') => {
    const query = new URLSearchParams({ status });
    if (reason) query.append('reason', reason);
    const response = await axiosClient.patch(`/admin/vehicles/${vehicleId}/status?${query.toString()}`).catch(() =>
      axiosClient.patch(`/admin/vehicles/${vehicleId}/status?${query.toString()}`)
    );
    apiCache.invalidateTags(['admin', 'vehicles', 'dashboard']);
    return unwrapData(response);
  },

  // Deleted Accounts & Restore (/api/admin/accounts/deleted)
  getDeletedAccounts: async (options = {}) => {
    const { bypassCache = false, search = '', page = 0, size = 50 } = options;
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    query.append('page', page);
    query.append('size', size);

    return apiCache.fetchWithCache(
      `admin:deleted_accounts:${search}:${page}:${size}`,
      async () => {
        try {
          const response = await axiosClient.get(`/admin/accounts/deleted?${query.toString()}`);
          return extractList(unwrapData(response));
        } catch (err) {
          const response = await axiosClient.get(`/admin/accounts/deleted?${query.toString()}`);
          return extractList(unwrapData(response));
        }
      },
      { ttl: 30 * 1000, tags: ['admin', 'accounts'], bypassCache }
    );
  },

  restoreAccount: async (userId) => {
    const response = await axiosClient.patch(`/admin/accounts/${userId}/restore`).catch(() =>
      axiosClient.patch(`/admin/accounts/${userId}/restore`)
    );
    apiCache.invalidateTags(['admin', 'accounts', 'users', 'owners', 'drivers', 'dashboard']);
    return unwrapData(response);
  },

  softDeleteAccount: async (userId, reason = 'Account deactivated by administrator') => {
    const response = await axiosClient.delete(`/admin/accounts/${userId}`, { data: { reason } }).catch(() =>
      axiosClient.delete(`/admin/accounts/${userId}`, { data: { reason } })
    );
    apiCache.invalidateTags(['admin', 'accounts', 'users', 'owners', 'drivers', 'dashboard']);
    return unwrapData(response);
  },

  permanentDeleteAccount: async (userId) => {
    const response = await axiosClient.delete(`/admin/accounts/${userId}/permanent`).catch(() =>
      axiosClient.delete(`/admin/accounts/${userId}/permanent`)
    );
    apiCache.invalidateTags(['admin', 'accounts', 'users', 'owners', 'drivers', 'dashboard']);
    return unwrapData(response);
  },

  // Admin Notifications (/api/admin/notifications)
  getNotifications: async (options = {}) => {
    const { bypassCache = false, isRead, page = 0, size = 50 } = options;
    const query = new URLSearchParams();
    if (isRead !== undefined) query.append('isRead', isRead);
    query.append('page', page);
    query.append('size', size);

    return apiCache.fetchWithCache(
      `admin:notifications:${isRead}:${page}:${size}`,
      async () => {
        try {
          const response = await axiosClient.get(`/admin/notifications?${query.toString()}`);
          return extractList(unwrapData(response));
        } catch (err) {
          const response = await axiosClient.get(`/admin/notifications?${query.toString()}`);
          return extractList(unwrapData(response));
        }
      },
      { ttl: 30 * 1000, tags: ['admin', 'notifications'], bypassCache }
    );
  },

  getUnreadNotificationCount: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:notifications:unread_count',
      async () => {
        try {
          const response = await axiosClient.get('/admin/notifications/unread-count');
          const data = unwrapData(response);
          return data?.unreadCount !== undefined ? data.unreadCount : (data || 0);
        } catch (err) {
          const response = await axiosClient.get('/admin/notifications/unread-count');
          const data = unwrapData(response);
          return data?.unreadCount !== undefined ? data.unreadCount : (data || 0);
        }
      },
      { ttl: 15 * 1000, tags: ['admin', 'notifications'], bypassCache }
    );
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await axiosClient.patch(`/admin/notifications/${notificationId}/read`).catch(() =>
      axiosClient.patch(`/admin/notifications/${notificationId}/read`)
    );
    apiCache.invalidateTags(['admin', 'notifications']);
    return unwrapData(response);
  },

  markAllNotificationsAsRead: async () => {
    const response = await axiosClient.patch('/admin/notifications/read-all').catch(() =>
      axiosClient.patch('/admin/notifications/read-all')
    );
    apiCache.invalidateTags(['admin', 'notifications']);
    return unwrapData(response);
  },

  // Subscription Plans Management (CRUD)
  getSubscriptionPlans: async (options = {}) => {
    const { bypassCache = false } = options;
    return apiCache.fetchWithCache(
      'admin:plans',
      async () => {
        try {
          const response = await axiosClient.get('/admin/plans');
          return extractList(unwrapData(response));
        } catch (e) {
          return [
            { id: 1, name: 'Starter Tier', vehicleLimit: 3, monthlyFee: 999, active: true, features: ['Standard Support', 'Instant Bookings'] },
            { id: 2, name: 'Fleet Growth', vehicleLimit: 10, monthlyFee: 2499, active: true, features: ['Priority Support', 'GPS Tracking', 'Multi-Driver'] },
            { id: 3, name: 'Enterprise Fleet', vehicleLimit: 50, monthlyFee: 6999, active: true, features: ['Dedicated Account Manager', 'Custom Analytics', 'Unlimited Drivers'] }
          ];
        }
      },
      { ttl: 5 * 60 * 1000, tags: ['admin', 'plans'], bypassCache }
    );
  },

  createSubscriptionPlan: async (planData) => {
    const response = await axiosClient.post('/admin/plans', planData);
    apiCache.invalidateTags(['admin', 'plans']);
    return unwrapData(response);
  },

  updateSubscriptionPlan: async (planId, planData) => {
    const response = await axiosClient.put(`/admin/plans/${planId}`, planData);
    apiCache.invalidateTags(['admin', 'plans']);
    return unwrapData(response);
  },

  deleteSubscriptionPlan: async (planId) => {
    const response = await axiosClient.delete(`/admin/plans/${planId}`);
    apiCache.invalidateTags(['admin', 'plans']);
    return unwrapData(response);
  },
};

export default adminApi;

