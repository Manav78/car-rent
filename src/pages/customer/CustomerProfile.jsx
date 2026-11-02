import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, CheckCircle2, Save, Calendar, ShieldCheck, Building, Hash, Trash2, AlertOctagon, AlertCircle } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { getUser, updateUserAndRoles, clearAuth } from '../../utils/authStorage';
import { useToast } from '../../context/ToastContext';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const authUser = getUser() || {};
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: authUser?.firstName || authUser?.name?.split(' ')[0] || '',
    lastName: authUser?.lastName || authUser?.name?.split(' ').slice(1).join(' ') || '',
    email: authUser?.email || '',
    phoneNumber: authUser?.phoneNumber || authUser?.phone || '',
    city: authUser?.city || '',
    address: authUser?.address || '',
    postalCode: authUser?.postalCode || '',
    createdAt: authUser?.createdAt || '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await customerApi.getProfile();
        if (data) {
          const fName = data.firstName || (data.name ? data.name.split(' ')[0] : '') || formData.firstName;
          const lName = data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : '') || formData.lastName;
          setFormData((prev) => ({
            ...prev,
            ...data,
            firstName: fName,
            lastName: lName,
            email: data.email || prev.email,
            phoneNumber: data.phoneNumber || data.phone || prev.phoneNumber,
            city: data.city || prev.city,
            address: data.address || prev.address,
            postalCode: data.postalCode || prev.postalCode,
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : prev.createdAt,
          }));
        }
      } catch (err) {
        console.error('Failed to load customer profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim()) {
      showToast('First Name, Last Name, and Phone Number are required.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
      };

      await customerApi.updateProfile(updatePayload);

      // Sync with localStorage auth storage
      const fullName = `${updatePayload.firstName} ${updatePayload.lastName}`.trim();
      const updatedUser = updateUserAndRoles({
        user: {
          ...user,
          name: fullName,
          firstName: updatePayload.firstName,
          lastName: updatePayload.lastName,
          phone: updatePayload.phoneNumber,
          phoneNumber: updatePayload.phoneNumber,
          city: updatePayload.city,
          address: updatePayload.address,
          postalCode: updatePayload.postalCode,
        },
      });

      setUser(updatedUser);
      showToast('Customer profile updated successfully!', 'success');
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await customerApi.deleteAccount();
      clearAuth();
      showToast('Your customer account has been permanently deleted.', 'info');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Account deletion error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete account. Please try again.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const displayName = `${formData.firstName} ${formData.lastName}`.trim() || 'Customer';

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[11px] font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Customer Profile</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100">{displayName}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your personal details, contact number, and billing location.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Member since: <strong className="text-slate-100 font-bold">{formData.createdAt}</strong>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal & Contact Information */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Customer Personal & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">First Name <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    placeholder="First Name"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Last Name <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    placeholder="Last Name"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
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
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Address Information */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>Location & Billing Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Operating City</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Pune, Mumbai, Sangli..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Postal Code (PIN Code)</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="e.g. 411016"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Street Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Street address, building, landmark for pickup and invoicing..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Summary & Account Status */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Customer Account Overview</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Account Role</span>
                <span className="text-emerald-400 font-bold">ROLE_CUSTOMER</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Verification Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-extrabold uppercase">
                  Verified Active
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Booking Permission</span>
                <span className="text-emerald-400 font-semibold">Direct Rental Access</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-[11px] text-emerald-300 leading-relaxed">
              💡 Your customer profile is synchronized with your bookings and instant rental reservations.
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider border-b border-rose-500/20 pb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Danger Zone</span>
            </h3>

            <p className="text-xs text-rose-300/80 leading-relaxed">
              Permanently delete your customer account and remove all personal information and booking records.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Customer Account</span>
            </button>
          </div>
        </div>
      </form>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">Delete Account?</h3>
                <p className="text-xs text-rose-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete your customer account (<strong className="text-slate-100">{formData.email}</strong>)? All your profile data and active reservations will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting Account...' : 'Yes, Delete My Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
