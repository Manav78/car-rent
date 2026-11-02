# DriveEase — On-Demand Car Rental & Mobility Platform

A production-grade, human-crafted mobility web application built with **React 19**, **Tailwind CSS v4**, and **Vite**, engineered to connect to a **Spring Boot 3** REST backend. Inspired by tier-1 mobility platforms (Uber, Ola, Turo), DriveEase delivers an intuitive, utility-first rental and chauffeur booking interface for Customers, Vehicle Owners, Chauffeurs, and Administrators.

---

## Design System & The Science of Mobility

Modern automotive and transit interfaces demand immediate wayfinding, high outdoor contrast, and functional clarity:

- **Canvas & Grounding**: Deep Asphalt Onyx (`#09090b`) and Architectural Slate (`#f8fafc`). Provides road-grounded authority and maximum visual contrast under bright sunlight or dark environments.
- **Signal Wayfinding Accent**: Signal Amber (`#f59e0b` / `#d97706`). Derived from automotive transit science (headway lamps, warning indicators, turn signals) for warm, focused call-to-actions without alarmist red.
- **Verification & Status**: Precision Emerald (`#10b981`). Used for certified safety ratings, verified vehicle status, zero deposit guarantees, and instant booking confirmations.
- **Human Typography & Spacing**: Strict 4px/8px modular rhythm, tight tracking (-0.025em), zero rainbow gradients, zero floating emoji clutter, and zero artificial glow halos.

---

## Key Modules & Capabilities

### 1. Customer Booking Console
- **Ride Intent Switcher**: Single-click toggling between **Self-Drive Rental**, **Chauffeur Drive**, and **Intercity Outstation** corridors.
- **Connected Search Matrix**: Direct pickup and drop-off inputs with quick-select transit hubs (Airports, Railway terminals, Business districts), return date pickers, and dynamic duration calculations.
- **Fleet Catalog & Real-Time Filters**: Instant classification by SUVs & 4x4, Executive Sedans, Luxury AMG, 7-Seater Family Wagons, and Eco EVs.
- **Transparent Tariff Cards**: Direct per-km rates (`₹/km`), estimated daily package rates, luggage capacity, NCAP safety ratings, and instant reservation.
- **In-Context Booking Flow**: Frictionless modal authentication for guests without losing vehicle selection state.

### 2. Fleet Owner Portal
- **Fleet Performance**: Real-time vehicle utilization metrics, revenue tracking, and active rental status.
- **Vehicle Catalog Management**: Register new fleet vehicles, edit specifications, upload photos, and track administrative compliance status.
- **Driver Allocation**: Assign verified chauffeurs to customer itineraries or execute driver replacements.
- **Booking Management**: Confirm, reject, or reassign incoming rental requests.

### 3. Chauffeur Operations Hub
- **Duty Availability**: Instant toggle between Active (On-Duty) and Inactive (Off-Duty Rest).
- **Assigned Itineraries**: Real-time view of customer pickup hubs, travel destinations, passenger manifests, and route notes.
- **Trip Lifecycle**: Transition ride stages from dispatch to trip completion with verified OTP verification.

### 4. Enterprise Administration Console
- **Compliance & Approval Queues**: Review and approve/reject pending vehicle entries, commercial drivers, and fleet owners.
- **User Governance**: Audit, activate, or soft-delete user accounts across all roles.
- **Real-Time Analytics**: Monitor active fleet count, gross rental revenue, and booking conversion.

---

## Technology Architecture

| Layer | Stack |
|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) |
| **Routing** | React Router DOM v7 (`react-router-dom`) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`), Custom Mobility Utility Classes |
| **Icons** | Lucide React (`lucide-react`) |
| **HTTP Client** | Axios (`axios`) with automatic JWT refresh and unified ApiResponse unwrapping |
| **Build & Tooling** | Vite v8, Oxlint |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**

### 1. Installation
Navigate to the frontend workspace directory and install dependencies:

```bash
cd "D:\Kalibytes\car rental\Car Rental Application"
npm install
```

### 2. Environment Configuration
Review `.env` in the root of the frontend project:

```properties
# Spring Boot Backend API Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# Connect to live backend (false) or test in offline standalone demo mode (true)
VITE_USE_MOCK=false
```

### 3. Development Server
Start the Vite local development server:

```bash
npm run dev
```

Access the application in your browser:
**`http://localhost:5173`**

### 4. Production Build
Verify compilation and produce an optimized distribution build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Default Seed Accounts

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@carrental.com` | `Password@123` |
| **Fleet Owner** | `owner@carrental.com` | `Password@123` |
| **Chauffeur** | `driver@carrental.com` | `Password@123` |
| **System Admin** | `admin@carrental.com` | `Admin@123` |

---

## Git Workflow & Repository Structure

The complete solution is hosted at [https://github.com/Manav78/car-rent.git](https://github.com/Manav78/car-rent.git).

- **`main`**: Full-stack codebase with the Spring Boot backend service and documentation.
- **`backend`**: Dedicated backend branch containing the complete Java 21 / Spring Boot 3 enterprise service.
- **`frontend`**: Dedicated frontend branch containing the React 19 / Vite mobility application.
