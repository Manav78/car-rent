import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Navigation, 
  CreditCard, 
  CheckCircle2, 
  Save, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Shield,
  Briefcase,
  Image as ImageIcon,
  Check,
  AlertOctagon
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import { getUser, getRoles, updateUserAndRoles } from '../../utils/authStorage';
import { useToast } from '../../context/ToastContext';

const OwnerProfile = () => {
  const { showToast } = useToast();
  const [user, setUser] = useState(() => getUser() || {});
  const [userRoles, setUserRoles] = useState(() => getRoles());
  const isDriver = userRoles.includes('ROLE_DRIVER');

  const [ownerData, setOwnerData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || user?.businessName || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    city: user?.city || '',
    address: user?.address || '',
  });

  const [driverData, setDriverData] = useState({
    licenseNumber: user?.licenseNumber || user?.drivingLicenseNumber || '',
    licenseExpiry: user?.licenseExpiry || user?.licenseExpiryDate || '',
  });

  const [savingOwner, setSavingOwner] = useState(false);
  const [applyingDriver, setApplyingDriver] = useState(false);
  const [ownerVerification, setOwnerVerification] = useState({
    status: user?.status || 'APPROVED',
    approvalStatus: user?.approvalStatus || 'APPROVED',
    rejectionReason: user?.rejectionReason || null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await ownerApi.getProfile();
        if (profile) {
          setOwnerData((prev) => ({
            ...prev,
            name: profile.name || profile.businessName || (profile.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : prev.name),
            companyName: profile.businessName || profile.companyName || prev.companyName,
            email: profile.email || prev.email,
            phone: profile.phoneNumber || profile.phone || prev.phone,
            city: profile.city || prev.city,
            address: profile.address || prev.address,
          }));

          setOwnerVerification({
            status: profile.status || 'APPROVED',
            approvalStatus: profile.approvalStatus || profile.status || 'APPROVED',
            rejectionReason: profile.rejectionReason || profile.reason || null,
          });

          if (profile.licenseNumber || profile.drivingLicenseNumber) {
            setDriverData((prev) => ({
              ...prev,
              licenseNumber: profile.licenseNumber || profile.drivingLicenseNumber || prev.licenseNumber,
              licenseExpiry: profile.licenseExpiry || profile.licenseExpiryDate || prev.licenseExpiry,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load owner profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveOwnerInfo = async (e) => {
    e.preventDefault();
    setSavingOwner(true);
    const isRejected = ownerVerification.approvalStatus === 'REJECTED' || ownerVerification.status === 'REJECTED';

    try {
      const nameParts = (ownerData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await ownerApi.updateProfile({
        firstName,
        lastName,
        phoneNumber: ownerData.phone,
        willingToDrive: isDriver,
        drivingLicenseNumber: driverData.licenseNumber || null,
        licenseExpiryDate: driverData.licenseExpiry || null,
        reApply: isRejected,
        approvalStatus: isRejected ? 'PENDING' : undefined,
      });

      const updated = updateUserAndRoles({
        user: {
          ...user,
          name: ownerData.name,
          firstName,
          lastName,
          companyName: ownerData.companyName,
          phone: ownerData.phone,
          phoneNumber: ownerData.phone,
          city: ownerData.city,
          address: ownerData.address,
          status: isRejected ? 'PENDING_APPROVAL' : (user.status || 'APPROVED'),
          approvalStatus: isRejected ? 'PENDING_APPROVAL' : (user.approvalStatus || 'APPROVED'),
          rejectionReason: isRejected ? null : user.rejectionReason,
        },
      });
      setUser(updated);

      if (isRejected) {
        setOwnerVerification({
          status: 'PENDING_APPROVAL',
          approvalStatus: 'PENDING_APPROVAL',
          rejectionReason: null,
        });
        showToast('Owner profile re-submitted for Super Admin verification!', 'success');
      } else {
        showToast('Owner profile details updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update owner profile.', 'error');
    } finally {
      setSavingOwner(false);
    }
  };

  const handleResubmitOwnerVerification = async () => {
    setSavingOwner(true);
    try {
      const nameParts = (ownerData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await ownerApi.resubmitProfile({
        firstName,
        lastName,
        phoneNumber: ownerData.phone,
        willingToDrive: isDriver,
        drivingLicenseNumber: driverData.licenseNumber || null,
        licenseExpiryDate: driverData.licenseExpiry || null,
      });

      setOwnerVerification({
        status: 'PENDING_APPROVAL',
        approvalStatus: 'PENDING_APPROVAL',
        rejectionReason: null,
      });

      const updated = updateUserAndRoles({
        user: {
          ...user,
          status: 'PENDING_APPROVAL',
          approvalStatus: 'PENDING_APPROVAL',
          rejectionReason: null,
        },
      });
      setUser(updated);
      showToast('Owner verification request re-submitted to Super Admin!', 'success');
    } catch (err) {
      console.error('Re-submission failed:', err);
      showToast('Failed to re-submit verification request.', 'error');
    } finally {
      setSavingOwner(false);
    }
  };

  const handleApplyOrUpdateDriver = async (e) => {
    e.preventDefault();
    if (!driverData.licenseNumber.trim()) {
      showToast('Please enter a valid Driving License Number.', 'warning');
      return;
    }

    setApplyingDriver(true);
    try {
      const nameParts = (ownerData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await ownerApi.updateProfile({
        firstName,
        lastName,
        phoneNumber: ownerData.phone,
        willingToDrive: true,
        drivingLicenseNumber: driverData.licenseNumber,
        licenseExpiryDate: driverData.licenseExpiry || null,
      });

      const newRoles = Array.from(new Set([...userRoles, 'ROLE_DRIVER']));
      const updatedUser = updateUserAndRoles({
        user: {
          ...user,
          licenseNumber: driverData.licenseNumber,
          drivingLicenseNumber: driverData.licenseNumber,
          licenseExpiry: driverData.licenseExpiry,
          licenseExpiryDate: driverData.licenseExpiry,
          willingToDrive: true,
          wantsToDrive: true,
        },
        roles: newRoles,
      });

      setUser(updatedUser);
      setUserRoles(newRoles);
      showToast('Driving license and driver mode enabled successfully!', 'success');
    } catch (err) {
      console.error('Driver update failed:', err);
      showToast('Failed to update driver credentials.', 'error');
    } finally {
      setApplyingDriver(false);
    }
  };

  const isPendingVerification =
    ownerVerification.approvalStatus === 'PENDING' ||
    ownerVerification.approvalStatus === 'PENDING_APPROVAL' ||
    ownerVerification.status === 'PENDING' ||
    ownerVerification.status === 'PENDING_APPROVAL';

  const isRejectedVerification =
    ownerVerification.approvalStatus === 'REJECTED' ||
    ownerVerification.status === 'REJECTED';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-600/30">
            {ownerData.name ? ownerData.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            {isRejectedVerification ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-full text-[11px] font-bold mb-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Verification Rejected</span>
              </div>
            ) : isPendingVerification ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-[11px] font-bold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Verification Under Review</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-full text-[11px] font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Vehicle Owner</span>
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-slate-100">{ownerData.companyName || ownerData.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage vehicle ownership credentials, driving privileges, and subscription tiers.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/owner/subscription"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Manage Subscription</span>
          </Link>
        </div>
      </div>

      {isRejectedVerification && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Owner Account Verification Rejected by Super Admin</h4>
              <p className="text-xs text-slate-200">
                Reason: <strong>{ownerVerification.rejectionReason || 'No specific reason provided by administrator'}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Update your business details or click <strong>"Re-apply for Verification"</strong> to submit your profile back to the Super Admin queue.
              </p>
            </div>
          </div>
          <button
            onClick={handleResubmitOwnerVerification}
            disabled={savingOwner}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer shrink-0 transition-all"
          >
            {savingOwner ? 'Submitting...' : 'Re-apply for Verification'}
          </button>
        </div>
      )}

      {isPendingVerification && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-300">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="block text-amber-400 font-bold uppercase tracking-wider text-[11px]">Verification Pending Super Admin Review</strong>
            <span>Your owner account credentials have been submitted and are currently in the Super Admin verification queue.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Owner Info & Driving Application */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business & Owner Info Form */}
          <form onSubmit={handleSaveOwnerInfo} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Vehicle Owner & Business Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Owner / Representative Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={ownerData.name}
                    onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Company / Agency Name</label>
                <div className="relative">
                  <Car className="w-4 h-4 absolute left-3.5 top-3 text-blue-400" />
                  <input
                    type="text"
                    value={ownerData.companyName}
                    onChange={(e) => setOwnerData({ ...ownerData, companyName: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={ownerData.email}
                    disabled
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                  <input
                    type="tel"
                    value={ownerData.phone}
                    onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Headquarters City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
                  <input
                    type="text"
                    value={ownerData.city}
                    onChange={(e) => setOwnerData({ ...ownerData, city: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Garage / Operational Address</label>
              <textarea
                rows={2}
                value={ownerData.address}
                onChange={(e) => setOwnerData({ ...ownerData, address: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingOwner}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingOwner ? 'Saving...' : 'Save Owner Details'}</span>
              </button>
            </div>
          </form>

          {/* Dedicated Driving Application / Privileges Section */}
          <form onSubmit={handleApplyOrUpdateDriver} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                    {isDriver ? 'Driving Privileges (Dual Role: Owner + Driver)' : 'Apply to Work as Driver (Self-Driving Mode)'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isDriver 
                      ? 'You are active as both an Owner and Driver. You can accept and drive vehicle trips directly.'
                      : 'Did not choose to drive during signup? Provide your Driving License to activate Dual-Role privileges.'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${
                isDriver ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isDriver ? 'DUAL ROLE ACTIVE' : 'OWNER ONLY'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Driving License Number *</label>
                <input
                  type="text"
                  value={driverData.licenseNumber}
                  onChange={(e) => setDriverData({ ...driverData, licenseNumber: e.target.value })}
                  placeholder="e.g. MH-12-2024009988"
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">License Expiry Date *</label>
                <input
                  type="date"
                  value={driverData.licenseExpiry}
                  onChange={(e) => setDriverData({ ...driverData, licenseExpiry: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={applyingDriver}
                className={`px-6 py-3 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${
                  isDriver
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>
                  {applyingDriver
                    ? 'Processing Application...'
                    : isDriver
                    ? 'Update Driving Credentials'
                    : 'Submit Application to Work as Driver'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Fleet & Operations Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" />
              <span>Fleet &amp; Operations</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fleet Status</span>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-blue-400">Unlimited Fleet</h4>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-extrabold uppercase">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400">Direct Vehicle &amp; Driver Management</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver Mode:</span>
                  <strong className={isDriver ? 'text-purple-400' : 'text-slate-300'}>
                    {isDriver ? 'Active (Dual-Role)' : 'Owner Only'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch:</span>
                  <span className="text-slate-200">Instant Online</span>
                </div>
              </div>

              <Link
                to="/owner/vehicles"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-center block"
              >
                <Car className="w-4 h-4" />
                <span>Manage Fleet Vehicles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
