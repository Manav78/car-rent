import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  CheckSquare, 
  AlertTriangle, 
  Users, 
  Navigation, 
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import { getUser, getRoles } from '../../utils/authStorage';
import { extractList } from '../../api/axiosClient';
import StatusBadge from '../../components/ui/StatusBadge';

const OwnerDashboard = () => {
  const [user, setUser] = useState(() => getUser());
  const [userRoles, setUserRoles] = useState(() => getRoles());
  const [statusInfo, setStatusInfo] = useState({ approved: true, status: 'APPROVED' });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, vehiclesRes, driversRes, bookingsRes] = await Promise.allSettled([
        ownerApi.getOwnerStatus(),
        ownerApi.getVehicles(),
        ownerApi.getDrivers(),
        ownerApi.getBookings(),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        setStatusInfo(statusRes.value);
      }
      if (vehiclesRes.status === 'fulfilled') {
        setVehicles(extractList(vehiclesRes.value));
      }
      if (driversRes.status === 'fulfilled') {
        setDrivers(extractList(driversRes.value));
      }
      if (bookingsRes.status === 'fulfilled') {
        setBookings(extractList(bookingsRes.value));
      }
    } catch (err) {
      console.error('Error loading owner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleAuthChange = () => {
      setUser(getUser());
      setUserRoles(getRoles());
    };

    window.addEventListener('roleChange', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('roleChange', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const isOwnerApproved = statusInfo.approved || statusInfo.status === 'APPROVED';
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const completedTrips = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'TRIP_COMPLETED');
  const activeVehiclesCount = vehicles.filter((v) => (v.status || 'AVAILABLE') === 'AVAILABLE').length;
  const availableDriversCount = drivers.filter((d) => {
    const s = (d.status || d.availabilityStatus || 'ACTIVE').toUpperCase();
    return s === 'ACTIVE' || s === 'AVAILABLE';
  }).length;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-12">
      {/* Verification Gate Banner */}
      {!isOwnerApproved && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-900 dark:text-amber-300 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="block text-amber-900 dark:text-amber-200 font-bold">Owner Verification Pending</strong>
            <span className="text-amber-800 dark:text-amber-300/90">Your owner account is currently under review by Super Admin.</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner Operations Hub • Fleet &amp; Driver Dispatch 🇮🇳</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            {greeting}, {user?.name || 'Owner'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time overview of vehicle inventory, registered drivers, and customer booking requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/owner/vehicles"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Car className="w-4 h-4" />
            <span>Manage Vehicles</span>
          </Link>
          <Link
            to="/owner/drivers"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>My Drivers ({drivers.length})</span>
          </Link>
          <Link
            to="/owner/bookings"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Bookings ({pendingBookings.length})</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/owner/vehicles" className="bg-slate-900/80 hover:border-slate-700 border border-slate-800 rounded-3xl p-5 shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Vehicles</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{vehicles.length}</h3>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">{activeVehiclesCount} Available for Trips</p>
        </Link>

        <Link to="/owner/drivers" className="bg-slate-900/80 hover:border-slate-700 border border-slate-800 rounded-3xl p-5 shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Registered Drivers</span>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{drivers.length}</h3>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">{availableDriversCount} On-Duty Available</p>
        </Link>

        <Link to="/owner/bookings" className="bg-slate-900/80 hover:border-slate-700 border border-slate-800 rounded-3xl p-5 shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Requests</span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-300 mt-2">{pendingBookings.length}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Requires Owner Review</p>
        </Link>

        <Link to="/owner/bookings" className="bg-slate-900/80 hover:border-slate-700 border border-slate-800 rounded-3xl p-5 shadow-sm transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Completed Trips</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{completedTrips.length}</h3>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">Total Fulfilled Trips</p>
        </Link>
      </div>

      {/* Two-Column Grid: Recent Booking Requests & Vehicle Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Booking Requests */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-slate-100">Recent Booking Requests</h2>
            </div>
            <Link to="/owner/bookings" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View All ({bookings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 p-4 text-xs text-slate-400">
              No booking requests at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400">#{b.id}</span>
                      <strong className="text-slate-100">{b.vehicleName || 'Vehicle Reservation'}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Route: {b.pickupLocation} ➔ {b.dropoffLocation} • Dates: {b.startDate}
                    </p>
                    <p className="text-[11px] text-slate-400">Customer: {b.customerName} ({b.customerPhoneNumber || b.customerPhone || 'N/A'})</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Inventory Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-extrabold text-slate-100">Vehicle Inventory Overview</h2>
            </div>
            <Link to="/owner/vehicles" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>Manage Vehicles ({vehicles.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 p-4 text-xs text-slate-400">
              No vehicles registered yet. Click "Manage Vehicles" to add your cars.
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-800">
                      {v.imageUrl || (Array.isArray(v.imageUrls) && v.imageUrls[0]) ? (
                        <img src={v.imageUrl || v.imageUrls[0]} alt={v.model} className="h-full w-full object-cover" />
                      ) : (
                        <Car className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100">{v.brand} {v.model}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{v.licensePlate || v.vehicleNumber} • ₹{v.pricePerKm || v.ratePerKm}/KM</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                      v.status === 'AVAILABLE'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : v.status === 'MAINTENANCE'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {v.status || 'AVAILABLE'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
