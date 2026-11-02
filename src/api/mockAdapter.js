// Fully Indianized mock dataset with Indian vehicles, Indian cities (INR / ₹)

export let mockVehicles = [
  {
    id: 1,
    ownerName: 'Apex Auto Rentals',
    brand: 'Toyota',
    model: 'Innova Crysta VX',
    year: 2024,
    vehicleNumber: 'MH-12-AB-3456',
    vehicleType: 'SUV',
    seatingCapacity: 7,
    city: 'Pune',
    pricePerKm: 22,
    acPricePerKm: 25,
    fuelType: 'Diesel',
    ac: true,
    status: 'AVAILABLE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Premium 7-seater MPV ideal for family outstation trips from Pune & Mumbai with roof luggage carrier.',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      'GPS Live Tracking',
      'Dual Front Airbags',
      'Rear AC Climate Vents',
      'Touchscreen Infotainment',
      'Luggage Roof Rack',
      'USB Fast Charging Ports',
      'ABS with EBD',
    ],
  },
  {
    id: 2,
    ownerName: 'Royal Car Rentals',
    brand: 'Mahindra',
    model: 'Thar 4x4 LX',
    year: 2023,
    vehicleNumber: 'MH-09-TH-7788',
    vehicleType: 'SUV',
    seatingCapacity: 4,
    city: 'Kolhapur',
    pricePerKm: 20,
    acPricePerKm: 23,
    fuelType: 'Diesel',
    ac: true,
    status: 'AVAILABLE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Rugged 4x4 SUV suitable for off-road adventures and Western Ghat mountain tours.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      '4x4 Off-Road Drive',
      'All-Terrain Tyres',
      'Convertible Hard Top',
      'Bluetooth Audio',
      'Roll Cage Protection',
      'Hill Descent Control',
    ],
  },
  {
    id: 3,
    ownerName: 'GreenMobility India',
    brand: 'Tata',
    model: 'Nexon EV Max',
    year: 2024,
    vehicleNumber: 'MH-10-EV-9900',
    vehicleType: 'SEDAN',
    seatingCapacity: 5,
    city: 'Sangli',
    pricePerKm: 16,
    acPricePerKm: 18,
    fuelType: 'Electric',
    ac: true,
    status: 'AVAILABLE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'All-electric compact SUV with silent drive, zero emissions, and 400+ km range.',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      '100% Electric (Zero Emission)',
      'Fast DC Charging Support',
      'Wireless Smartphone Charger',
      'Ventilated Front Seats',
      'Harman 8-Speaker Sound',
      'Electronic Sunroof',
    ],
  },
  {
    id: 4,
    ownerName: 'Mumbai Luxury Cars',
    brand: 'Mercedes-Benz',
    model: 'C-Class AMG Line',
    year: 2024,
    vehicleNumber: 'MH-02-MB-1001',
    vehicleType: 'LUXURY',
    seatingCapacity: 5,
    city: 'Mumbai',
    pricePerKm: 45,
    acPricePerKm: 50,
    fuelType: 'Petrol',
    ac: true,
    status: 'BOOKED',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Ultra-luxury executive sedan for VIP corporate transport and wedding events in Mumbai.',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      'Nappa Leather Upholstery',
      'Burmester 3D Surround Sound',
      'Panoramic Glass Sunroof',
      '64-Color Ambient Lighting',
      'Active Park Assist',
      'Rear Reclining Seats',
    ],
  },
  {
    id: 5,
    ownerName: 'Apex Auto Rentals',
    brand: 'Maruti Suzuki',
    model: 'Swift Dzire ZXI',
    year: 2023,
    vehicleNumber: 'MH-14-DZ-4455',
    vehicleType: 'SEDAN',
    seatingCapacity: 5,
    city: 'Pune',
    pricePerKm: 14,
    acPricePerKm: 16,
    fuelType: 'Petrol',
    ac: true,
    status: 'AVAILABLE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Highly economical compact sedan for city errands, business rides, and airport transfers.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      'High Fuel Efficiency (22 km/l)',
      'Rear AC Vents',
      'Touchscreen Infotainment',
      'Dual Airbags',
      'Power Windows',
    ],
  },
  {
    id: 6,
    ownerName: 'Goa Coast Rentals',
    brand: 'Hyundai',
    model: 'Creta SX (O)',
    year: 2024,
    vehicleNumber: 'GA-03-CR-2024',
    vehicleType: 'SUV',
    seatingCapacity: 5,
    city: 'Goa',
    pricePerKm: 18,
    acPricePerKm: 21,
    fuelType: 'Diesel',
    ac: true,
    status: 'AVAILABLE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Popular stylish SUV with panoramic sunroof for Goa coastal tours and scenic beach drives.',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      'Panoramic Sunroof',
      'Bose Premium 8 Speakers',
      'Cruise Control',
      'Air Purifier with AQI Display',
      'Wireless Android Auto / Apple CarPlay',
    ],
  },
  {
    id: 7,
    ownerName: 'Apex Auto Rentals',
    brand: 'Mahindra',
    model: 'XUV700 AX7 Luxury',
    year: 2024,
    vehicleNumber: 'MH-12-XV-7007',
    vehicleType: 'SUV',
    seatingCapacity: 7,
    city: 'Pune',
    pricePerKm: 25,
    acPricePerKm: 28,
    fuelType: 'Diesel',
    ac: true,
    status: 'MAINTENANCE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Tech-loaded 7-seater SUV currently undergoing routine 10,000 km servicing.',
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      'ADAS Level 2 Autonomous Safety',
      'Dual 10.25-inch Digital Screens',
      'Sony 12-Speaker 3D Audio',
      'Skyroof Panoramic Window',
      'Electronic Parking Brake',
    ],
  },
  {
    id: 8,
    ownerName: 'Royal Car Rentals',
    brand: 'Honda',
    model: 'City ZX i-VTEC',
    year: 2023,
    vehicleNumber: 'MH-09-HC-1020',
    vehicleType: 'SEDAN',
    seatingCapacity: 5,
    city: 'Sangli',
    pricePerKm: 15,
    acPricePerKm: 17,
    fuelType: 'Petrol',
    ac: true,
    status: 'AVAILABLE',
    approvalStatus: 'APPROVED',
    isApproved: true,
    description: 'Comfortable executive sedan with smooth automatic CVT transmission.',
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
    images: {
      front: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
    },
    rcFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    rcBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
    features: [
      'Honda Sensing Safety',
      'LaneWatch Camera',
      'Electric Sunroof',
      'Leather Wrapped Steering',
      'Auto Climate Control',
    ],
  },
];

export let mockBookings = [
  {
    id: 101,
    vehicleId: 1,
    vehicleName: 'Toyota Innova Crysta VX',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Innova Crysta VX',
    vehicleNumber: 'MH-12-AB-3456',
    ownerName: 'Apex Auto Rentals',
    ownerPhone: '+91 98900 11223',
    ownerCompany: 'Apex Auto Rentals Pvt Ltd',
    ownerCity: 'Pune',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98220 11223',
    customerEmail: 'rahul@example.com',
    startDate: '2026-09-05',
    endDate: '2026-09-08',
    pickupLocation: 'Pune Railway Station Hub',
    dropoffLocation: 'Mahabaleshwar Club Resort',
    tripType: 'OUTSTATION',
    passengerCount: 5,
    agreedAmount: 4800,
    otp: '842716',
    notes: 'Please keep luggage carrier ready.',
    status: 'PENDING',
    createdAt: '2026-08-31',
  },
  {
    id: 102,
    vehicleId: 3,
    vehicleName: 'Tata Nexon EV Max',
    vehicleBrand: 'Tata',
    vehicleModel: 'Nexon EV Max',
    vehicleNumber: 'MH-10-EV-9900',
    ownerName: 'GreenMobility India',
    ownerPhone: '+91 99881 22334',
    ownerCompany: 'GreenMobility India Fleet Ltd',
    ownerCity: 'Sangli',
    customerName: 'Priya Kulkarni',
    customerPhone: '+91 91234 56789',
    customerEmail: 'priya@example.com',
    startDate: '2026-09-02',
    endDate: '2026-09-04',
    pickupLocation: 'Sangli Central Bus Stand',
    dropoffLocation: 'Kolhapur Mahalaxmi Temple',
    tripType: 'LOCAL',
    passengerCount: 4,
    agreedAmount: 2200,
    otp: '519842',
    notes: 'Battery should be 100% charged.',
    status: 'CONFIRMED',
    driverId: 1,
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 43210',
    createdAt: '2026-08-30',
  },
  {
    id: 103,
    vehicleId: 4,
    vehicleName: 'Mercedes-Benz C-Class',
    vehicleBrand: 'Mercedes-Benz',
    vehicleModel: 'C-Class',
    vehicleNumber: 'MH-01-MB-5000',
    ownerName: 'Apex Auto Rentals',
    ownerPhone: '+91 98900 11223',
    ownerCompany: 'Apex Auto Rentals Pvt Ltd',
    ownerCity: 'Pune',
    customerName: 'Amitabh Patil',
    customerPhone: '+91 99887 76655',
    customerEmail: 'amitabh@example.com',
    startDate: '2026-08-20',
    endDate: '2026-08-22',
    pickupLocation: 'CSMT Mumbai Airport Terminal 2',
    dropoffLocation: 'BKC Business Park Tower B',
    tripType: 'LOCAL',
    passengerCount: 2,
    agreedAmount: 7500,
    status: 'COMPLETED',
    driverId: 1,
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 43210',
    completedAt: '2026-08-22 18:30',
    createdAt: '2026-08-19',
  },
  {
    id: 104,
    vehicleId: 2,
    vehicleName: 'Mahindra Thar 4x4 LX',
    vehicleBrand: 'Mahindra',
    vehicleModel: 'Thar 4x4 LX',
    vehicleNumber: 'MH-09-TH-7788',
    ownerName: 'Royal Car Rentals',
    ownerPhone: '+91 97654 88990',
    ownerCompany: 'Royal Car Rentals Kolhapur',
    ownerCity: 'Kolhapur',
    customerName: 'Siddharth Deshmukh',
    customerPhone: '+91 98234 11229',
    customerEmail: 'siddharth@example.com',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    pickupLocation: 'Kolhapur Rankala Lake',
    dropoffLocation: 'Goa Baga Beach Hotel',
    tripType: 'OUTSTATION',
    passengerCount: 3,
    agreedAmount: 5200,
    status: 'COMPLETED',
    driverId: 1,
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 43210',
    completedAt: '2026-08-16 20:15',
    createdAt: '2026-08-12',
  },
];

