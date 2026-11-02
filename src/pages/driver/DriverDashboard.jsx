import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, MapPin, AlertTriangle, ShieldCheck, PlayCircle, User, Award, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { driverApi } from '../../api/driverApi';
import { getUser } from '../../utils/authStorage';

const DriverDashboard = () => {
  const user = getUser();
  const [statusInfo, setStatusInfo] = useState({ approved: false, status: 'PENDING' });
  const [driverProfile, setDriverProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statusRes, tripsRes, profileRes] = await Promise.allSettled([
          driverApi.getDriverStatus(),
          driverApi.getAssignedTrips(),
          driverApi.getProfile(),
        ]);

        if (statusRes.status === 'fulfilled' && statusRes.value) {
          setStatusInfo(statusRes.value);
        } else {
          setStatusInfo({ approved: user?.isApproved ?? true, status: user?.status || 'APPROVED' });
        }

        if (tripsRes.status === 'fulfilled' && Array.isArray(tripsRes.value)) {
          setTrips(tripsRes.value);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setDriverProfile(profileRes.value);
        }
      } catch (err) {
        console.error('Error loading driver dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rawStatus = (driverProfile?.status || driverProfile?.availabilityStatus || user?.status || 'ACTIVE').toUpperCase();
  const isOffDuty = rawStatus === 'INACTIVE' || rawStatus === 'OFFLINE';
  const isDriverApproved = statusInfo.approved || statusInfo.status === 'APPROVED' || (rawStatus !== 'PENDING' && rawStatus !== 'REJECTED');
  
  // Trip counts: only CONFIRMED and IN_PROGRESS are active
  const activeTrips = trips.filter(
    (t) => t.status === 'CONFIRMED' || t.status === 'IN_PROGRESS' || t.status === 'TRIP_STARTED'
  );
  const completedTrips = trips.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'TRIP_COMPLETED'
  );
  
  // Expiry check
  const isLicenseExpired = driverProfile?.licenseExpiry ? new Date(driverProfile.licenseExpiry) < new Date() : false;
  const daysToExpiry = driverProfile?.licenseExpiry 
    ? Math.ceil((new Date(driverProfile.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)) 
    : 999;
  const isExpiringSoon = !isLicenseExpired && daysToExpiry <= 30 && daysToExpiry > 0;

  return (
    <div className="space-y-6">
      {/* License Expired Alert Banner */}
      {isLicenseExpired && (
        <div className="p-5 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-rose-900 dark:text-rose-200 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 mt-0.5">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider">
                  DRIVING SUSPENDED
                </span>
                <h3 className="text-base font-extrabold text-rose-700 dark:text-rose-100">
                  Driving License Expired ({driverProfile.licenseExpiry})
                </h3>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
                Your driving license has expired. You cannot be assigned trips or start journeys until you upload and submit your renewed license copy.
              </p>
            </div>
          </div>
          <Link
            to="/driver/profile"
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Upload Renewed License</span>
          </Link>
        </div>
      )}

      {/* Expiring Soon Banner */}
      {isExpiringSoon && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-amber-900 dark:text-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Driving License Expiring Soon ({daysToExpiry} Days Remaining)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
                Your license expires on {driverProfile.licenseExpiry}. Renew and update your license copy on your profile before expiry to avoid trip dispatch suspension.
              </p>
            </div>
          </div>
          <Link
            to="/driver/profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
          >
            Renew on Profile
          </Link>
        </div>
      )}

      {/* Approval Status Banner */}
      {!isDriverApproved && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-amber-900 dark:text-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Driver Verification Pending</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
                Your Driver profile & license credentials are currently being reviewed by Super Admin.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold whitespace-nowrap">
            Status: {statusInfo.status || 'PENDING'}
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              Driver Command Console
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                !isOffDuty
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              {!isOffDuty ? '🟢 On Duty / Active' : '⏸️ Off Duty (Inactive)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Welcome back, {driverProfile?.name || user?.name || 'Driver'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access assigned customer trips, check driving license credentials, and manage live trip statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/driver/profile"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-2"
          >
            <User className="w-4 h-4 text-purple-400" />
            <span>Driver Profile & Details</span>
          </Link>

          <Link
            to="/driver/trips"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Active Trips ({activeTrips.length})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Assigned Active Trips</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{activeTrips.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{completedTrips.length} completed in history</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <PlayCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Driver License Status</p>
              <h3 className="text-sm font-bold text-slate-200 mt-1">
                {isLicenseExpired ? '⛔ License Expired' : isDriverApproved ? 'Verified & Active' : 'Pending Verification'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Exp: {driverProfile?.licenseExpiry || 'Valid'}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Live Duty Status</p>
              <h3 className={`text-sm font-bold mt-1 ${!isOffDuty ? 'text-emerald-400' : 'text-amber-400'}`}>
                {!isOffDuty ? '🟢 On Duty (Available)' : '⏸️ Off Duty (Inactive)'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{!isOffDuty ? 'Ready for new assignments' : (driverProfile?.inactivityReason || 'Unavailable')}</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
