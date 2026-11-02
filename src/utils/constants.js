export const ROLES = {
  CUSTOMER: 'ROLE_CUSTOMER',
  OWNER: 'ROLE_OWNER',
  DRIVER: 'ROLE_DRIVER',
  ADMIN: 'ROLE_ADMIN',
};

export const STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
};

export const VEHICLE_TYPES = [
  'SEDAN',
  'SUV',
  'HATCHBACK',
  'LUXURY',
  'COUPE',
  'VAN',
  'TRUCK',
];

export const SEATING_CAPACITIES = [2, 4, 5, 7, 8, 9];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'car_rental_token',
  REFRESH_TOKEN: 'car_rental_refresh_token',
  USER: 'car_rental_user',
  ROLES: 'car_rental_roles',
  ACTIVE_ROLE: 'car_rental_active_role',
};

export const DEFAULT_ROLE_REDIRECTS = {
  ROLE_CUSTOMER: '/customer',
  ROLE_OWNER: '/owner',
  ROLE_DRIVER: '/driver',
  ROLE_ADMIN: '/admin',
};
