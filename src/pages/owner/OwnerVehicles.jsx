import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Users, 
  Fuel, 
  Edit3, 
  Trash2, 
  X, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Eye, 
  DollarSign, 
  RefreshCw 
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import { VEHICLE_TYPES, SEATING_CAPACITIES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];

const OwnerVehicles = () => {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

  // Form State strictly adhering to Spring Boot VehicleRequest
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    vehicleType: 'SUV',
    year: new Date().getFullYear(),
    seatingCapacity: 5,
    fuelType: 'DIESEL',
    pricePerKm: 18,
    location: 'Pune',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'

  const fetchData = async (bypass = false) => {
    try {
      setLoading(true);
      const [vehiclesRes, profileRes] = await Promise.allSettled([
        ownerApi.getVehicles({ bypassCache: bypass }),
        ownerApi.getProfile({ bypassCache: bypass }),
      ]);

      if (vehiclesRes.status === 'fulfilled' && Array.isArray(vehiclesRes.value)) {
        setVehicles(vehiclesRes.value);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setOwnerProfile(profileRes.value);
      }
    } catch (err) {
      console.error('Failed to fetch owner vehicles:', err);
      showToast('Failed to load vehicles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const isOwnerApproved = ownerProfile
    ? ownerProfile.status !== 'PENDING' &&
      ownerProfile.status !== 'PENDING_APPROVAL' &&
      ownerProfile.status !== 'REJECTED' &&
      ownerProfile.isApproved !== false
    : true;

  const openAddModal = () => {
    if (!isOwnerApproved) {
      showToast('Account verification pending. You can register vehicles after Super Admin approves your account.', 'warning');
      return;
    }
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      licensePlate: '',
      vehicleType: 'SUV',
      year: new Date().getFullYear(),
      seatingCapacity: 5,
      fuelType: 'DIESEL',
      pricePerKm: 18,
      location: 'Pune',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
      description: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (v) => {
    setEditingVehicle(v);
    const imgUrl = (Array.isArray(v.imageUrls) && v.imageUrls[0]) || v.imageUrl || v.images?.front || '';
    setFormData({
      brand: v.brand || '',
      model: v.model || '',
      licensePlate: v.licensePlate || v.vehicleNumber || '',
      vehicleType: (v.vehicleType || 'SUV').toUpperCase(),
      year: v.year || new Date().getFullYear(),
      seatingCapacity: v.seatingCapacity || 5,
      fuelType: (v.fuelType || 'DIESEL').toUpperCase(),
      pricePerKm: v.pricePerKm || v.ratePerKm || 18,
      location: v.location || v.city || 'Pune',
      imageUrl: imgUrl,
      description: v.description || '',
    });
    setShowAddModal(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.model.trim() || !formData.licensePlate.trim()) {
      showToast('Brand, Model, and License Plate Number are required.', 'warning');
      return;
    }

    setSubmitting(true);
    const isEditingRejected = editingVehicle ? checkVehicleApproval(editingVehicle).isRejected : false;

    const payload = {
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: Number(formData.year) || new Date().getFullYear(),
      licensePlate: formData.licensePlate.trim().toUpperCase(),
      pricePerKm: Number(formData.pricePerKm) || 15,
      seatingCapacity: Number(formData.seatingCapacity) || 5,
      vehicleType: formData.vehicleType.toUpperCase(),
      fuelType: formData.fuelType.toUpperCase(),
      status: 'AVAILABLE',
      location: formData.location.trim() || 'Pune',
      imageUrls: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      description: formData.description.trim() || `${formData.brand.trim()} ${formData.model.trim()} (${formData.year})`,
      approvalStatus: isEditingRejected ? 'PENDING' : (editingVehicle?.approvalStatus || 'PENDING'),
      reApply: isEditingRejected,
    };

    try {
      if (editingVehicle) {
        const targetId = editingVehicle.vehicleId || editingVehicle.id;
        if (isEditingRejected) {
          await ownerApi.resubmitVehicle(targetId, payload);
          showToast(`Vehicle "${payload.brand} ${payload.model}" re-submitted for Super Admin verification!`, 'success');
        } else {
          await ownerApi.updateVehicle(targetId, payload);
          showToast(`Vehicle "${payload.brand} ${payload.model}" updated successfully!`, 'success');
        }
      } else {
        await ownerApi.addVehicle(payload);
        showToast('Vehicle submitted successfully for Super Admin verification!', 'success');
      }
      setShowAddModal(false);
      setEditingVehicle(null);
      await fetchData(true);
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      showToast('Failed to save vehicle. Please verify input fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectResubmit = async (vehicle) => {
    try {
      const targetId = vehicle.vehicleId || vehicle.id;
      setSubmitting(true);
      await ownerApi.resubmitVehicle(targetId, vehicle);
      showToast(`Vehicle "${vehicle.brand} ${vehicle.model}" re-submitted for Super Admin verification!`, 'success');
      await fetchData(true);
    } catch (err) {
      console.error('Direct re-submit failed:', err);
      showToast('Failed to re-submit vehicle for verification.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;

    setDeleting(true);
    try {
      const targetId = deletingVehicle.vehicleId || deletingVehicle.id;
      await ownerApi.deleteVehicle(targetId);
      setVehicles((prev) => prev.filter((v) => (v.vehicleId || v.id) !== targetId));
      showToast(`Vehicle "${deletingVehicle.brand} ${deletingVehicle.model}" deleted successfully.`, 'success');
      setDeletingVehicle(null);
      fetchData();
    } catch (err) {
      console.error('Delete vehicle failed:', err);
      showToast('Failed to delete vehicle. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDirectStatusChange = async (vehicle, newStatus) => {
    try {
      const targetId = vehicle.vehicleId || vehicle.id;
      await ownerApi.updateVehicleAvailability(targetId, newStatus);
      setVehicles((prev) =>
        prev.map((v) => ((v.vehicleId || v.id) === targetId ? { ...v, status: newStatus } : v))
      );
      showToast(`Vehicle "${vehicle.brand} ${vehicle.model}" status updated to ${newStatus}!`, 'success');
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
      showToast('Failed to update status.', 'error');
    }
  };

  const checkVehicleApproval = (v) => {
    if (!v) return { isApproved: false, isPending: false, isRejected: false };

    const rawApproval = String(v.approvalStatus || '').toUpperCase().trim();
    const rawStatus = String(v.status || '').toUpperCase().trim();

    // 1. Explicit Rejected Check
    if (rawApproval === 'REJECTED' || rawStatus === 'REJECTED') {
      return { isApproved: false, isPending: false, isRejected: true };
    }

    // 2. Explicit Pending Check
    if (
      rawApproval === 'PENDING' ||
      rawApproval === 'PENDING_APPROVAL' ||
      rawStatus === 'PENDING' ||
      v.isApproved === false
    ) {
      return { isApproved: false, isPending: true, isRejected: false };
    }

    // 3. Explicit Approved or Default Active Vehicle Check
    return { isApproved: true, isPending: false, isRejected: false };
  };

  const filteredVehicles = vehicles.filter((v) => {
    const { isApproved, isPending, isRejected } = checkVehicleApproval(v);

    if (statusFilter === 'APPROVED') return isApproved;
    if (statusFilter === 'PENDING') return isPending;
    if (statusFilter === 'REJECTED') return isRejected;
    return true;
  });

  const approvedCount = vehicles.filter((v) => checkVehicleApproval(v).isApproved).length;
  const pendingCount = vehicles.filter((v) => checkVehicleApproval(v).isPending).length;
  const rejectedCount = vehicles.filter((v) => checkVehicleApproval(v).isRejected).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Verification Gate Warning Banner for Unapproved Owners */}
      {!isOwnerApproved && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="block text-amber-200">Owner Verification Pending</strong>
            Your owner account is currently under Super Admin review. You will be able to register new vehicles once approved.
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner Fleet Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            My Registered Vehicles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your fleet vehicles, track Super Admin approvals, and update duty availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            disabled={!isOwnerApproved}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs for Admin Verification State */}
      <div className="flex flex-wrap bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1.5 text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 font-bold rounded-xl transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Approved ({approvedCount})</span>
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'PENDING' ? 'bg-amber-600 text-white shadow' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approval ({pendingCount})</span>
        </button>
        {rejectedCount > 0 && (
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'REJECTED' ? 'bg-rose-600 text-white shadow' : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Rejected ({rejectedCount})</span>
          </button>
        )}
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading fleet vehicles...</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Vehicles Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'ALL'
              ? 'Click "Add New Vehicle" to register your cars and start receiving bookings.'
              : `No vehicles currently in "${statusFilter}" status.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => {
            const { isApproved, isPending, isRejected } = checkVehicleApproval(v);
            const rate = v.pricePerKm || v.ratePerKm || 15;
            const img = (Array.isArray(v.imageUrls) && v.imageUrls[0]) || v.imageUrl || v.images?.front;
            const plate = v.licensePlate || v.vehicleNumber || 'N/A';
            const loc = v.location || v.city || 'Pune';

            return (
              <div
                key={v.vehicleId || v.id}
                className={`bg-slate-900/90 border rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between ${
                  isPending ? 'border-amber-500/30' : isRejected ? 'border-rose-500/30' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Vehicle Image Container */}
                  <div className="h-48 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                    {img ? (
                      <img
                        src={img}
                        alt={`${v.brand} ${v.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Car className="w-12 h-12 text-slate-700" />
                    )}

                    {/* Operational Duty Status Pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase border backdrop-blur-md shadow ${
                          v.status === 'AVAILABLE'
                            ? 'bg-emerald-600/90 text-white border-emerald-400/60'
                            : v.status === 'MAINTENANCE'
                            ? 'bg-amber-600/90 text-white border-amber-400/60'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700'
                        }`}
                      >
                        {v.status || 'AVAILABLE'}
                      </span>
                    </div>
                  </div>

                  {/* Verification Banner if Pending or Rejected */}
                  {isPending && (
                    <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5 px-4">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Awaiting Super Admin Verification</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-[11px] text-rose-300 font-semibold space-y-2 px-4">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <span className="leading-snug">
                          <strong>Verification Rejected:</strong> {v.rejectionReason || v.reason || 'Documents or specifications do not meet compliance standards'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-500/20">
                        <button
                          onClick={() => handleDirectResubmit(v)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer border border-slate-700 shadow transition-all"
                        >
                          Re-apply Direct
                        </button>
                        <button
                          onClick={() => openEditModal(v)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Fix &amp; Re-submit</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Header & Specs */}
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                          {v.vehicleType || 'SEDAN'} • {v.year || 2024}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300 font-mono">{plate}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-100 mt-0.5">
                        {v.brand} {v.model}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{loc}</span>
                        </p>

                        {/* Admin Verification Status Indicator */}
                        {isApproved ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approved ✓</span>
                          </span>
                        ) : isPending ? (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Under Review</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chips Grid strictly for backend specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300">
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800 text-center flex items-center justify-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>{v.seatingCapacity || 5} Seats</span>
                      </div>
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800 text-center flex items-center justify-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>{v.fuelType || 'DIESEL'}</span>
                      </div>
                    </div>

                    {/* Direct Tariff strictly from backend pricePerKm */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Tariff Rate</span>
                        <strong className="text-emerald-400 font-mono text-sm font-black">₹{rate} / KM</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                        <span className="text-slate-200 font-medium">{loc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Quick Status Dropdown & Action Buttons */}
                <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/40">
                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">Duty:</span>
                    <select
                      disabled={!isApproved}
                      value={v.status || 'AVAILABLE'}
                      onChange={(e) => handleDirectStatusChange(v, e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="AVAILABLE">🟢 Available for Trips</option>
                      <option value="MAINTENANCE">🟡 Maintenance</option>
                      <option value="INACTIVE">⚪ Inactive</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setViewingVehicle(v)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                      title="View Vehicle Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(v)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-colors cursor-pointer"
                      title="Edit Vehicle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingVehicle(v)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT VEHICLE MODAL (Strictly mapped to VehicleRequest schema) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">
                  {editingVehicle
                    ? checkVehicleApproval(editingVehicle).isRejected
                      ? 'Fix & Re-submit Vehicle for Admin Verification'
                      : 'Edit Vehicle Specifications'
                    : 'Register New Vehicle'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingVehicle && checkVehicleApproval(editingVehicle).isRejected
                    ? 'Correct required documents and specs, then re-submit to Super Admin queue.'
                    : 'Enter vehicle information according to backend specification standards.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingVehicle(null);
                }}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingVehicle && checkVehicleApproval(editingVehicle).isRejected && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <strong className="block text-rose-400">Previous Rejection Reason:</strong>
                  <span>{editingVehicle.rejectionReason || editingVehicle.reason || 'Documents or photos did not meet verification criteria.'}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Toyota, Tata, Mahindra..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Innova, Scorpio, Nexon..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">License Plate Number *</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    placeholder="MH-12-AB-1234"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Model Year *</label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Vehicle Type *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fuel Type *</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {FUEL_TYPES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Seating Capacity *</label>
                  <select
                    value={formData.seatingCapacity}
                    onChange={(e) => setFormData({ ...formData, seatingCapacity: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {SEATING_CAPACITIES.map((c) => (
                      <option key={c} value={c}>{c} Seats</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tariff Rate (₹ / KM) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Location / Station City *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Pune, Mumbai, Sangli..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Vehicle Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comfortable SUV for outstation and local trips..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVehicle(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer ${
                    editingVehicle && checkVehicleApproval(editingVehicle).isRejected
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Saving...'
                      : editingVehicle && checkVehicleApproval(editingVehicle).isRejected
                      ? 'Re-submit for Super Admin Approval'
                      : editingVehicle
                      ? 'Save Changes'
                      : 'Submit for Verification'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW VEHICLE DETAILS MODAL */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-100">
                    {viewingVehicle.brand} {viewingVehicle.model}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {viewingVehicle.licensePlate || viewingVehicle.vehicleNumber} • {viewingVehicle.location || viewingVehicle.city || 'Pune'}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingVehicle(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo */}
            <div className="h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {((Array.isArray(viewingVehicle.imageUrls) && viewingVehicle.imageUrls[0]) || viewingVehicle.imageUrl) ? (
                <img
                  src={(Array.isArray(viewingVehicle.imageUrls) && viewingVehicle.imageUrls[0]) || viewingVehicle.imageUrl}
                  alt="Vehicle"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="w-16 h-16 text-slate-700" />
              )}
            </div>

            {/* Backend Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Type</span>
                <strong className="text-slate-200">{viewingVehicle.vehicleType || 'SUV'}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Model Year</span>
                <strong className="text-slate-200">{viewingVehicle.year || 2024}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fuel Type</span>
                <strong className="text-slate-200">{viewingVehicle.fuelType || 'DIESEL'}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Seating Capacity</span>
                <strong className="text-slate-200">{viewingVehicle.seatingCapacity || 5} Seats</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tariff Rate</span>
                <strong className="text-emerald-400 font-mono">₹{viewingVehicle.pricePerKm || viewingVehicle.ratePerKm || 15} / KM</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Approval Status</span>
                <strong className={
                  viewingVehicle.approvalStatus === 'APPROVED'
                    ? 'text-emerald-400'
                    : viewingVehicle.approvalStatus === 'REJECTED'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }>
                  {viewingVehicle.approvalStatus || 'APPROVED'}
                </strong>
              </div>
            </div>

            {viewingVehicle.approvalStatus === 'REJECTED' && (
              <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-500/30 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-400 block">Super Admin Rejection Reason</span>
                <p className="text-slate-200">{viewingVehicle.rejectionReason || viewingVehicle.reason || 'No specific reason provided by administrator'}</p>
              </div>
            )}

            {viewingVehicle.description && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
                <span className="text-[10px] font-bold text-slate-300 block mb-1">Description</span>
                {viewingVehicle.description}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewingVehicle(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
              {viewingVehicle.approvalStatus === 'REJECTED' && (
                <>
                  <button
                    onClick={() => {
                      const target = viewingVehicle;
                      setViewingVehicle(null);
                      handleDirectResubmit(target);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow transition-all"
                  >
                    Direct Re-apply
                  </button>
                  <button
                    onClick={() => {
                      const target = viewingVehicle;
                      setViewingVehicle(null);
                      openEditModal(target);
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Fix &amp; Re-submit</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/15 rounded-2xl border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">Delete Vehicle?</h3>
                <p className="text-xs text-slate-400">Permanent removal.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">
                {deletingVehicle.brand} {deletingVehicle.model}
              </strong>{' '}
              ({deletingVehicle.licensePlate || deletingVehicle.vehicleNumber})?
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeletingVehicle(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerVehicles;
