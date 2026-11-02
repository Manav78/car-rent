# 🚗 DriveEase — Premium Car Rental & Cab Mobility Frontend

A modern, high-performance on-demand car rental and chauffeur mobility web application built with **React 19**, **Tailwind CSS v4**, and **Vite**. Inspired by the sleek, user-centric experiences of platforms like **Uber** and **Ola**, DriveEase provides an intuitive booking and fleet management interface for Customers, Vehicle Owners, Drivers, and Administrators.

---

## 🌟 Key Features

### 👤 1. Customer Experience (Ola / Uber Style)
- **Interactive Hero & Partitioned Showcase**: High-impact visuals highlighting vehicle categories (Prime Sedan, Executive SUV, Electric EV, Outstation 7-Seaters).
- **Search & Multi-Criteria Filtering**: Filter by City, Seating Capacity (4, 5, 7, 8+ seats), Fuel Type (Petrol, Diesel, EV, Hybrid), and Vehicle Type.
- **Transparent Fare Estimates**: Real-time rate calculation (₹/km rate, daily estimated fares, free cancellation guarantee).
- **Instant Booking & Modal Flow**: Streamlined itinerary booking (Pickup & Drop-off locations, dates, passenger count, notes).
- **Booking Management & Trip OTP**: Review active bookings, assigned driver details, trip-start OTPs, and booking cancellation.

### 🏢 2. Vehicle Owner Fleet Portal
- **Fleet Dashboard**: Real-time vehicle utilization, active rentals, and earnings metrics.
- **Vehicle Catalog Management**: Register new cars, edit specifications, upload multi-angle photos, and monitor admin approval status.
- **Driver Fleet Assignment**: Assign verified drivers to incoming booking requests or request replacements.
- **Booking Management**: Accept, reject, or manage ongoing car reservations.

### 🚖 3. Driver Operations Hub
- **Availability Toggle**: Instant 1-click toggle between Active (On-Duty) and Inactive (Off-Duty Rest).
- **Trip Lifecycle Management**: View assigned trips, customer pickup locations, and transition trip statuses (Start Trip with OTP, Complete Trip).
- **Driver Profile**: Manage license details and view completed trip logs.

### 🛡️ 4. Super Admin Management Console
- **Approval Queues**: Review and approve/reject pending vehicles, drivers, and owner-driver applications with custom notes.
- **User Governance**: Activate, suspend, or manage platform accounts across all roles.
- **System Metrics**: Real-time counts of users, bookings, total revenue, and active fleet vehicles.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) |
| **Routing** | React Router DOM v7 (`react-router-dom`) |
| **Styling & Theme** | Tailwind CSS v4 (`@tailwindcss/vite`), Custom High-Contrast Dark/Light Themes |
| **Icons** | Lucide React (`lucide-react`) |
| **HTTP & State** | Axios (`axios`), Custom SWR Cache & Automatic Token Refresh Interceptor |
| **Build & Tooling** | Vite v8, Oxlint |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm** / **yarn**

### 1. Installation
Navigate to the frontend directory and install dependencies:

```bash
cd "D:\Kalibytes\car rental\Car Rental Application"
npm install
```

### 2. Environment Configuration
Create or review the `.env` file in the root of the frontend project:

```properties
# Backend REST API Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# Standalone / Mock fallback mode:
# Set to "false" to connect to your live Spring Boot backend server
# Set to "true" to test in offline standalone demo mode
VITE_USE_MOCK=false
```

### 3. Running the Development Server
Start the Vite local development server:

```bash
npm run dev
```

The application will be live at:
👉 **`http://localhost:5173`**

### 4. Production Build
Generate an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🔐 Default Demo Accounts

If running with the seeded backend database or in standalone demo mode, you can log in with:

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@carrental.com` | `Password@123` |
| **Vehicle Owner** | `owner@carrental.com` | `Password@123` |
| **Verified Driver** | `driver@carrental.com` | `Password@123` |
| **Super Admin** | `admin@carrental.com` | `Admin@123` |

---

## 📡 API Integration & Resilience
- **Dual Endpoint Mapping**: Supports direct Spring Boot REST routes (`/api/auth/*`, `/api/vehicles/*`, `/api/bookings/*`, etc.) with route fallback safety.
- **Silent JWT Token Refresh**: Automatically intercepts HTTP 401 responses, executes token refresh against the backend, and retries queued requests without logging out the user.
- **Tag-based SWR Caching**: Intelligent cache invalidation upon mutations (e.g. creating a booking immediately invalidates the booking and dashboard caches).
