import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Car, 
  Users, 
  CreditCard, 
  Sparkles, 
  Building,
  UserCheck,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalCustomers: 0,
    totalVehicles: 0,
    totalDrivers: 0,
    pendingVehicleApprovals: 0,
    pendingDriverApprovals: 0,
    pendingOwnerApprovals: 0,
    pendingOwnerDriverApprovals: 0,
    totalBookings: 0,
    activeTrips: 0,
    completedTrips: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, ownersRes, driversRes, vehiclesRes, pendingRes] = await Promise.allSettled([
          adminApi.getDashboardStats(),
          adminApi.getAllOwners(),
          adminApi.getAllDrivers(),
          adminApi.getAllVehicles(),
          adminApi.getPendingApprovals(),
        ]);

        const computed = {
          totalOwners: 0,
          totalCustomers: 0,
          totalVehicles: 0,
          totalDrivers: 0,
          pendingVehicleApprovals: 0,
          pendingDriverApprovals: 0,
          pendingOwnerApprovals: 0,
          pendingOwnerDriverApprovals: 0,
          totalBookings: 0,
          activeTrips: 0,
          completedTrips: 0,
        };

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          Object.assign(computed, statsRes.value);
        }
        if (ownersRes.status === 'fulfilled' && Array.isArray(ownersRes.value) && ownersRes.value.length > 0) {
          computed.totalOwners = ownersRes.value.length;
        }
        if (driversRes.status === 'fulfilled' && Array.isArray(driversRes.value) && driversRes.value.length > 0) {
          computed.totalDrivers = driversRes.value.length;
        }
        if (vehiclesRes.status === 'fulfilled' && Array.isArray(vehiclesRes.value) && vehiclesRes.value.length > 0) {
          computed.totalVehicles = vehiclesRes.value.length;
        }
        if (pendingRes.status === 'fulfilled' && pendingRes.value) {
          const p = pendingRes.value;
          if (Array.isArray(p.pendingVehicles)) computed.pendingVehicleApprovals = p.pendingVehicles.length;
          if (Array.isArray(p.pendingDrivers)) computed.pendingDriverApprovals = p.pendingDrivers.length;
          if (Array.isArray(p.pendingOwners)) {
            computed.pendingOwnerApprovals = p.pendingOwners.length;
            computed.pendingOwnerDriverApprovals = p.pendingOwners.length;
          }
        }

        setStats(computed);
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPendingApprovals = (stats.pendingVehicleApprovals || 0) + (stats.pendingDriverApprovals || 0) + (stats.pendingOwnerApprovals || 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Super Admin Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">System Dashboard & Management Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Govern registered vehicle owners, cars, subscription plans, and verification approval queues.
          </p>
        </div>

        <Link
          to="/admin/approvals"
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all inline-flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification Queue ({totalPendingApprovals})</span>
        </Link>
      </div>

      {/* Quick Action Hub: 6 Key Admin Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Link
          to="/admin/accounts"
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-3xl p-5 shadow-xl transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">User Governance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage users & restore deleted accounts</p>
          </div>
        </Link>

        <Link
          to="/admin/plans"
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">Subscription Plans</h3>
            <p className="text-xs text-slate-400 mt-0.5">Configure owner subscription tiers</p>
          </div>
        </Link>

        <Link
          to="/admin/owners"
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-5 shadow-xl transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">Vehicle Owners</h3>
            <p className="text-xs text-slate-400 mt-0.5">Inspect all registered vehicle owners</p>
          </div>
        </Link>

        <Link
          to="/admin/drivers"
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-5 shadow-xl transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">Platform Drivers</h3>
            <p className="text-xs text-slate-400 mt-0.5">Fleet drivers & dual-role owner-drivers</p>
          </div>
        </Link>

        <Link
          to="/admin/vehicles"
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 shadow-xl transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">All Vehicles</h3>
            <p className="text-xs text-slate-400 mt-0.5">Global repository of platform cars & specs</p>
          </div>
        </Link>

        <Link
          to="/admin/approvals"
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 shadow-xl transition-all group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">Approvals Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Review pending owners, drivers, & vehicles</p>
          </div>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link to="/admin/accounts" className="bg-slate-900/80 hover:border-rose-500/40 border border-slate-800 rounded-3xl p-4 shadow-sm transition-all block">
          <p className="text-xs font-medium text-slate-400">Total Platform Users</p>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{stats.totalUsers || (stats.totalOwners + stats.totalCustomers + stats.totalDrivers) || 0}</h3>
        </Link>

        <Link to="/admin/owners" className="bg-slate-900/80 hover:border-blue-500/40 border border-slate-800 rounded-3xl p-4 shadow-sm transition-all block">
          <p className="text-xs font-medium text-slate-400">Total Owners</p>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{stats.totalOwners}</h3>
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Customers</p>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{stats.totalCustomers}</h3>
        </div>

        <Link to="/admin/drivers" className="bg-slate-900/80 hover:border-purple-500/40 border border-slate-800 rounded-3xl p-4 shadow-sm transition-all block">
          <p className="text-xs font-medium text-slate-400">Total Drivers</p>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{stats.totalDrivers}</h3>
        </Link>

        <Link to="/admin/vehicles" className="bg-slate-900/80 hover:border-indigo-500/40 border border-slate-800 rounded-3xl p-4 shadow-sm transition-all block">
          <p className="text-xs font-medium text-slate-400">Total Vehicles</p>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">
            {stats.totalVehicles}{' '}
            {stats.activeVehicles !== undefined && stats.activeVehicles > 0 && (
              <span className="text-xs font-normal text-emerald-400">({stats.activeVehicles} active)</span>
            )}
          </h3>
        </Link>

        <Link to="/admin/accounts" className="bg-slate-900/80 hover:border-rose-500/40 border border-slate-800 rounded-3xl p-4 shadow-sm transition-all block">
          <p className="text-xs font-medium text-rose-400">Deleted Accounts Log</p>
          <h3 className="text-2xl font-extrabold text-rose-300 mt-1">{stats.deletedAccounts || 0}</h3>
        </Link>

        <Link to="/admin/approvals" className="bg-slate-900/80 hover:border-amber-500/40 border border-slate-800 rounded-3xl p-4 shadow-sm transition-all block">
          <p className="text-xs font-medium text-amber-400">Pending Approvals</p>
          <h3 className="text-2xl font-extrabold text-amber-300 mt-1">{totalPendingApprovals}</h3>
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-400">Total Bookings</p>
          <h3 className="text-2xl font-extrabold text-blue-300 mt-1">{stats.totalBookings || 0}</h3>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-medium text-purple-400">Active Trips / Bookings</p>
          <h3 className="text-2xl font-extrabold text-purple-300 mt-1">{stats.activeBookings || stats.activeTrips || 0}</h3>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-400">Platform Revenue</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
            {stats.totalRevenue !== undefined && stats.totalRevenue !== null ? `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}` : '₹0'}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