export let mockDrivers = [
  {
    id: 1,
    userId: 101,
    firstName: 'Vikram',
    lastName: 'Singh',
    name: 'Vikram Singh',
    email: 'driver@demo.com',
    phoneNumber: '+91 98765 43210',
    phone: '+91 98765 43210',
    role: 'ROLE_DRIVER',
    drivingLicenseNumber: 'MH-14-20210098234',
    licenseNumber: 'MH-14-20210098234',
    licenseExpiryDate: '2030-12-31',
    licenseExpiry: '2030-12-31',
    yearsOfExperience: 5,
    experienceYears: 5,
    willingToDrive: true,
    isEmailVerified: true,
    status: 'AVAILABLE',
    rating: 4.9,
    totalTrips: 42,
    ownerId: 1,
    ownerName: 'Apex Auto Rentals',
    createdAt: '2026-08-01T10:00:00',
  },
  {
    id: 2,
    userId: 102,
    firstName: 'Sanjay',
    lastName: 'Pawar',
    name: 'Sanjay Pawar',
    email: 'sanjay.driver@demo.com',
    phoneNumber: '+91 97654 12345',
    phone: '+91 97654 12345',
    role: 'ROLE_DRIVER',
    drivingLicenseNumber: 'MH-12-20220011029',
    licenseNumber: 'MH-12-20220011029',
    licenseExpiryDate: '2028-05-15',
    licenseExpiry: '2028-05-15',
    yearsOfExperience: 3,
    experienceYears: 3,
    willingToDrive: true,
    isEmailVerified: true,
    status: 'OFFLINE',
    rating: 4.8,
    totalTrips: 28,
    ownerId: 1,
    ownerName: 'Apex Auto Rentals',
    createdAt: '2026-08-05T10:00:00',
  },
  {
    id: 3,
    userId: 103,
    firstName: 'Amit',
    lastName: 'Jagtap',
    name: 'Amit Jagtap',
    email: 'amit.driver@demo.com',
    phoneNumber: '+91 98231 44556',
    phone: '+91 98231 44556',
    role: 'ROLE_DRIVER',
    drivingLicenseNumber: 'MH-09-20230055412',
    licenseNumber: 'MH-09-20230055412',
    licenseExpiryDate: '2029-08-20',
    licenseExpiry: '2029-08-20',
    yearsOfExperience: 4,
    experienceYears: 4,
    willingToDrive: true,
    isEmailVerified: true,
    status: 'AVAILABLE',
    rating: 4.7,
    totalTrips: 35,
    ownerId: 1,
    ownerName: 'Apex Auto Rentals',
    createdAt: '2026-08-10T10:00:00',
  },
  {
    id: 4,
    userId: 104,
    firstName: 'Rajesh',
    lastName: 'Ghadge',
    name: 'Rajesh Ghadge',
    email: 'rajesh.driver@demo.com',
    phoneNumber: '+91 98111 22334',
    phone: '+91 98111 22334',
    role: 'ROLE_DRIVER',
    drivingLicenseNumber: 'MH-12-20240099881',
    licenseNumber: 'MH-12-20240099881',
    licenseExpiryDate: '2031-10-15',
    licenseExpiry: '2031-10-15',
    yearsOfExperience: 2,
    experienceYears: 2,
    willingToDrive: true,
    status: 'PENDING',
    rating: 5.0,
    totalTrips: 0,
    ownerId: 1,
    ownerName: 'Apex Auto Rentals',
    createdAt: '2026-08-28T10:00:00',
  },
  {
    id: 5,
    userId: 105,
    firstName: 'Kiran',
    lastName: 'Desai',
    name: 'Kiran Desai',
    email: 'kiran.driver@demo.com',
    phoneNumber: '+91 98333 44555',
    phone: '+91 98333 44555',
    role: 'ROLE_DRIVER',
    drivingLicenseNumber: 'MH-12-20160044123',
    licenseNumber: 'MH-12-20160044123',
    licenseExpiryDate: '2026-08-15', // Expired license
    licenseExpiry: '2026-08-15',
    yearsOfExperience: 7,
    experienceYears: 7,
    willingToDrive: true,
    status: 'AVAILABLE',
    rating: 4.9,
    totalTrips: 64,
    ownerId: 1,
    ownerName: 'Apex Auto Rentals',
    createdAt: '2026-07-15T10:00:00',
  },
];

export let mockOwners = [
  { id: 1, name: 'Apex Auto Rentals', email: 'owner@demo.com', phone: '+91 98900 11223', city: 'Pune', fleetCount: 3, activePlan: 'Owner Pro Plan', createdAt: '2026-08-25', isApproved: true, status: 'APPROVED', subscriptionActive: true },
  { id: 2, name: 'Royal Car Rentals', email: 'royal@demo.com', phone: '+91 97654 88990', city: 'Kolhapur', fleetCount: 2, activePlan: 'Starter Owner Plan', createdAt: '2026-08-29', isApproved: false, status: 'PENDING_APPROVAL', subscriptionActive: true },
  { id: 3, name: 'GreenMobility India', email: 'green@demo.com', phone: '+91 99881 22334', city: 'Sangli', fleetCount: 1, activePlan: 'Enterprise Unlimited', createdAt: '2026-08-30', isApproved: true, status: 'APPROVED', subscriptionActive: true },
];

