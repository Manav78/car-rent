import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { getUser } from '../../utils/authStorage';
import StatusBadge from '../../components/ui/StatusBadge';

const CustomerDashboard = () => {
  const user = getUser();
  const [allBookings, setAllBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [availableVehiclesCount, setAvailableVehiclesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, vehiclesRes] = await Promise.allSettled([
          customerApi.getAllBookings(),
          customerApi.getAvailableVehicles({ status: 'AVAILABLE' }),
        ]);

        if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value)) {
          const list = bookingsRes.value;
          setAllBookings(list);
          const active = list.filter(
            (b) =>
              b.status === 'PENDING' ||
              b.status === 'ACCEPTED' ||
              b.status === 'CONFIRMED' ||
              b.status === 'IN_PROGRESS' ||
              b.status === 'TRIP_STARTED'
          );
          setActiveBookings(active);
        }

        if (vehiclesRes.status === 'fulfilled' && Array.isArray(vehiclesRes.value)) {
          const avail = vehiclesRes.value.filter((v) => (v.status || 'AVAILABLE') === 'AVAILABLE');
          setAvailableVehiclesCount(avail.length);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore 500+ Indian Destinations 🇮🇳</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
            Ready for your next journey, {user?.name || 'Explorer'}? 🚗
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Instant booking across Pune, Mumbai, Goa, Sangli & Kolhapur. Zero administrative waiting, direct car reservations & live driver tracking.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            to="/customer/vehicles"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 group"
          >
            <Zap className="w-4 h-4" />
            <span>Browse Available Cars</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Available Cars Metric */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cars Available Now</span>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">{loading ? '...' : availableVehiclesCount}</h3>
              <p className="text-xs text-slate-400 mt-1">Ready for instant trip booking</p>
            </div>
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Car className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Active Reservations Metric */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Reservations</span>
              <h3 className="text-3xl font-black text-indigo-400 mt-2">{loading ? '...' : activeBookings.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Pending approval & confirmed</p>
            </div>
            <div className="p-4 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Safety & Coverage Metric */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Safety & Insurance</span>
              <h3 className="text-sm font-bold text-slate-200 mt-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>100% Verified Vehicles</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">RC, Permits & Driver Licenses</p>
            </div>
            <div className="p-4 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Bookings Preview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-7 shadow-xl space-y-5 backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">Recent Trip Reservations</h2>
              <p className="text-xs text-slate-400">Track pending owner responses and trip schedules</p>
            </div>
          </div>

          <Link
            to="/customer/bookings"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading reservation status...</div>
        ) : activeBookings.length === 0 ? (
          <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-3">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No Active Reservations</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">You currently have no active trip requests. Choose an available car to create a booking.</p>
            <Link
              to="/customer/vehicles"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all mt-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Browse Available Vehicles</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.slice(0, 2).map((b) => (
              <div key={b.id} className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-100">{b.vehicleName || b.vehicleBrand || 'Vehicle Booking'}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{b.startDate} → {b.endDate}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pickup: <strong className="text-slate-300">{b.pickupLocation}</strong></span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
