import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Save, 
  Calendar, 
  Award, 
  Lock, 
  RefreshCw, 
  AlertOctagon, 
  AlertTriangle,
  Building,
  Hash,
  FileCheck
} from 'lucide-react';
import { driverApi } from '../../api/driverApi';
import { getUser, updateUserAndRoles } from '../../utils/authStorage';
import { useToast } from '../../context/ToastContext';

const DriverProfile = () => {
  const { showToast } = useToast();
  const authUser = getUser() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  // Status & Counts
  const [statusInfo, setStatusInfo] = useState({ approved: true, status: 'APPROVED' });
  const [tripsCount, setTripsCount] = useState(0);

  // Renewal Modal State
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalExpiryDate, setRenewalExpiryDate] = useState('');

  // Driver Profile matching DriverResponse.java / DriverProfile.java
  const [driverProfile, setDriverProfile] = useState({
    id: null,
    userId: null,
    firstName: authUser?.firstName || authUser?.name?.split(' ')[0] || '',
    lastName: authUser?.lastName || authUser?.name?.split(' ').slice(1).join(' ') || '',
    email: authUser?.email || '',
    phoneNumber: authUser?.phoneNumber || authUser?.phone || '',
    drivingLicenseNumber: authUser?.drivingLicenseNumber || authUser?.licenseNumber || '',
    licenseExpiryDate: authUser?.licenseExpiryDate || authUser?.licenseExpiry || '',
    willingToDrive: authUser?.willingToDrive ?? true,
    status: authUser?.status || 'AVAILABLE', // PENDING, APPROVED, AVAILABLE, ON_TRIP, OFFLINE, REJECTED
    approvalStatus: authUser?.approvalStatus || 'APPROVED',
    totalTrips: authUser?.totalTrips || 0,
    ownerId: authUser?.ownerId || null,
    ownerName: authUser?.ownerName || '',
    createdAt: authUser?.createdAt || '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, tripsRes] = await Promise.allSettled([
        driverApi.getProfile(),
        driverApi.getAssignedTrips(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const p = profileRes.value;
        const fName = p.firstName || (p.name ? p.name.split(' ')[0] : '') || driverProfile.firstName;
        const lName = p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : '') || driverProfile.lastName;
        const licenseNo = p.drivingLicenseNumber || p.licenseNumber || driverProfile.drivingLicenseNumber;
        const expDate = p.licenseExpiryDate || p.licenseExpiry || driverProfile.licenseExpiryDate;

        setDriverProfile((prev) => ({
          ...prev,
          ...p,
          firstName: fName,
          lastName: lName,
          phoneNumber: p.phoneNumber || p.phone || prev.phoneNumber,
          drivingLicenseNumber: licenseNo,
          licenseExpiryDate: expDate,
          status: p.status || prev.status,
          approvalStatus: p.approvalStatus || prev.approvalStatus,
          totalTrips: p.totalTrips !== undefined ? p.totalTrips : prev.totalTrips,
        }));
        setRenewalExpiryDate(expDate || '');
        setStatusInfo({
          approved: p.approvalStatus === 'APPROVED' || (p.status !== 'PENDING' && p.status !== 'REJECTED'),
          status: p.approvalStatus || p.status || 'APPROVED',
        });
      }

      if (tripsRes.status === 'fulfilled' && Array.isArray(tripsRes.value)) {
        const completed = tripsRes.value.filter(
          (t) => t.status === 'COMPLETED' || t.status === 'TRIP_COMPLETED'
        );
        setTripsCount(completed.length);
      }
    } catch (err) {
      console.error('Error fetching driver profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setDriverProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!driverProfile.firstName.trim() || !driverProfile.lastName.trim() || !driverProfile.phoneNumber.trim()) {
      showToast('First Name, Last Name, and Phone Number are mandatory.', 'warning');
      return;
    }

    setSaving(true);
    const isRejected = driverProfile.approvalStatus === 'REJECTED' || driverProfile.status === 'REJECTED';

    try {
      const updatePayload = {
        firstName: driverProfile.firstName.trim(),
        lastName: driverProfile.lastName.trim(),
        phoneNumber: driverProfile.phoneNumber.trim(),
        drivingLicenseNumber: driverProfile.drivingLicenseNumber.trim(),
        licenseExpiryDate: driverProfile.licenseExpiryDate,
        status: isRejected ? 'PENDING' : driverProfile.status,
        approvalStatus: isRejected ? 'PENDING' : driverProfile.approvalStatus,
        reApply: isRejected,
      };

      await driverApi.updateProfile(updatePayload);

      // Sync with local auth storage
      const fullName = `${updatePayload.firstName} ${updatePayload.lastName}`.trim();
      updateUserAndRoles({
        user: {
          ...authUser,
          name: fullName,
          firstName: updatePayload.firstName,
          lastName: updatePayload.lastName,
          phone: updatePayload.phoneNumber,
          phoneNumber: updatePayload.phoneNumber,
          drivingLicenseNumber: updatePayload.drivingLicenseNumber,
          licenseNumber: updatePayload.drivingLicenseNumber,
          licenseExpiryDate: updatePayload.licenseExpiryDate,
          licenseExpiry: updatePayload.licenseExpiryDate,
          status: updatePayload.status,
          approvalStatus: isRejected ? 'PENDING' : (driverProfile.approvalStatus || 'APPROVED'),
          rejectionReason: isRejected ? null : driverProfile.rejectionReason,
        },
      });

      if (isRejected) {
        setDriverProfile((prev) => ({
          ...prev,
          status: 'PENDING',
          approvalStatus: 'PENDING',
          rejectionReason: null,
        }));
        setStatusInfo({
          approved: false,
          status: 'PENDING',
        });
        showToast('Driver profile re-submitted for Super Admin verification!', 'success');
      } else {
        showToast('Driver profile details updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to update driver profile:', err);
      showToast('Error updating driver profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const rawStatus = (driverProfile.status || 'ACTIVE').toUpperCase();
  const isInactive = rawStatus === 'INACTIVE' || rawStatus === 'OFFLINE';
  const isOnDuty = !isInactive;

  const handleToggleDutyStatus = async () => {
    if (isLicenseExpired) {
      showToast('Cannot toggle status: Driving license is expired. Please update renewed license date.', 'error');
      return;
    }

    const nextStatus = isOnDuty ? 'INACTIVE' : 'ACTIVE';
    setSavingStatus(true);
    try {
      await driverApi.updateStatus(nextStatus, nextStatus === 'INACTIVE' ? 'Off-Duty Rest' : '');
      setDriverProfile((prev) => ({ ...prev, status: nextStatus }));
      showToast(`Duty status updated to ${nextStatus === 'ACTIVE' ? 'ACTIVE (On Duty / Available)' : 'INACTIVE (Off Duty)'}`, 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Error updating status.', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    if (!renewalExpiryDate) {
      showToast('Please select the new renewed license expiry date.', 'warning');
      return;
    }

    const newExp = new Date(renewalExpiryDate);
    if (newExp <= new Date()) {
      showToast('Renewed license expiry date must be in the future.', 'warning');
      return;
    }

    setRenewalLoading(true);
    try {
      const updatePayload = {
        firstName: driverProfile.firstName,
        lastName: driverProfile.lastName,
        phoneNumber: driverProfile.phoneNumber,
        drivingLicenseNumber: driverProfile.drivingLicenseNumber,
        licenseExpiryDate: renewalExpiryDate,
        yearsOfExperience: Number(driverProfile.yearsOfExperience) || 0,
        status: driverProfile.status === 'OFFLINE' ? 'AVAILABLE' : driverProfile.status,
      };

      await driverApi.updateProfile(updatePayload);
      setDriverProfile((prev) => ({
        ...prev,
        licenseExpiryDate: renewalExpiryDate,
        status: updatePayload.status,
      }));

      updateUserAndRoles({
        user: {
          ...authUser,
          licenseExpiryDate: renewalExpiryDate,
          licenseExpiry: renewalExpiryDate,
        },
      });

      setShowRenewalModal(false);
      showToast('🎉 Renewed Driving License date updated successfully! Driving status active.', 'success');
    } catch (err) {
      console.error('Failed to update renewed license date:', err);
      showToast('Error updating license date. Please try again.', 'error');
    } finally {
      setRenewalLoading(false);
    }
  };

  const isLicenseExpired = driverProfile.licenseExpiryDate ? new Date(driverProfile.licenseExpiryDate) < new Date() : false;
  const daysToExpiry = driverProfile.licenseExpiryDate 
    ? Math.ceil((new Date(driverProfile.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)) 
    : 999;
  const isExpiringSoon = !isLicenseExpired && daysToExpiry <= 30 && daysToExpiry > 0;
  const isDriverVerified = driverProfile.status !== 'PENDING' && driverProfile.status !== 'REJECTED';
  const displayName = `${driverProfile.firstName} ${driverProfile.lastName}`.trim() || 'Driver';

  return (
    <div className="space-y-6 pb-12">
      {/* LICENSE EXPIRATION SUSPENSION ALERT */}
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
                  Driving License Expired ({driverProfile.licenseExpiryDate})
                </h3>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed max-w-2xl font-medium">
                Your driving license has expired. As per compliance, you cannot be assigned trips until you provide your renewed license expiry date.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowRenewalModal(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Renewed Expiry Date</span>
          </button>
        </div>
      )}

      {/* EXPIRING SOON WARNING */}
      {isExpiringSoon && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-amber-900 dark:text-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Driving License Expiring Soon ({daysToExpiry} Days Remaining)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
                Your license expires on {driverProfile.licenseExpiryDate}. Please renew it to prevent trip dispatch suspension.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRenewalModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
          >
            Update Expiry Date
          </button>
        </div>
      )}

      {/* Pending Approval Notice */}
      {!isDriverVerified && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-amber-900 dark:text-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Driver Status: {driverProfile.status}</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
                Trip assignments unlock once Super Admin marks the driver profile as APPROVED.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
            {driverProfile.status}
          </span>
        </div>
      )}

      {/* Driver Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-purple-600/30">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                ROLE_DRIVER
              </span>
              
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isLicenseExpired
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : isOnDuty
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                Duty: {isLicenseExpired ? 'SUSPENDED' : isOnDuty ? 'ACTIVE (AVAILABLE)' : 'INACTIVE (OFF DUTY)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{displayName}</h1>
            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>📧 {driverProfile.email}</span>
              <span>📱 {driverProfile.phoneNumber}</span>
            </p>
          </div>
        </div>

        {/* Live Duty Switch */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duty Status</span>
            <strong className={`text-xs font-bold ${
              isLicenseExpired ? 'text-rose-400' : isOnDuty ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isLicenseExpired ? '⛔ Suspended (License Expired)' : isOnDuty ? '🟢 ON DUTY / AVAILABLE' : '⏸️ OFF DUTY / INACTIVE'}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleToggleDutyStatus}
            disabled={savingStatus || isLicenseExpired}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
              isOnDuty
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            } disabled:opacity-50 cursor-pointer`}
          >
            {savingStatus ? 'Updating...' : isOnDuty ? '⏸️ Switch to Off-Duty' : '🟢 Switch to On-Duty'}
          </button>
        </div>
      </div>

      {/* Driver Rejection Alert Banner */}
      {driverProfile.approvalStatus === 'REJECTED' && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Driver Application Rejected by Super Admin</h4>
            <p className="text-xs text-slate-200">
              Reason: <strong>{driverProfile.rejectionReason || driverProfile.inactiveReason || driverProfile.reason || 'No specific reason provided by administrator'}</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              You can correct your credentials below and click <strong>"Save Profile Changes"</strong> to re-submit your profile for verification.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Trips Completed</span>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{driverProfile.totalTrips || tripsCount} Trips</h3>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">Platform Verified Record</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Account Verification</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{driverProfile.approvalStatus || 'APPROVED'}</h3>
          <p className="text-[11px] text-blue-400 font-semibold mt-1">Super Admin Verified</p>
        </div>

        <div className={`border rounded-3xl p-5 shadow-xl ${
          isLicenseExpired 
            ? 'bg-rose-950/30 border-rose-500/40' 
            : isExpiringSoon 
            ? 'bg-amber-950/30 border-amber-500/40' 
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">License Expiry</span>
            <div className={`p-2.5 rounded-xl ${
              isLicenseExpired ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-lg font-extrabold mt-2 ${isLicenseExpired ? 'text-rose-400' : 'text-slate-100'}`}>
            {driverProfile.licenseExpiryDate}
          </h3>
          <p className={`text-[11px] font-bold mt-1 ${isLicenseExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isLicenseExpired ? '⛔ Expired' : isExpiringSoon ? `⚠️ Expires in ${daysToExpiry} days` : '✅ Valid'}
          </p>
        </div>
      </div>

      {/* Driver Details Form */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-extrabold text-slate-100">Driver Profile & Credentials</h2>
          </div>
          <span className="text-xs text-slate-400">Driver Profile Form</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">First Name <span className="text-rose-400">*</span></label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={driverProfile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                placeholder="First Name"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Last Name <span className="text-rose-400">*</span></label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={driverProfile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                placeholder="Last Name"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={driverProfile.email}
                disabled
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Phone Number <span className="text-rose-400">*</span></label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
              <input
                type="tel"
                value={driverProfile.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                required
                placeholder="10-digit phone number"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-300 mb-1.5">Driver Operational Status</label>
            <select
              value={driverProfile.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="AVAILABLE">AVAILABLE (On Duty)</option>
              <option value="OFFLINE">OFFLINE (Off Duty)</option>
              <option value="ON_TRIP">ON_TRIP (In Journey)</option>
            </select>
          </div>
        </div>

        {/* Locked License Details Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Driving License Credentials (Immutable Record)</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-amber-400 border border-slate-700">
              🔒 Immutable License Number
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Driving License Number</label>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono font-bold text-slate-200 flex items-center justify-between">
                  <span>{driverProfile.drivingLicenseNumber}</span>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  * License number is verified and cannot be edited.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">License Expiry Date</label>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-semibold flex items-center justify-between">
                  <span className={isLicenseExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {driverProfile.licenseExpiryDate} {isLicenseExpired ? '(Expired)' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRenewalModal(true)}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    Update Expiry
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  * Update when you receive your renewed license.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={fetchData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* License Renewal Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>Update Renewed License Expiry Date</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRenewalModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenewalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Driving License Number
                </label>
                <input
                  type="text"
                  value={driverProfile.drivingLicenseNumber}
                  disabled
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  New Renewed Expiry Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={renewalExpiryDate}
                  onChange={(e) => setRenewalExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenewalModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renewalLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {renewalLoading ? 'Updating...' : 'Confirm New Expiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