export let mockPlans = [
  {
    id: 1,
    name: 'Starter Owner Plan',
    price: '₹999 / mo',
    monthlyPrice: 999,
    annualPrice: 9999,
    maxVehicles: 3,
    commissionPercent: 12,
    description: 'Perfect for single car owners and rental hosts starting their car rental business.',
    features: [
      'List up to 3 Vehicles',
      'Standard Driver Matching',
      'Standard Email & In-App Support',
      'Customer Trip Notifications',
      'Basic Performance Analytics'
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: 2,
    name: 'Owner Pro Plan',
    price: '₹1,999 / mo',
    monthlyPrice: 1999,
    annualPrice: 19999,
    maxVehicles: 10,
    commissionPercent: 8,
    description: 'Recommended for growing vehicle owners and hosts with multiple vehicles and drivers.',
    features: [
      'List up to 10 Vehicles',
      'Priority Driver Matching & Dispatch',
      '24/7 Dedicated Support',
      'Advanced Vehicle Analytics & Reports',
      'Dual Role Owner-Driver Mode',
      'Featured Vehicle Listing in Search'
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: 3,
    name: 'Enterprise Unlimited',
    price: '₹3,999 / mo',
    monthlyPrice: 3999,
    annualPrice: 39999,
    maxVehicles: 999,
    commissionPercent: 4,
    description: 'Full-scale enterprise vehicle solution with custom branding and unlimited vehicle slots.',
    features: [
      'Unlimited Vehicle Registrations',
      '0% Additional Platform Surcharges',
      'Dedicated Account Manager & Telephony',
      'Custom API & GPS Integration',
      'Multi-City Cross-Border Dispatch',
      'Instant Payout Settlement'
    ],
    isPopular: false,
    isActive: true,
  },
];

export let mockCustomerProfile = {
  id: 1,
  firstName: 'Demo',
  lastName: 'Customer',
  name: 'Demo Customer',
  email: 'customer@demo.com',
  phoneNumber: '+91 98220 11223',
  phone: '+91 98220 11223',
  role: 'ROLE_CUSTOMER',
  city: 'Pune',
  address: 'Shivaji Nagar, Senapati Bapat Road, Pune, Maharashtra',
  postalCode: '411016',
  createdAt: '2026-08-01T10:00:00',
};

export let mockOwnerProfile = {
  name: 'Apex Auto Rentals (Owner)',
  businessName: 'Apex Auto Rentals Pvt Ltd',
  email: 'owner@demo.com',
  phone: '+91 98900 11223',
  city: 'Pune',
  address: 'Kalyani Nagar, Commercial Hub, Pune, Maharashtra 411006',
  gstNumber: '27AABCA1234F1Z8',
  panNumber: 'AABCA1234F',
  isApproved: true,
  status: 'APPROVED',
  licenseNumber: 'MH-12-2023009988',
  licenseExpiry: '2032-12-31',
  experienceYears: 6,
  wantsToDrive: true,
  emergencyContact: '+91 98900 99887 (Manager)',
};

export let mockOwnerSubscription = {
  plan: 'Owner Pro Plan',
  price: '₹1,999 / mo',
  status: 'ACTIVE',
  expiryDate: '2027-08-25',
  maxVehicles: 10,
  billingCycle: 'Monthly',
};

export let mockPlatformUsers = [
  {
    id: 1,
    email: 'customer@demo.com',
    firstName: 'Demo',
    lastName: 'Customer',
    name: 'Demo Customer',
    phoneNumber: '+91 98220 11223',
    role: 'ROLE_CUSTOMER',
    enabled: true,
    isActive: true,
    emailVerified: true,
    accountNonLocked: true,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    email: 'owner@demo.com',
    firstName: 'Apex',
    lastName: 'Auto Rentals',
    name: 'Apex Auto Rentals',
    phoneNumber: '+91 98900 11223',
    role: 'ROLE_OWNER',
    enabled: true,
    isActive: true,
    emailVerified: true,
    accountNonLocked: true,
    createdAt: '2026-08-15T12:00:00Z',
  },
  {
    id: 3,
    email: 'driver@demo.com',
    firstName: 'Vikram',
    lastName: 'Singh',
    name: 'Vikram Singh',
    phoneNumber: '+91 98765 43210',
    role: 'ROLE_DRIVER',
    enabled: true,
    isActive: true,
    emailVerified: true,
    accountNonLocked: true,
    createdAt: '2026-08-20T09:30:00Z',
  },
  {
    id: 4,
    email: 'admin@driveindia.in',
    firstName: 'Super',
    lastName: 'Admin',
    name: 'Super Admin',
    phoneNumber: '+91 98000 00001',
    role: 'ROLE_ADMIN',
    enabled: true,
    isActive: true,
    emailVerified: true,
    accountNonLocked: true,
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 5,
    email: 'rohit.sharma@example.com',
    firstName: 'Rohit',
    lastName: 'Sharma',
    name: 'Rohit Sharma',
    phoneNumber: '+91 98111 22334',
    role: 'ROLE_CUSTOMER',
    enabled: true,
    isActive: true,
    emailVerified: true,
    accountNonLocked: true,
    createdAt: '2026-08-25T14:20:00Z',
  },
  {
    id: 6,
    email: 'royal@demo.com',
    firstName: 'Royal',
    lastName: 'Car Rentals',
    name: 'Royal Car Rentals',
    phoneNumber: '+91 97654 88990',
    role: 'ROLE_OWNER',
    enabled: true,
    isActive: true,
    emailVerified: false,
    accountNonLocked: true,
    createdAt: '2026-08-29T16:00:00Z',
  },
];

export let mockDeletedAccounts = [
  {
    id: 101,
    userId: 101,
    fullName: 'Suresh Patil',
    email: 'suresh.patil@oldmail.com',
    mobileNumber: '+91 98222 33445',
    role: 'ROLE_CUSTOMER',
    deleteReason: 'Account deactivated by user request',
    deletedAt: '2026-09-10T11:45:00Z',
    deletedBy: 'Super Admin',
  },
  {
    id: 102,
    userId: 102,
    fullName: 'Anil Deshmukh (Former Driver)',
    email: 'anil.driver@oldmail.com',
    mobileNumber: '+91 98333 44556',
    role: 'ROLE_DRIVER',
    deleteReason: 'Inactivity / abandoned registration',
    deletedAt: '2026-09-12T15:20:00Z',
    deletedBy: 'Super Admin',
  },
];

export let mockAdminNotifications = [
  {
    id: 1,
    notificationType: 'VEHICLE_PENDING_APPROVAL',
    title: 'New Vehicle Registration',
    message: 'Mahindra Thar 4x4 submitted for approval by Royal Car Rentals.',
    referenceType: 'VEHICLE',
    referenceId: 2,
    isRead: false,
    readAt: null,
    createdAt: '2026-09-22T09:30:00Z',
  },
  {
    id: 2,
    notificationType: 'DRIVER_PENDING_APPROVAL',
    title: 'Driver KYC Document Uploaded',
    message: 'Commercial driver Ramesh Pawar uploaded police verification document.',
    referenceType: 'DRIVER',
    referenceId: 2,
    isRead: false,
    readAt: null,
    createdAt: '2026-09-22T11:15:00Z',
  },
  {
    id: 3,
    notificationType: 'OWNER_REGISTERED',
    title: 'New Host Onboarded',
    message: 'GreenMobility India registered with 1 electric vehicle.',
    referenceType: 'OWNER',
    referenceId: 3,
    isRead: true,
    readAt: '2026-09-22T14:00:00Z',
    createdAt: '2026-09-21T18:00:00Z',
  },
];

export const handleMockRequest = async (config) => {
  const { method, url, data: bodyData } = config;
  const parsedData = bodyData ? (typeof bodyData === 'string' ? JSON.parse(bodyData) : bodyData) : {};
  const lowerUrl = url.toLowerCase();

  await new Promise((res) => setTimeout(res, 80));

  // Auth Send OTP / Resend OTP
  if (lowerUrl.includes('/auth/send-otp') || lowerUrl.includes('/auth/resend-verification-otp')) {
    const email = (parsedData.email || 'customer@demo.com').toLowerCase();
    const phone = parsedData.phone || parsedData.phoneNumber || '';
    return {
      status: 200,
      data: {
        success: true,
        message: `OTP sent successfully to ${email}${phone ? ` and +91 ${phone}` : ''}`,
        otp: '123456',
        expiresInSeconds: 300,
      },
    };
  }

  // Auth Verify OTP / Verify Email
  if (lowerUrl.includes('/auth/verify-otp') || lowerUrl.includes('/auth/verify-email') || lowerUrl.includes('/auth/verify')) {
    const otp = parsedData.otp || parsedData.verificationCode || parsedData.code || parsedData.token;
    const regData = parsedData.registrationData || {};
    const email = (parsedData.email || regData?.email || 'customer@demo.com').toLowerCase();

    if (otp && otp !== '123456' && otp !== regData?.expectedOtp) {
      return {
        status: 400,
        data: { message: 'Invalid OTP code. Please enter the valid 6-digit code or use demo code 123456.' },
      };
    }

    let roles = regData?.roles || [regData?.role || 'ROLE_CUSTOMER'];
    if (regData?.role === 'ROLE_OWNER' && regData?.wantsToDrive) {
      roles = ['ROLE_OWNER', 'ROLE_DRIVER'];
    }
    const name = regData?.name || email.split('@')[0] || 'Demo Customer';

    // If verifying a driver's email, mark the driver as verified in mockDrivers
    const matchedDriverIdx = mockDrivers.findIndex(d => (d.email || '').toLowerCase() === email);
    if (matchedDriverIdx >= 0) {
      mockDrivers[matchedDriverIdx].isEmailVerified = true;
    }

    return {
      status: 200,
      data: {
        success: true,
        message: 'Email & OTP verified successfully!',
        data: {
          accessToken: `mock_jwt_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          user: {
            id: Date.now(),
            name,
            email,
            wantsToDrive: !!regData?.wantsToDrive,
            licenseNumber: regData?.licenseNumber || null,
            licenseExpiry: regData?.licenseExpiry || null,
            experienceYears: regData?.experienceYears || null,
          },
          roles,
        },
      },
    };
  }

  // Auth Forgot Password / Reset Password
  if (
    lowerUrl.includes('/auth/forgot-password') ||
    lowerUrl.includes('/auth/forgotpassword') ||
    lowerUrl.includes('/auth/password/forgot') ||
    lowerUrl.includes('/users/forgot-password') ||
    lowerUrl.includes('/user/forgot-password') ||
    lowerUrl.includes('/auth/request-password-reset') ||
    lowerUrl.includes('/auth/password-reset/request')
  ) {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Password reset code/token generated successfully.',
        token: '123456',
        resetToken: '123456',
        otp: '123456',
        data: {
          token: '123456',
          resetToken: '123456',
          otp: '123456',
        }
      },
    };
  }

  if (
    lowerUrl.includes('/auth/reset-password') ||
    lowerUrl.includes('/auth/resetpassword') ||
    lowerUrl.includes('/auth/password/reset') ||
    lowerUrl.includes('/auth/change-password') ||
    lowerUrl.includes('/auth/set-password') ||
    lowerUrl.includes('/users/reset-password') ||
    lowerUrl.includes('/user/reset-password') ||
    lowerUrl.includes('/auth/password-reset')
  ) {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Password reset successfully.',
      },
    };
  }

  // Auth Refresh Token
  if (
    lowerUrl.includes('/auth/refresh-token') ||
    lowerUrl.includes('/auth/refresh') ||
    lowerUrl.includes('/auth/token/refresh') ||
    lowerUrl.includes('/auth/refreshtoken')
  ) {
    const refreshedAccess = `mock_jwt_token_refreshed_${Date.now()}`;
    const refreshedRefresh = `mock_refresh_token_refreshed_${Date.now()}`;
    return {
      status: 200,
      data: {
        success: true,
        message: 'Token refreshed successfully',
        accessToken: refreshedAccess,
        refreshToken: refreshedRefresh,
        token: refreshedAccess,
        data: {
          accessToken: refreshedAccess,
          refreshToken: refreshedRefresh,
          token: refreshedAccess,
        },
      },
    };
  }

  // Auth Logout / Me
  if (lowerUrl.includes('/auth/logout')) {
    return { status: 200, data: { success: true, message: 'Logged out successfully' } };
  }
  if (lowerUrl.includes('/auth/me')) {
    return {
      status: 200,
      data: {
        id: 1,
        name: 'Demo User',
        email: 'customer@demo.com',
        roles: ['ROLE_CUSTOMER']
      }
    };
  }

  // Auth Login / Register / Signup
  if (lowerUrl.includes('/auth/login') || lowerUrl.includes('/auth/register') || lowerUrl.includes('/auth/signup') || lowerUrl.includes('/auth/verify-otp')) {
    const email = (parsedData.email || parsedData.registrationData?.email || 'customer@demo.com').toLowerCase();
    let selectedRole = parsedData.role || parsedData.registrationData?.role || null;
    if (lowerUrl.includes('/signup/owner')) selectedRole = 'ROLE_OWNER';
    if (lowerUrl.includes('/signup/customer')) selectedRole = 'ROLE_CUSTOMER';
    let roles = ['ROLE_CUSTOMER'];
    let name = parsedData.name || 'Demo User';

    if (selectedRole === 'ROLE_OWNER') {
      if (parsedData.wantsToDrive) {
        roles = ['ROLE_OWNER', 'ROLE_DRIVER'];
      } else {
        roles = ['ROLE_OWNER'];
      }
    } else if (selectedRole) {
      roles = [selectedRole];
    } else if (email.includes('owner')) {
      roles = ['ROLE_OWNER'];
      name = 'Apex Auto Owner';
    } else if (email.includes('driver')) {
      roles = ['ROLE_DRIVER'];
      name = 'Vikram Singh (Driver)';
    } else if (email.includes('admin')) {
      roles = ['ROLE_ADMIN'];
      name = 'Super Admin';
    } else if (email.includes('multi')) {
      roles = ['ROLE_OWNER', 'ROLE_DRIVER'];
      name = 'Apex Owner + Driver';
    }

    if (parsedData.wantsToDrive && parsedData.licenseNumber) {
      const existing = mockDrivers.find(d => d.email === email);
      if (!existing) {
        mockDrivers.push({
          id: Date.now(),
          name,
          email,
          phone: parsedData.phone || '+91 98765 00000',
          licenseNumber: parsedData.licenseNumber,
          licenseExpiry: parsedData.licenseExpiry || '2030-12-31',
          experienceYears: parsedData.experienceYears || '3',
          isApproved: true,
          status: 'APPROVED',
        });
      }
    }

    return {
      status: 200,
      data: {
        accessToken: `spec_jwt_token_${Date.now()}`,
        user: {
          id: 1,
          name,
          email,
          licenseNumber: parsedData.licenseNumber || null,
          licenseExpiry: parsedData.licenseExpiry || null,
          wantsToDrive: !!parsedData.wantsToDrive,
        },
        roles,
      },
    };
  }

  // Customer Vehicles - Strictly return ONLY approved AVAILABLE vehicles from APPROVED owners
  if (lowerUrl.includes('/customer/vehicles') || (lowerUrl.includes('/vehicles') && !lowerUrl.includes('/owner') && !lowerUrl.includes('/admin'))) {
    if (lowerUrl.match(/\/vehicles\/\d+/)) {
      const id = parseInt(url.split('/').pop());
      const v = mockVehicles.find((item) => item.id === id) || mockVehicles[0];
      return { status: 200, data: v };
    }

    // Extract query parameters
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const queryCity = (params.get('city') || '').toLowerCase();
    const querySeating = params.get('seatingCapacity') || '';
    const queryType = (params.get('vehicleType') || '').toLowerCase();
    const queryFuel = (params.get('fuelType') || '').toLowerCase();

    let availableOnly = mockVehicles.filter((v) => {
      const isVehApproved = (v.isApproved !== false && v.approvalStatus === 'APPROVED') && (v.status || 'AVAILABLE') === 'AVAILABLE';
      const owner = mockOwners.find((o) => o.name === v.ownerName);
      const isOwnerApproved = !owner || owner.isApproved !== false;
      return isVehApproved && isOwnerApproved;
    });

    if (queryCity) {
      availableOnly = availableOnly.filter((v) => (v.city || '').toLowerCase().includes(queryCity));
    }
    if (querySeating) {
      availableOnly = availableOnly.filter((v) => Number(v.seatingCapacity) === Number(querySeating));
    }
    if (queryType) {
      availableOnly = availableOnly.filter((v) => (v.vehicleType || '').toLowerCase() === queryType);
    }
    if (queryFuel) {
      availableOnly = availableOnly.filter((v) => (v.fuelType || '').toLowerCase() === queryFuel);
    }

    return { status: 200, data: availableOnly };
  }

  // Bookings
  if (lowerUrl.includes('/customer/bookings/history')) {
    return {
      status: 200,
      data: mockBookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status)),
    };
  }

  if (lowerUrl.includes('/customer/bookings')) {
    if (method === 'post') {
      const newBooking = {
        id: Date.now(),
        vehicleId: parsedData.vehicleId,
        vehicleName: 'Selected Vehicle',
        customerName: 'Customer',
        customerPhone: parsedData.customerPhone || '+91 98765 43210',
        startDate: parsedData.startDate,
        endDate: parsedData.endDate,
        pickupLocation: parsedData.pickupLocation,
        dropoffLocation: parsedData.dropoffLocation,
        tripType: parsedData.tripType || 'LOCAL',
        passengerCount: parsedData.passengerCount || 1,
        notes: parsedData.notes || '',
        status: 'PENDING',
        createdAt: new Date().toISOString().split('T')[0],
      };
      mockBookings.unshift(newBooking);
      return { status: 201, data: newBooking };
    }
    return {
      status: 200,
      data: mockBookings.filter((b) => ['PENDING', 'CONFIRMED'].includes(b.status)),
    };
  }

  // Customer Profile
  if (lowerUrl.includes('/customer/profile') || lowerUrl.includes('/customers/profile')) {
    if (method === 'delete') {
      return { status: 200, data: { success: true, message: 'Account deleted successfully' } };
    }
    if (method === 'put') {
      mockCustomerProfile = { ...mockCustomerProfile, ...parsedData };
      return { status: 200, data: mockCustomerProfile };
    }
    return { status: 200, data: mockCustomerProfile };
  }

  // Owner Profile
  if (lowerUrl.includes('/owner/profile') || lowerUrl.includes('/owners/profile')) {
    if (method === 'put') {
      const isReapplying =
        mockOwnerProfile.status === 'REJECTED' ||
        mockOwnerProfile.approvalStatus === 'REJECTED' ||
        parsedData.approvalStatus === 'PENDING' ||
        parsedData.approvalStatus === 'PENDING_APPROVAL' ||
        parsedData.reApply === true;

      mockOwnerProfile = {
        ...mockOwnerProfile,
        ...parsedData,
        status: isReapplying ? 'PENDING_APPROVAL' : (parsedData.status || mockOwnerProfile.status || 'APPROVED'),
        approvalStatus: isReapplying ? 'PENDING_APPROVAL' : (parsedData.approvalStatus || mockOwnerProfile.approvalStatus || 'APPROVED'),
        isApproved: isReapplying ? false : (mockOwnerProfile.isApproved ?? true),
        rejectionReason: isReapplying ? null : (parsedData.rejectionReason ?? mockOwnerProfile.rejectionReason),
      };

      // Also sync mockOwners list entry
      const ownerIdx = mockOwners.findIndex((o) => o.email === mockOwnerProfile.email || o.id === 1);
      if (ownerIdx >= 0) {
        mockOwners[ownerIdx] = {
          ...mockOwners[ownerIdx],
          name: mockOwnerProfile.name || mockOwnerProfile.businessName || mockOwners[ownerIdx].name,
          phone: mockOwnerProfile.phone || mockOwners[ownerIdx].phone,
          city: mockOwnerProfile.city || mockOwners[ownerIdx].city,
          status: mockOwnerProfile.status,
          approvalStatus: mockOwnerProfile.approvalStatus,
          isApproved: mockOwnerProfile.isApproved,
          rejectionReason: mockOwnerProfile.rejectionReason,
        };
      }

      return { status: 200, data: mockOwnerProfile };
    }
    return { status: 200, data: mockOwnerProfile };
  }

  // Owner Status & Subscription
  if (lowerUrl.includes('/owner/status') || lowerUrl.includes('/owners/status')) {
    return {
      status: 200,
      data: {
        approved: mockOwnerProfile.isApproved !== false && mockOwnerProfile.status !== 'PENDING_APPROVAL' && mockOwnerProfile.status !== 'REJECTED',
        status: mockOwnerProfile.status || 'APPROVED',
        approvalStatus: mockOwnerProfile.approvalStatus || mockOwnerProfile.status || 'APPROVED',
        rejectionReason: mockOwnerProfile.rejectionReason || null,
      },
    };
  }

  if (lowerUrl.includes('/owner/subscription/plans')) {
    return { status: 200, data: mockPlans.filter((p) => p.isActive) };
  }

  if (lowerUrl.includes('/owner/subscription')) {
    if (method === 'post' || method === 'put') {
      const selectedPlan = mockPlans.find(p => p.name === parsedData.plan) || {
        name: parsedData.plan || 'Owner Pro Plan',
        price: parsedData.price || '₹1,999 / mo',
        maxVehicles: parsedData.maxVehicles || 10,
      };

      mockOwnerSubscription = {
        ...mockOwnerSubscription,
        plan: selectedPlan.name,
        price: selectedPlan.price,
        maxVehicles: selectedPlan.maxVehicles,
        status: 'ACTIVE',
        expiryDate: parsedData.expiryDate || '2027-08-25',
        billingCycle: parsedData.billingCycle || 'Monthly',
      };

      return {
        status: 200,
        data: {
          success: true,
          ...mockOwnerSubscription,
          plans: mockPlans.filter((p) => p.isActive),
        },
      };
    }
    return {
      status: 200,
      data: {
        ...mockOwnerSubscription,
        currentVehiclesCount: mockVehicles.length,
        plans: mockPlans.filter((p) => p.isActive),
      },
    };
  }

  if (lowerUrl.includes('/owner/apply-driver')) {
    const newDriver = {
      id: Date.now(),
      name: parsedData.name || 'Owner Driver',
      email: parsedData.email || 'owner@demo.com',
      phone: parsedData.phone || '+91 98900 11223',
      licenseNumber: parsedData.licenseNumber || 'MH-12-2024001199',
      licenseExpiry: parsedData.licenseExpiry || '2030-12-31',
      experienceYears: parsedData.experienceYears || 5,
      isApproved: true,
      status: 'APPROVED',
      isOwnerDriver: true,
    };
    const existingIndex = mockDrivers.findIndex((d) => d.email === newDriver.email);
    if (existingIndex >= 0) {
      mockDrivers[existingIndex] = { ...mockDrivers[existingIndex], ...newDriver };
    } else {
      mockDrivers.push(newDriver);
    }
    return {
      status: 200,
      data: {
        success: true,
        roles: ['ROLE_OWNER', 'ROLE_DRIVER'],
        driverProfile: newDriver,
      },
    };
  }

  if (lowerUrl.includes('/owner/subscription')) {
    if (lowerUrl.includes('/plans')) {
      return { status: 200, data: mockPlans.filter(p => p.isActive !== false) };
    }
    if (method === 'delete') {
      mockOwnerSubscription = {
        plan: 'Starter Owner Plan',
        price: '₹999 / mo',
        status: 'ACTIVE',
        expiryDate: 'September 30, 2026',
        maxVehicles: 3,
        currentVehiclesCount: mockVehicles.filter(v => v.ownerName === 'Apex Auto Rentals').length,
        billingCycle: 'Monthly',
      };
      return { status: 200, data: mockOwnerSubscription };
    }
    if (method === 'post') {
      mockOwnerSubscription = {
        ...mockOwnerSubscription,
        ...parsedData,
        status: 'ACTIVE',
        expiryDate: 'August 25, 2027',
      };
      return { status: 200, data: mockOwnerSubscription };
    }
    return { status: 200, data: mockOwnerSubscription };
  }

  if (lowerUrl.includes('/owner/vehicles') || lowerUrl.includes('/owners/vehicles')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/(?:owner|owners)\/vehicles\/(\d+)/i);
    const vehicleId = matchId ? parseInt(matchId[1]) : null;

    // DELETE vehicle: e.g. /owner/vehicles/1
    if (method === 'delete' && vehicleId) {
      mockVehicles = mockVehicles.filter((v) => v.id !== vehicleId && v.vehicleId !== vehicleId);
      return { status: 200, data: { success: true, message: 'Vehicle deleted successfully' } };
    }

    // PUT update vehicle availability status: e.g. /owner/vehicles/1/status
    if (method === 'put' && (lowerUrl.includes('/status') || lowerUrl.includes('/availability')) && vehicleId) {
      const targetStatus = parsedData.status || parsedData.availability || 'AVAILABLE';
      const v = mockVehicles.find((item) => (item.id === vehicleId || item.vehicleId === vehicleId));
      if (v) {
        v.status = targetStatus;
      }
      return { status: 200, data: v || { id: vehicleId, status: targetStatus } };
    }

    // PUT update full vehicle details / re-submission: e.g. /owner/vehicles/1
    if (method === 'put' && vehicleId) {
      const index = mockVehicles.findIndex((item) => item.id === vehicleId || item.vehicleId === vehicleId);
      if (index >= 0) {
        const existing = mockVehicles[index];
        const isReapplying =
          existing.approvalStatus === 'REJECTED' ||
          existing.status === 'REJECTED' ||
          parsedData.approvalStatus === 'PENDING' ||
          parsedData.approvalStatus === 'PENDING_APPROVAL' ||
          parsedData.reApply === true;

        mockVehicles[index] = {
          ...existing,
          ...parsedData,
          id: vehicleId,
          vehicleId: vehicleId,
          vehicleNumber: parsedData.licensePlate || parsedData.vehicleNumber || existing.vehicleNumber,
          licensePlate: parsedData.licensePlate || parsedData.vehicleNumber || existing.licensePlate || existing.vehicleNumber,
          pricePerKm: Number(parsedData.pricePerKm) || existing.pricePerKm,
          ratePerKm: Number(parsedData.pricePerKm || parsedData.ratePerKm) || existing.ratePerKm || existing.pricePerKm,
          approvalStatus: isReapplying ? 'PENDING_APPROVAL' : (parsedData.approvalStatus || existing.approvalStatus || 'APPROVED'),
          isApproved: isReapplying ? false : (existing.isApproved ?? true),
          status: parsedData.status || (isReapplying ? 'AVAILABLE' : existing.status || 'AVAILABLE'),
          rejectionReason: isReapplying ? null : (parsedData.rejectionReason ?? existing.rejectionReason),
        };
        return { status: 200, data: mockVehicles[index] };
      }
    }

    if (method === 'post') {
      const newV = {
        id: Date.now(),
        vehicleId: Date.now(),
        ...parsedData,
        vehicleNumber: parsedData.licensePlate || parsedData.vehicleNumber || 'MH-12-NEW',
        licensePlate: parsedData.licensePlate || parsedData.vehicleNumber || 'MH-12-NEW',
        pricePerKm: Number(parsedData.pricePerKm) || 15,
        ratePerKm: Number(parsedData.pricePerKm || parsedData.ratePerKm) || 15,
        ownerName: parsedData.ownerName || 'Apex Auto Rentals',
        status: 'AVAILABLE',
        approvalStatus: 'PENDING_APPROVAL',
        isApproved: false,
        rejectionReason: null,
        acPricePerKm: parsedData.acPricePerKm || (parsedData.pricePerKm ? Number(parsedData.pricePerKm) + 3 : 20),
        images: parsedData.images || {
          front: parsedData.imageUrl || (Array.isArray(parsedData.imageUrls) && parsedData.imageUrls[0]) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
          back: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80',
          interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
        },
        rcFrontImage: parsedData.rcFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
        rcBackImage: parsedData.rcBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80',
        features: Array.isArray(parsedData.features) ? parsedData.features : [
          'GPS Live Tracking',
          'Air Conditioning',
          'Touchscreen Audio',
          'Power Windows',
        ],
      };
      mockVehicles.unshift(newV);
      return { status: 201, data: newV };
    }
    return { status: 200, data: [...mockVehicles] };
  }

  if (lowerUrl.includes('/owner/drivers') || lowerUrl.includes('/owners/drivers')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/(?:owner|owners)\/drivers\/(\d+)/i);
    const driverId = matchId ? parseInt(matchId[1]) : null;

    // PUT update existing driver
    if (method === 'put' && driverId) {
      const index = mockDrivers.findIndex((d) => d.id === driverId);
      if (index >= 0) {
        mockDrivers[index] = {
          ...mockDrivers[index],
          ...parsedData,
          id: driverId,
        };
        return { status: 200, data: mockDrivers[index] };
      }
    }

    // DELETE driver
    if (method === 'delete' && driverId) {
      mockDrivers = mockDrivers.filter((d) => d.id !== driverId);
      return { status: 200, data: { success: true, message: 'Driver removed successfully' } };
    }

    if (method === 'post') {
      const nameParts = (parsedData.name || '').trim().split(' ');
      const firstName = parsedData.firstName || nameParts[0] || 'Driver';
      const lastName = parsedData.lastName || nameParts.slice(1).join(' ') || '';
      const resolvedName = `${firstName} ${lastName}`.trim();

      const newD = {
        id: Date.now(),
        userId: Date.now(),
        name: resolvedName,
        firstName,
        lastName,
        email: parsedData.email || 'driver@example.com',
        phoneNumber: parsedData.phoneNumber || parsedData.phone || '+91 98765 43210',
        phone: parsedData.phoneNumber || parsedData.phone || '+91 98765 43210',
        licenseNumber: parsedData.licenseNumber || parsedData.drivingLicenseNumber || 'MH-12-NEW',
        drivingLicenseNumber: parsedData.drivingLicenseNumber || parsedData.licenseNumber || 'MH-12-NEW',
        licenseExpiryDate: parsedData.licenseExpiryDate || parsedData.licenseExpiry || '2032-12-31',
        licenseExpiry: parsedData.licenseExpiryDate || parsedData.licenseExpiry || '2032-12-31',
        experienceYears: Number(parsedData.experienceYears) || 3,
        isApproved: true,
        isEmailVerified: parsedData.isEmailVerified === true,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        availabilityStatus: 'ACTIVE',
        inactivityReason: '',
        profilePhoto: parsedData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        licenseFrontImage: parsedData.licenseFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        licenseBackImage: parsedData.licenseBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
        address: parsedData.address || 'Pune, Maharashtra',
        createdAt: new Date().toISOString(),
      };
      mockDrivers.unshift(newD);
      return { status: 201, data: newD };
    }
    return { status: 200, data: [...mockDrivers] };
  }

  if (lowerUrl.includes('/owner/bookings') || lowerUrl.includes('/owners/bookings')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/(?:owner|owners)\/bookings\/(\d+)/i);
    const bookingId = matchId ? parseInt(matchId[1]) : null;

    // Driver Assignment Endpoint (/owners/bookings/:id/assign-driver)
    if (lowerUrl.includes('/assign-driver') && bookingId) {
      const b = mockBookings.find((x) => x.id === bookingId);
      if (b) {
        const targetId = parseInt(parsedData.driverId);
        if (targetId === 999 || parsedData.useOwnerAsDriver) {
          b.driverId = 999;
          b.driverName = 'Owner (Self-Driven)';
          b.driverPhone = mockOwnerProfile.phoneNumber || mockOwnerProfile.phone || '+91 98900 11223';
          b.driverPhoneNumber = b.driverPhone;
        } else if (targetId) {
          const assignedDriver = mockDrivers.find(d => d.id === targetId || d.userId === targetId || d.driverId === targetId);
          if (assignedDriver) {
            b.driverId = assignedDriver.id || targetId;
            b.driverName = assignedDriver.name || `${assignedDriver.firstName || ''} ${assignedDriver.lastName || ''}`.trim() || 'Assigned Driver';
            b.driverPhone = assignedDriver.phoneNumber || assignedDriver.phone || '+91 98765 43210';
            b.driverPhoneNumber = b.driverPhone;
          } else {
            b.driverId = targetId;
            b.driverName = 'Assigned Driver';
          }
        }
        b.status = 'CONFIRMED';
        b.otp = b.otp || Math.floor(100000 + Math.random() * 900000).toString();
      }
      return { status: 200, data: b || { id: bookingId, status: 'CONFIRMED' } };
    }

    // Vehicle Replacement Endpoint (/owners/bookings/:id/replace-vehicle)
    if (lowerUrl.includes('/replace-vehicle') && bookingId) {
      const b = mockBookings.find((x) => x.id === bookingId);
      if (b) {
        const targetVehId = parseInt(parsedData.newVehicleId || parsedData.vehicleId || parsedData.effectiveVehicleId);
        const targetVehicle = mockVehicles.find(v => v.id === targetVehId);
        if (targetVehicle) {
          b.vehicleId = targetVehicle.id;
          b.vehicleName = `${targetVehicle.brand} ${targetVehicle.model}`;
          b.vehicleBrand = targetVehicle.brand;
          b.vehicleModel = targetVehicle.model;
          b.vehicleNumber = targetVehicle.licensePlate || targetVehicle.vehicleNumber;
          b.vehicleLicensePlate = targetVehicle.licensePlate || targetVehicle.vehicleNumber;
        }
        if (parsedData.reason) {
          b.reassignmentReason = parsedData.reason;
        }
      }
      return { status: 200, data: b || { id: bookingId } };
    }

    // Driver Replacement Endpoint (/owners/bookings/:id/replace-driver)
    if (lowerUrl.includes('/replace-driver') && bookingId) {
      const b = mockBookings.find((x) => x.id === bookingId);
      if (b) {
        const targetId = parseInt(parsedData.newDriverId || parsedData.driverId || parsedData.effectiveDriverId);
        if (targetId === 999) {
          b.driverId = 999;
          b.driverName = 'Owner (Self-Driven)';
          b.driverPhone = mockOwnerProfile.phoneNumber || mockOwnerProfile.phone || '+91 98900 11223';
          b.driverPhoneNumber = b.driverPhone;
        } else if (targetId) {
          const assignedDriver = mockDrivers.find(d => d.id === targetId || d.userId === targetId || d.driverId === targetId);
          if (assignedDriver) {
            b.driverId = assignedDriver.id || targetId;
            b.driverName = assignedDriver.name || `${assignedDriver.firstName || ''} ${assignedDriver.lastName || ''}`.trim() || 'Assigned Driver';
            b.driverPhone = assignedDriver.phoneNumber || assignedDriver.phone || '+91 98765 43210';
            b.driverPhoneNumber = b.driverPhone;
          } else {
            b.driverId = targetId;
            b.driverName = 'Assigned Driver';
          }
        }
        if (parsedData.reason) {
          b.reassignmentReason = parsedData.reason;
        }
      }
      return { status: 200, data: b || { id: bookingId } };
    }

    // Status Update Endpoint (/owners/bookings/:id/status)
    if (lowerUrl.includes('/status') && bookingId) {
      const b = mockBookings.find((x) => x.id === bookingId);
      const newStatus = parsedData.status || parsedData.bookingStatus || 'CONFIRMED';
      if (b) {
        b.status = newStatus;
        if (parsedData.driverId) {
          const targetId = parseInt(parsedData.driverId);
          if (targetId === 999 || parsedData.useOwnerAsDriver) {
            b.driverId = 999;
            b.driverName = 'Owner (Self-Driven)';
            b.driverPhone = mockOwnerProfile.phoneNumber || mockOwnerProfile.phone || '+91 98900 11223';
            b.driverPhoneNumber = b.driverPhone;
          } else {
            const assignedDriver = mockDrivers.find(d => d.id === targetId || d.userId === targetId || d.driverId === targetId);
            if (assignedDriver) {
              b.driverId = assignedDriver.id || targetId;
              b.driverName = assignedDriver.name || `${assignedDriver.firstName || ''} ${assignedDriver.lastName || ''}`.trim() || 'Assigned Driver';
              b.driverPhone = assignedDriver.phoneNumber || assignedDriver.phone || '+91 98765 43210';
              b.driverPhoneNumber = b.driverPhone;
            }
          }
        }
        if (parsedData.vehicleId) {
          const targetVehicle = mockVehicles.find(v => v.id === parseInt(parsedData.vehicleId));
          if (targetVehicle) {
            b.vehicleId = targetVehicle.id;
            b.vehicleName = `${targetVehicle.brand} ${targetVehicle.model}`;
            b.vehicleBrand = targetVehicle.brand;
            b.vehicleModel = targetVehicle.model;
            b.vehicleNumber = targetVehicle.licensePlate || targetVehicle.vehicleNumber;
          }
        }
        if (parsedData.reason || parsedData.rejectionReason) {
          b.rejectionReason = parsedData.rejectionReason || parsedData.reason;
        }
      }
      return { status: 200, data: b || { id: bookingId, status: newStatus } };
    }

    // Direct Get Single Booking
    if (bookingId && !lowerUrl.includes('/accept') && !lowerUrl.includes('/reject') && !lowerUrl.includes('/reassign')) {
      const b = mockBookings.find((x) => x.id === bookingId) || mockBookings[0];
      return { status: 200, data: b };
    }

    if (lowerUrl.includes('/accept')) {
      const idStr = url.split('/')[3];
      const b = mockBookings.find((x) => x.id === parseInt(idStr));
      if (b) {
        if (!parsedData.useOwnerAsDriver && parsedData.driverId) {
          const targetId = parseInt(parsedData.driverId);
          const assignedDriver = mockDrivers.find(d => d.id === targetId || d.userId === targetId || d.driverId === targetId);
          const isApproved = assignedDriver && assignedDriver.isApproved !== false && assignedDriver.approvalStatus !== 'REJECTED' && assignedDriver.approvalStatus !== 'PENDING';
          if (!assignedDriver || !isApproved) {
            return {
              status: 400,
              data: { message: 'Cannot assign unverified driver: Driver verification is currently pending Super Admin approval.' }
            };
          }
          if (assignedDriver.licenseExpiry && new Date(assignedDriver.licenseExpiry) < new Date()) {
            return {
              status: 400,
              data: { message: `Cannot assign driver: Driver license (${assignedDriver.licenseNumber}) expired on ${assignedDriver.licenseExpiry}. Driving suspended until renewed.` }
            };
          }
          if (assignedDriver.availabilityStatus === 'INACTIVE') {
            return {
              status: 400,
              data: { message: `Cannot assign driver: Driver is currently Off-Duty/Inactive (${assignedDriver.inactivityReason || 'Unavailable'}).` }
            };
          }
          b.driverId = assignedDriver.id || targetId;
          b.driverName = assignedDriver.name || `${assignedDriver.firstName || ''} ${assignedDriver.lastName || ''}`.trim();
          b.driverPhone = assignedDriver.phoneNumber || assignedDriver.phone;
          b.driverPhoneNumber = assignedDriver.phoneNumber || assignedDriver.phone;
        } else if (parsedData.useOwnerAsDriver || parsedData.driverId === 999) {
          b.driverId = 999;
          b.driverName = 'Owner (Self-Driven)';
          b.driverPhone = mockOwnerProfile.phoneNumber || mockOwnerProfile.phone || '+91 98900 11223';
          b.driverPhoneNumber = b.driverPhone;
        }
        b.status = 'CONFIRMED';
        b.otp = b.otp || Math.floor(100000 + Math.random() * 900000).toString();
      }
      return { status: 200, data: b };
    }

    if (lowerUrl.includes('/reassign')) {
      const idStr = url.split('/')[3];
      const b = mockBookings.find((x) => x.id === parseInt(idStr));
      if (!b) {
        return { status: 404, data: { message: 'Booking not found' } };
      }
      // Reassign Vehicle if provided
      if (parsedData.vehicleId) {
        const targetVehicle = mockVehicles.find(v => v.id === parseInt(parsedData.vehicleId));
        if (targetVehicle) {
          b.vehicleId = targetVehicle.id;
          b.vehicleName = `${targetVehicle.brand} ${targetVehicle.model}`;
          b.vehicleBrand = targetVehicle.brand;
          b.vehicleModel = targetVehicle.model;
          b.vehicleNumber = targetVehicle.licensePlate || targetVehicle.vehicleNumber;
          b.vehicleLicensePlate = targetVehicle.licensePlate || targetVehicle.vehicleNumber;
        }
      }
      // Reassign Driver if provided
      if (!parsedData.useOwnerAsDriver && parsedData.driverId && parsedData.driverId !== 999) {
        const targetId = parseInt(parsedData.driverId);
        const assignedDriver = mockDrivers.find(d => d.id === targetId || d.userId === targetId || d.driverId === targetId);
        const isApproved = assignedDriver && assignedDriver.isApproved !== false && assignedDriver.approvalStatus !== 'REJECTED' && assignedDriver.approvalStatus !== 'PENDING';
        if (!assignedDriver || !isApproved) {
          return {
            status: 400,
            data: { message: 'Cannot assign unverified driver: Driver verification is currently pending Super Admin approval.' }
          };
        }
        if (assignedDriver.licenseExpiry && new Date(assignedDriver.licenseExpiry) < new Date()) {
          return {
            status: 400,
            data: { message: `Cannot assign driver: Driver license (${assignedDriver.licenseNumber}) expired on ${assignedDriver.licenseExpiry}. Driving suspended until renewed.` }
          };
        }
        if (assignedDriver.availabilityStatus === 'INACTIVE') {
          return {
            status: 400,
            data: { message: `Cannot assign driver: Driver is currently Off-Duty/Inactive (${assignedDriver.inactivityReason || 'Unavailable'}).` }
          };
        }
        b.driverId = assignedDriver.id || targetId;
        b.driverName = assignedDriver.name || `${assignedDriver.firstName || ''} ${assignedDriver.lastName || ''}`.trim();
        b.driverPhone = assignedDriver.phoneNumber || assignedDriver.phone;
        b.driverPhoneNumber = assignedDriver.phoneNumber || assignedDriver.phone;
      } else if (parsedData.useOwnerAsDriver || parsedData.driverId === 999) {
        b.driverId = 999;
        b.driverName = 'Owner (Self-Driven)';
        b.driverPhone = mockOwnerProfile.phoneNumber || mockOwnerProfile.phone || '+91 98900 11223';
        b.driverPhoneNumber = b.driverPhone;
      }
      if (parsedData.reassignmentReason) {
        b.reassignmentReason = parsedData.reassignmentReason;
        b.reassignedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      }
      b.status = 'CONFIRMED';
      return { status: 200, data: b };
    }

    if (lowerUrl.includes('/reject')) {
      const idStr = url.split('/')[3];
      const b = mockBookings.find((x) => x.id === parseInt(idStr));
      if (b) {
        b.status = 'REJECTED';
        b.rejectionReason = parsedData.rejectionReason || 'Vehicle unavailable';
      }
      return { status: 200, data: b };
    }
    return { status: 200, data: mockBookings };
  }

  // Driver License Renewal Submission
  if (lowerUrl.includes('/driver/renew-license')) {
    const d = mockDrivers[0];
    if (d) {
      d.licenseExpiry = parsedData.licenseExpiry || d.licenseExpiry;
      if (parsedData.licenseFrontImage) d.licenseFrontImage = parsedData.licenseFrontImage;
      if (parsedData.licenseBackImage) d.licenseBackImage = parsedData.licenseBackImage;
      d.renewalApplicationNumber = parsedData.renewalApplicationNumber || `RTO-REN-${Date.now().toString().slice(-6)}`;
      d.lastRenewedAt = new Date().toISOString().split('T')[0];
    }
    return { status: 200, data: d };
  }

  // Driver Profile
  if (lowerUrl.includes('/driver/profile') || lowerUrl.includes('/drivers/profile')) {
    const d = mockDrivers[0] || {
      id: 1,
      name: 'Vikram Singh',
      email: 'driver@demo.com',
      phone: '+91 98765 43210',
      licenseNumber: 'MH-14-20210098234',
      licenseExpiry: '2030-12-31',
      experienceYears: 5,
      isApproved: true,
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      availabilityStatus: 'ACTIVE',
      inactivityReason: '',
      city: 'Pune',
      address: 'Kothrud, Pune, Maharashtra',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      licenseFrontImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
      licenseBackImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
    };
    if (method === 'put') {
      const isReapplying =
        d.status === 'REJECTED' ||
        d.approvalStatus === 'REJECTED' ||
        parsedData.approvalStatus === 'PENDING' ||
        parsedData.status === 'PENDING' ||
        parsedData.reApply === true;

      const updatedData = {
        ...parsedData,
        status: isReapplying ? 'PENDING' : (parsedData.status || d.status || 'AVAILABLE'),
        approvalStatus: isReapplying ? 'PENDING' : (parsedData.approvalStatus || d.approvalStatus || 'APPROVED'),
        isApproved: isReapplying ? false : (d.isApproved ?? true),
        rejectionReason: isReapplying ? null : (parsedData.rejectionReason ?? d.rejectionReason),
      };

      // License details are unchangeable only if fully approved and active
      if (d.isApproved && d.status === 'APPROVED' && !isReapplying) {
        updatedData.licenseNumber = d.licenseNumber;
      }
      Object.assign(d, updatedData);
      return { status: 200, data: d };
    }
    return { status: 200, data: d };
  }

  // Driver Availability & Status
  if (lowerUrl.includes('/driver/availability')) {
    const d = mockDrivers[0] || { id: 1, availabilityStatus: 'ACTIVE', inactivityReason: '' };
    if (method === 'put') {
      d.availabilityStatus = parsedData.availabilityStatus || parsedData.status || 'ACTIVE';
      d.inactivityReason = parsedData.inactivityReason || '';
      return { status: 200, data: d };
    }
    return { status: 200, data: d };
  }

  if (lowerUrl.includes('/driver/status')) {
    const currentDriver = mockDrivers[0] || { isApproved: true, status: 'APPROVED' };
    const isLicenseExpired = currentDriver.licenseExpiry ? new Date(currentDriver.licenseExpiry) < new Date() : false;
    return { 
      status: 200, 
      data: { 
        approved: currentDriver.isApproved !== false && currentDriver.status !== 'PENDING', 
        status: currentDriver.status || 'APPROVED',
        isLicenseExpired,
        licenseExpiry: currentDriver.licenseExpiry
      } 
    };
  }

  if (lowerUrl.includes('/driver/trips')) {
    const currentDriver = mockDrivers[0] || { isApproved: true, status: 'APPROVED' };
    const isApprovedDriver = currentDriver.isApproved !== false && currentDriver.status !== 'PENDING';
    const isLicenseExpired = currentDriver.licenseExpiry ? new Date(currentDriver.licenseExpiry) < new Date() : false;
    
    // SRS Compliance: Only verified drivers with valid non-expired license receive assigned trips
    if (!isApprovedDriver || isLicenseExpired) {
      return { status: 200, data: [] };
    }

    if (lowerUrl.includes('/start')) {
      if (isLicenseExpired) {
        return {
          status: 400,
          data: { message: `Cannot start trip: Driving license expired on ${currentDriver.licenseExpiry}. Driving suspended until renewed.` }
        };
      }
      const idStr = url.split('/')[3];
      const b = mockBookings.find((x) => x.id === parseInt(idStr));
      if (b) b.status = 'IN_PROGRESS';
      return { status: 200, data: b };
    }
    if (lowerUrl.includes('/end')) {
      const idStr = url.split('/')[3];
      const b = mockBookings.find((x) => x.id === parseInt(idStr));
      if (b) b.status = 'COMPLETED';
      return { status: 200, data: b };
    }
    return { status: 200, data: mockBookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)) };
  }

  if (lowerUrl.includes('/driver/history')) {
    return { status: 200, data: mockBookings.filter((b) => b.status === 'COMPLETED') };
  }

  // Admin Subscription Plans Management
  if (lowerUrl.includes('/admin/plans')) {
    if (method === 'post') {
      const newPlan = {
        id: Date.now(),
        name: parsedData.name || 'New Custom Plan',
        price: parsedData.price || `₹${parsedData.monthlyPrice || 1499} / mo`,
        monthlyPrice: Number(parsedData.monthlyPrice) || 1499,
        annualPrice: Number(parsedData.annualPrice) || 14999,
        maxVehicles: Number(parsedData.maxVehicles) || 5,
        commissionPercent: Number(parsedData.commissionPercent) || 10,
        description: parsedData.description || 'Custom owner subscription tier.',
        features: Array.isArray(parsedData.features) ? parsedData.features : [
          `List up to ${parsedData.maxVehicles || 5} Vehicles`,
          'Standard Driver Matching',
          'Admin Verified Protection',
        ],
        isPopular: !!parsedData.isPopular,
        isActive: parsedData.isActive !== false,
      };
      mockPlans.push(newPlan);
      return { status: 201, data: newPlan };
    }

    if (method === 'put') {
      const parts = url.split('/');
      const planId = parseInt(parts[parts.length - 1] || parts[parts.length - 2]);
      const index = mockPlans.findIndex(p => p.id === planId);
      if (index >= 0) {
        mockPlans[index] = { ...mockPlans[index], ...parsedData };
        return { status: 200, data: mockPlans[index] };
      }
    }

    if (method === 'delete') {
      const parts = url.split('/');
      const planId = parseInt(parts[parts.length - 1]);
      mockPlans = mockPlans.filter(p => p.id !== planId);
      return { status: 200, data: { success: true } };
    }

    return { status: 200, data: mockPlans };
  }

  // Admin All Owners View & Status Updates (GET/PATCH /api/v1/admin/owners)
  if ((lowerUrl.includes('/admin/owners') || lowerUrl.includes('/v1/admin/owners')) && !lowerUrl.includes('/approvals')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/owners\/(\d+)/i);
    const ownerId = matchId ? parseInt(matchId[1]) : null;

    if (method === 'patch' && ownerId) {
      let newStatus = 'APPROVED';
      let reason = '';
      try {
        const urlObj = new URL(url, 'http://localhost');
        newStatus = urlObj.searchParams.get('status') || parsedData?.status || 'APPROVED';
        reason = urlObj.searchParams.get('reason') || parsedData?.reason || '';
      } catch (e) {
        newStatus = parsedData?.status || 'APPROVED';
        reason = parsedData?.reason || '';
      }
      const o = mockOwners.find(item => item.id === ownerId || item.ownerId === ownerId || item.userId === ownerId);
      if (o) {
        o.status = newStatus;
        o.approvalStatus = newStatus;
        o.isActive = (newStatus === 'APPROVED');
        o.isApproved = (newStatus === 'APPROVED');
        o.rejectionReason = (newStatus === 'REJECTED') ? (reason || 'Rejected by administrator') : null;
      }
      return {
        status: 200,
        data: {
          success: true,
          message: 'Owner status updated successfully',
          data: o || { id: ownerId, status: newStatus }
        }
      };
    }

    const formattedOwners = mockOwners.map(o => ({
      ...o,
      ownerId: o.ownerId || o.id,
      userId: o.userId || o.id,
      fullName: o.fullName || o.name,
      email: o.email,
      mobileNumber: o.mobileNumber || o.phone,
      businessName: o.businessName || (o.name ? `${o.name}'s Fleet` : 'Owner Agency Fleet'),
      isActive: o.isActive !== undefined ? o.isActive : (o.isApproved === true || o.status === 'APPROVED'),
      createdAt: o.createdAt || new Date().toISOString()
    }));

    return { status: 200, data: formattedOwners };
  }

  // Admin All Drivers View (GET /api/v1/admin/drivers and PATCH /api/v1/admin/drivers/{id}/status)
  if ((lowerUrl.includes('/admin/drivers') || lowerUrl.includes('/v1/admin/drivers')) && !lowerUrl.includes('/approvals')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/drivers\/(\d+)/i);
    const driverId = matchId ? parseInt(matchId[1]) : null;

    if (method === 'patch' && driverId) {
      let newStatus = 'ACTIVE';
      try {
        const urlObj = new URL(url, 'http://localhost');
        newStatus = urlObj.searchParams.get('status') || parsedData?.status || 'ACTIVE';
      } catch (e) {
        newStatus = parsedData?.status || 'ACTIVE';
      }
      const d = mockDrivers.find(item => item.id === driverId || item.driverId === driverId || item.userId === driverId);
      if (d) {
        d.status = newStatus;
        d.operationalStatus = newStatus;
        d.isActive = newStatus === 'ACTIVE' || newStatus === 'AVAILABLE';
      }
      return {
        status: 200,
        data: {
          success: true,
          message: 'Driver status updated successfully',
          data: d || { id: driverId, status: newStatus }
        }
      };
    }

    const formattedDrivers = mockDrivers.map(d => ({
      driverId: d.id || d.driverId,
      userId: d.userId || d.id,
      fullName: d.fullName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
      email: d.email,
      mobileNumber: d.phoneNumber || d.phone || '+91 98765 43210',
      licenseNumber: d.licenseNumber || d.drivingLicenseNumber || 'MH-12-2024-DRV',
      licenseExpiryDate: d.licenseExpiryDate || d.licenseExpiry || '2030-12-31',
      approvalStatus: d.approvalStatus || (d.isApproved ? 'APPROVED' : 'PENDING'),
      operationalStatus: d.status || d.operationalStatus || 'AVAILABLE',
      managingOwnerName: d.ownerName || 'Apex Auto Rentals',
      managingOwnerEmail: d.ownerEmail || 'owner@demo.com',
      isOwnerDriver: Boolean(d.isOwnerDriver || d.id === 1),
      createdAt: d.createdAt || '2026-08-01T10:00:00'
    }));

    return { status: 200, data: formattedDrivers };
  }

  // Admin All Vehicles View
  if (lowerUrl.includes('/admin/vehicles')) {
    return { status: 200, data: mockVehicles };
  }

  // Admin Approvals Actions & Lists
  if (lowerUrl.includes('/admin/approvals/owners') || lowerUrl.includes('/admin/approvals/owner-drivers')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/(?:owners|owner-drivers)\/(\d+)/i);
    const ownerId = matchId ? parseInt(matchId[1]) : null;

    if (method === 'patch' || lowerUrl.includes('/approve') || lowerUrl.includes('/reject')) {
      const id = ownerId || (url.includes('/approve') ? parseInt(url.split('/')[4]) : null) || (url.includes('/reject') ? parseInt(url.split('/')[4]) : null) || 1;
      const decision = parsedData.decision || (lowerUrl.includes('/approve') ? 'APPROVED' : 'REJECTED');
      const reason = parsedData.reason || parsedData.rejectionReason || '';
      const o = mockOwners.find((item) => item.id === id || item.driverProfileId === id || item.userId === id);
      
      if (decision === 'APPROVED') {
        if (o) {
          o.isApproved = true;
          o.status = 'APPROVED';
          o.approvalStatus = 'APPROVED';
          o.rejectionReason = null;
        }
        if (id === 1 || o?.email === mockOwnerProfile.email) {
          mockOwnerProfile.isApproved = true;
          mockOwnerProfile.status = 'APPROVED';
          mockOwnerProfile.approvalStatus = 'APPROVED';
          mockOwnerProfile.rejectionReason = null;
        }
        return { status: 200, data: o || { id, isApproved: true, status: 'APPROVED', approvalStatus: 'APPROVED' } };
      } else {
        if (o) {
          o.isApproved = false;
          o.status = 'REJECTED';
          o.approvalStatus = 'REJECTED';
          o.rejectionReason = reason || 'Owner verification rejected';
        }
        if (id === 1 || o?.email === mockOwnerProfile.email) {
          mockOwnerProfile.isApproved = false;
          mockOwnerProfile.status = 'REJECTED';
          mockOwnerProfile.approvalStatus = 'REJECTED';
          mockOwnerProfile.rejectionReason = reason || 'Owner verification rejected';
        }
        return { status: 200, data: o || { id, isApproved: false, status: 'REJECTED', approvalStatus: 'REJECTED', rejectionReason: reason } };
      }
    }

    if (ownerId && !lowerUrl.includes('/pending')) {
      const o = mockOwners.find((item) => item.id === ownerId || item.driverProfileId === ownerId || item.userId === ownerId) || mockOwners[0];
      return {
        status: 200,
        data: {
          driverProfileId: o.driverProfileId || o.id,
          userId: o.userId || o.id,
          fullName: o.fullName || o.name,
          email: o.email,
          mobileNumber: o.mobileNumber || o.phone,
          businessName: o.businessName || (o.name ? `${o.name}'s Fleet` : 'Owner Agency Fleet'),
          licenseNumber: o.licenseNumber || o.drivingLicenseNumber || 'MH-12-2024-OWN',
          licenseExpiryDate: o.licenseExpiryDate || o.licenseExpiry || '2032-12-31',
          approvalStatus: o.approvalStatus || o.status || 'PENDING',
          rejectionReason: o.rejectionReason || null,
          documents: [
            { documentId: 1, documentType: 'COMMERCIAL_DRIVING_LICENSE', fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', isPrimary: true, uploadedAt: o.createdAt || new Date().toISOString() },
            { documentId: 2, documentType: 'AADHAAR_CARD', fileUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600', isPrimary: false, uploadedAt: o.createdAt || new Date().toISOString() },
          ],
          approvalHistory: o.approvalHistory || [
            { approvalId: 101, decision: 'SUBMITTED', reason: 'Initial application received for dual-role driving', decidedBy: 'System Auto-Ingest', decidedAt: o.createdAt || '2026-08-25T10:00:00Z' }
          ],
          createdAt: o.submittedAt || o.createdAt || new Date().toISOString(),
        }
      };
    }

    // Pending owner approvals list: ONLY show items with PENDING / PENDING_APPROVAL status (exclude REJECTED unless re-submitted)
    return {
      status: 200,
      data: mockOwners.filter((o) =>
        o.approvalStatus === 'PENDING' ||
        o.approvalStatus === 'PENDING_APPROVAL' ||
        o.status === 'PENDING' ||
        o.status === 'PENDING_APPROVAL' ||
        (o.isApproved === false && o.status !== 'REJECTED' && o.approvalStatus !== 'REJECTED')
      ).map((o) => ({
        ownerId: o.ownerId || o.id,
        driverProfileId: o.driverProfileId || o.id,
        userId: o.userId || o.id,
        fullName: o.fullName || o.name,
        name: o.name || o.fullName,
        email: o.email,
        mobileNumber: o.mobileNumber || o.phone,
        phone: o.phone || o.mobileNumber,
        businessName: o.businessName || (o.name ? `${o.name}'s Fleet` : 'Owner Agency Fleet'),
        licenseNumber: o.licenseNumber || o.drivingLicenseNumber || 'MH-12-2024-OWN',
        licenseExpiryDate: o.licenseExpiryDate || o.licenseExpiry || '2032-12-31',
        submittedAt: o.submittedAt || o.createdAt || new Date().toISOString(),
        approvalStatus: o.approvalStatus || o.status || 'PENDING',
        status: o.status || 'PENDING',
        isApproved: o.isApproved || false,
        isActive: o.isActive !== undefined ? o.isActive : (o.isApproved === true),
      })),
    };
  }

  if (lowerUrl.includes('/admin/approvals/drivers')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/drivers\/(\d+)/i);
    const driverId = matchId ? parseInt(matchId[1]) : null;

    if (method === 'patch' || lowerUrl.includes('/approve') || lowerUrl.includes('/reject')) {
      const id = driverId || (url.includes('/approve') ? parseInt(url.split('/')[4]) : null) || (url.includes('/reject') ? parseInt(url.split('/')[4]) : null) || 1;
      const decision = parsedData.decision || (lowerUrl.includes('/approve') ? 'APPROVED' : 'REJECTED');
      const reason = parsedData.reason || parsedData.rejectionReason || '';
      const d = mockDrivers.find((item) => item.id === id || item.userId === id);
      
      if (decision === 'APPROVED') {
        if (d) {
          d.isApproved = true;
          d.status = 'AVAILABLE';
          d.approvalStatus = 'APPROVED';
          d.rejectionReason = null;
        }
        return { status: 200, data: d || { id, isApproved: true, status: 'APPROVED', approvalStatus: 'APPROVED' } };
      } else {
        if (d) {
          d.isApproved = false;
          d.status = 'REJECTED';
          d.approvalStatus = 'REJECTED';
          d.rejectionReason = reason || 'Driver license verification rejected';
        }
        return { status: 200, data: d || { id, isApproved: false, status: 'REJECTED', approvalStatus: 'REJECTED', rejectionReason: reason } };
      }
    }

    if (driverId && !lowerUrl.includes('/pending')) {
      const d = mockDrivers.find((item) => item.id === driverId || item.userId === driverId) || mockDrivers[0];
      return {
        status: 200,
        data: {
          driverId: d.id,
          userId: d.userId || d.id,
          fullName: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
          email: d.email,
          mobileNumber: d.phone || d.phoneNumber,
          profilePhotoUrl: d.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          licenseNumber: d.licenseNumber || d.drivingLicenseNumber,
          licenseExpiryDate: d.licenseExpiry || d.licenseExpiryDate,
          approvalStatus: d.approvalStatus || d.status || 'PENDING',
          operationalStatus: d.status || 'AVAILABLE',
          rejectionReason: d.rejectionReason || null,
          ownerId: d.ownerId || 1,
          ownerName: d.ownerName || 'Apex Auto Rentals',
          documents: [
            { id: 1, type: 'DRIVING_LICENSE_FRONT', url: d.licenseFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', verified: true },
            { id: 2, type: 'DRIVING_LICENSE_BACK', url: d.licenseBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600', verified: true },
          ],
          approvalHistory: [],
          createdAt: d.createdAt || new Date().toISOString(),
        }
      };
    }

    // Pending driver approvals: ONLY show items with PENDING status (exclude REJECTED unless re-submitted)
    return {
      status: 200,
      data: mockDrivers.filter((d) =>
        d.approvalStatus === 'PENDING' ||
        d.approvalStatus === 'PENDING_APPROVAL' ||
        d.status === 'PENDING' ||
        d.status === 'PENDING_APPROVAL' ||
        (d.isApproved === false && d.status !== 'REJECTED' && d.approvalStatus !== 'REJECTED')
      ),
    };
  }

  if (lowerUrl.includes('/admin/approvals/vehicles')) {
    const cleanUrl = url.split('?')[0];
    const matchId = cleanUrl.match(/\/vehicles\/(\d+)/i);
    const vehicleId = matchId ? parseInt(matchId[1]) : null;

    if (method === 'patch' || lowerUrl.includes('/approve') || lowerUrl.includes('/reject')) {
      const id = vehicleId || (url.includes('/approve') ? parseInt(url.split('/')[4]) : null) || (url.includes('/reject') ? parseInt(url.split('/')[4]) : null) || 1;
      const decision = parsedData.decision || (lowerUrl.includes('/approve') ? 'APPROVED' : 'REJECTED');
      const reason = parsedData.reason || parsedData.rejectionReason || '';
      const v = mockVehicles.find((item) => item.id === id || item.vehicleId === id);
      
      if (decision === 'APPROVED') {
        if (v) {
          v.isApproved = true;
          v.approvalStatus = 'APPROVED';
          v.status = 'AVAILABLE';
          v.rejectionReason = null;
        }
        return { status: 200, data: v || { id, isApproved: true, approvalStatus: 'APPROVED', status: 'AVAILABLE' } };
      } else {
        if (v) {
          v.isApproved = false;
          v.approvalStatus = 'REJECTED';
          v.status = 'REJECTED';
          v.rejectionReason = reason || 'RC Document verification rejected';
        }
        return { status: 200, data: v || { id, isApproved: false, approvalStatus: 'REJECTED', status: 'REJECTED', rejectionReason: reason } };
      }
    }

    if (vehicleId && !lowerUrl.includes('/pending')) {
      const v = mockVehicles.find((item) => item.id === vehicleId || item.vehicleId === vehicleId) || mockVehicles[0];
      return {
        status: 200,
        data: {
          vehicleId: v.id || v.vehicleId,
          vehicleName: `${v.brand} ${v.model}`,
          vehicleNumber: v.vehicleNumber || v.licensePlate,
          brand: v.brand,
          model: v.model,
          vehicleType: v.vehicleType || 'SUV',
          modelYear: v.year || 2024,
          seatingCapacity: v.seatingCapacity || 5,
          fuelType: v.fuelType || 'DIESEL',
          registrationDate: '2024-01-15',
          ratePerKm: v.pricePerKm || v.ratePerKm || 18,
          acRatePerKm: v.acPricePerKm || 22,
          location: v.city || v.location || 'Pune',
          features: Array.isArray(v.features) ? v.features.join(', ') : 'AC, GPS Tracking, Dual Airbags',
          approvalStatus: v.approvalStatus || (v.isApproved ? 'APPROVED' : 'PENDING'),
          operationalStatus: v.status || 'AVAILABLE',
          rejectionReason: v.rejectionReason || null,
          ownerId: 1,
          ownerName: v.ownerName || 'Apex Auto Rentals',
          ownerEmail: 'owner@demo.com',
          ownerMobileNumber: '+91 98900 11223',
          ownerBusinessName: v.ownerName || 'Apex Auto Rentals Pvt Ltd',
          documents: [
            { id: 1, type: 'RC_BOOK_FRONT', url: v.rcFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', verified: true },
            { id: 2, type: 'RC_BOOK_BACK', url: v.rcBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600', verified: true },
          ],
          approvalHistory: [],
          createdAt: v.createdAt || new Date().toISOString(),
        }
      };
    }

    // Pending vehicle approvals: ONLY show items with PENDING / PENDING_APPROVAL status (exclude REJECTED unless re-submitted)
    return {
      status: 200,
      data: mockVehicles.filter((v) =>
        v.approvalStatus === 'PENDING' ||
        v.approvalStatus === 'PENDING_APPROVAL' ||
        v.status === 'PENDING' ||
        v.status === 'PENDING_APPROVAL' ||
        (v.isApproved === false && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED')
      ),
    };
  }

  // Admin Profile (/api/v1/admin/me, /api/admin/me)
  if (lowerUrl.includes('/admin/me') || lowerUrl.includes('/v1/admin/me')) {
    return {
      status: 200,
      data: {
        id: 4,
        email: 'admin@driveindia.in',
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ROLE_ADMIN',
        permissions: ['ALL'],
      },
    };
  }

  // Admin Deleted Accounts & Platform Recovery Governance
  if (lowerUrl.includes('/admin/accounts/deleted') || lowerUrl.includes('/v1/admin/accounts/deleted')) {
    return { status: 200, data: mockDeletedAccounts };
  }

  if (lowerUrl.includes('/admin/accounts') || lowerUrl.includes('/v1/admin/accounts')) {
    const cleanUrl = url.split('?')[0];
    const restoreMatch = cleanUrl.match(/\/accounts\/(\d+)\/restore/i);
    const permMatch = cleanUrl.match(/\/accounts\/(\d+)\/permanent/i);
    const deleteMatch = cleanUrl.match(/\/accounts\/(\d+)$/i);

    if (restoreMatch && method === 'patch') {
      const targetId = parseInt(restoreMatch[1]);
      const idx = mockDeletedAccounts.findIndex((a) => (a.userId || a.id) === targetId);
      if (idx !== -1) {
        const [restored] = mockDeletedAccounts.splice(idx, 1);
        const existing = mockPlatformUsers.find((u) => u.id === targetId);
        if (existing) {
          existing.enabled = true;
          existing.isActive = true;
          existing.accountNonLocked = true;
        } else {
          mockPlatformUsers.push({
            id: targetId,
            name: restored.fullName,
            email: restored.email,
            phoneNumber: restored.mobileNumber,
            role: restored.role || 'ROLE_CUSTOMER',
            enabled: true,
            isActive: true,
            emailVerified: true,
            accountNonLocked: true,
            createdAt: new Date().toISOString(),
          });
        }
      }
      return { status: 200, data: { success: true, message: 'Account restored successfully' } };
    }

    if (permMatch && method === 'delete') {
      const targetId = parseInt(permMatch[1]);
      const idx = mockDeletedAccounts.findIndex((a) => (a.userId || a.id) === targetId);
      if (idx !== -1) mockDeletedAccounts.splice(idx, 1);
      return { status: 200, data: { success: true, message: 'Account permanently purged from database' } };
    }

    if (deleteMatch && method === 'delete') {
      const targetId = parseInt(deleteMatch[1]);
      const uIdx = mockPlatformUsers.findIndex((u) => u.id === targetId);
      const reason = parsedData?.reason || 'Account deactivated by administrator';
      if (uIdx !== -1) {
        const [user] = mockPlatformUsers.splice(uIdx, 1);
        mockDeletedAccounts.push({
          id: user.id,
          userId: user.id,
          fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          mobileNumber: user.phoneNumber || user.phone || '+91 99999 88888',
          role: user.role,
          deleteReason: reason,
          deletedAt: new Date().toISOString(),
          deletedBy: 'Super Admin',
        });
      }
      return { status: 200, data: { success: true, message: 'Account deactivated and moved to deleted log' } };
    }
  }

  // Admin Platform Users Management (/api/v1/admin/users)
  if (lowerUrl.includes('/admin/users') || lowerUrl.includes('/v1/admin/users')) {
    const cleanUrl = url.split('?')[0];
    const statusMatch = cleanUrl.match(/\/users\/(\d+)\/status/i);
    const deleteMatch = cleanUrl.match(/\/users\/(\d+)$/i);

    if (statusMatch && method === 'patch') {
      const targetId = parseInt(statusMatch[1]);
      const user = mockPlatformUsers.find((u) => u.id === targetId);
      if (user) {
        Object.assign(user, parsedData);
      }
      return { status: 200, data: { success: true, user } };
    }

    if (deleteMatch && method === 'delete') {
      const targetId = parseInt(deleteMatch[1]);
      const idx = mockPlatformUsers.findIndex((u) => u.id === targetId);
      if (idx !== -1) {
        const [user] = mockPlatformUsers.splice(idx, 1);
        mockDeletedAccounts.push({
          id: user.id,
          userId: user.id,
          fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          mobileNumber: user.phoneNumber || user.phone || '+91 99999 88888',
          role: user.role,
          deleteReason: parsedData?.reason || 'Deleted by admin',
          deletedAt: new Date().toISOString(),
          deletedBy: 'Super Admin',
        });
      }
      return { status: 200, data: { success: true, message: 'User deleted' } };
    }

    return { status: 200, data: mockPlatformUsers };
  }

  // Admin Notifications (/api/v1/admin/notifications)
  if (lowerUrl.includes('/admin/notifications') || lowerUrl.includes('/v1/admin/notifications')) {
    if (lowerUrl.includes('/unread-count')) {
      const count = mockAdminNotifications.filter((n) => !n.isRead).length;
      return { status: 200, data: { unreadCount: count } };
    }

    if (lowerUrl.includes('/read-all') && method === 'patch') {
      mockAdminNotifications.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
      return { status: 200, data: { success: true, message: 'All notifications marked as read' } };
    }

    const matchRead = url.match(/\/notifications\/(\d+)\/read/i);
    if (matchRead && method === 'patch') {
      const notifId = parseInt(matchRead[1]);
      const notif = mockAdminNotifications.find((n) => n.id === notifId);
      if (notif) {
        notif.isRead = true;
        notif.readAt = new Date().toISOString();
      }
      return { status: 200, data: { success: true, message: 'Notification marked as read' } };
    }

    return {
      status: 200,
      data: {
        content: mockAdminNotifications,
        totalElements: mockAdminNotifications.length,
        totalPages: 1,
        pageNumber: 0,
        pageSize: 20,
      },
    };
  }

  // Admin Dashboard & Stats (/api/admin/dashboard, /api/admin/stats)
  if (lowerUrl.includes('/admin/dashboard') || lowerUrl.includes('/admin/stats')) {
    const pendingVehs = mockVehicles.filter((v) => v.approvalStatus === 'PENDING' || v.approvalStatus === 'PENDING_APPROVAL' || (v.isApproved === false && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED')).length;
    const pendingDrivs = mockDrivers.filter((d) => d.approvalStatus === 'PENDING' || d.approvalStatus === 'PENDING_APPROVAL' || d.status === 'PENDING' || (d.isApproved === false && d.status !== 'REJECTED' && d.approvalStatus !== 'REJECTED')).length;
    const pendingOwns = mockOwners.filter((o) => o.approvalStatus === 'PENDING' || o.approvalStatus === 'PENDING_APPROVAL' || o.status === 'PENDING' || (o.isApproved === false && o.status !== 'REJECTED' && o.approvalStatus !== 'REJECTED')).length;

    return {
      status: 200,
      data: {
        totalOwners: mockOwners.length,
        totalCustomers: 15,
        totalVehicles: mockVehicles.length,
        totalDrivers: mockDrivers.length,
        totalUsers: mockPlatformUsers.length,
        deletedAccounts: mockDeletedAccounts.length,
        activeVehicles: mockVehicles.filter((v) => v.status === 'AVAILABLE').length,
        inactiveVehicles: mockVehicles.filter((v) => v.status !== 'AVAILABLE').length,
        totalRevenue: 245000,
        pendingVehicleApprovals: pendingVehs,
        pendingDriverApprovals: pendingDrivs,
        pendingOwnerApprovals: pendingOwns,
        pendingOwnerDriverApprovals: pendingOwns,
        totalPendingApprovals: pendingVehs + pendingDrivs + pendingOwns,
        activeSubscriptions: mockPlans.length,
        expiredSubscriptions: 0,
        totalBookings: mockBookings.length,
        activeTrips: mockBookings.filter((b) => b.status === 'IN_PROGRESS').length,
        completedTrips: mockBookings.filter((b) => b.status === 'COMPLETED').length,
      },
    };
  }

  // Admin Pending Approvals (/api/admin/approvals)
  if (lowerUrl.includes('/admin/approvals')) {
    return {
      status: 200,
      data: {
        pendingOwners: mockOwners.filter((o) => o.approvalStatus === 'PENDING' || o.approvalStatus === 'PENDING_APPROVAL' || (o.isApproved === false && o.status !== 'REJECTED' && o.approvalStatus !== 'REJECTED')),
        pendingDrivers: mockDrivers.filter((d) => d.approvalStatus === 'PENDING' || d.approvalStatus === 'PENDING_APPROVAL' || (d.isApproved === false && d.status !== 'REJECTED' && d.approvalStatus !== 'REJECTED')),
        pendingVehicles: mockVehicles.filter((v) => v.approvalStatus === 'PENDING' || v.approvalStatus === 'PENDING_APPROVAL' || (v.isApproved === false && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED')),
      }
    };
  }

  // Notifications (/api/notifications)
  if (lowerUrl.includes('/notifications')) {
    if (lowerUrl.includes('/unread-count')) {
      return { status: 200, data: { unreadCount: 2 } };
    }
    return {
      status: 200,
      data: [
        { id: 1, title: 'Booking Confirmed', message: 'Your trip reservation has been verified and confirmed.', isRead: false, createdAt: '2026-09-02 10:30' },
        { id: 2, title: 'Driver Assigned', message: 'Verified commercial driver assigned to your trip.', isRead: false, createdAt: '2026-09-02 11:15' },
      ],
    };
  }

  // Customers Profile & Dashboard
  if (lowerUrl.includes('/customers/profile') || lowerUrl.includes('/customer/profile')) {
    return {
      status: 200,
      data: {
        id: 1,
        name: 'Demo Customer',
        email: 'customer@demo.com',
        phoneNumber: '+91 98220 11223',
        city: 'Pune',
        address: 'Kothrud, Pune, MH',
      },
    };
  }

  if (lowerUrl.includes('/customers/history')) {
    return {
      status: 200,
      data: mockBookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status)),
    };
  }

  if (lowerUrl.includes('/customers/dashboard')) {
    return {
      status: 200,
      data: {
        activeBookings: mockBookings.filter((b) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length,
        completedTrips: mockBookings.filter((b) => b.status === 'COMPLETED').length,
      },
    };
  }

  return { status: 200, data: [] };
};
