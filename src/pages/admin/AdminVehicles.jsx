import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  Users, 
  Fuel, 
  Wind, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  Eye, 
  X, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { VEHICLE_TYPES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const AdminVehicles = () => {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [statusPromptVehicle, setStatusPromptVehicle] = useState(null);
  const [newVehicleStatus, setNewVehicleStatus] = useState('AVAILABLE');
  const [vehicleStatusReason, setVehicleStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateVehicleStatus = async () => {
    if (!statusPromptVehicle) return;
    try {
      setActionLoading(true);
      const vehicleId = statusPromptVehicle.id || statusPromptVehicle.vehicleId;
      await adminApi.updateVehicleStatus(vehicleId, newVehicleStatus, vehicleStatusReason);
      showToast(`Vehicle #${vehicleId} status updated to ${newVehicleStatus}.`, 'success');
      setStatusPromptVehicle(null);
      setSelectedVehicle(null);
      setVehicleStatusReason('');
      fetchVehicles(true);
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to update vehicle status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchVehicles = async (bypass = false) => {
    try {
      setLoading(true);
      const data = await adminApi.getAllVehicles({ bypassCache: bypass });
      if (Array.isArray(data)) {
        setVehicles(data);
      }
    } catch (err) {
      console.error('Failed to fetch platform vehicles:', err);
      showToast('Failed to load vehicles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      (v.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isApproved = v.approvalStatus === 'APPROVED' || (v.isApproved === true && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED');
    const isRejected = v.approvalStatus === 'REJECTED' || v.status === 'REJECTED';
    const isPending = !isApproved && !isRejected;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && isApproved) ||
      (statusFilter === 'PENDING' && isPending) ||
      (statusFilter === 'REJECTED' && isRejected) ||
      (statusFilter === 'MAINTENANCE' && v.status === 'MAINTENANCE');

    return matchesSearch && matchesStatus;
  });

  const approvedVehiclesCount = vehicles.filter((v) => v.approvalStatus === 'APPROVED' || (v.isApproved === true && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED')).length;
  const rejectedVehiclesCount = vehicles.filter((v) => v.approvalStatus === 'REJECTED' || v.status === 'REJECTED').length;
  const pendingVehiclesCount = vehicles.filter((v) => {
    const isApp = v.approvalStatus === 'APPROVED' || (v.isApproved === true && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED');
    const isRej = v.approvalStatus === 'REJECTED' || v.status === 'REJECTED';
    return !isApp && !isRej;
  }).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold mb-2">
            <Car className="w-3.5 h-3.5" />
            <span>Platform Vehicles Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">All Vehicles</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global monitoring of all cars registered across owners, live availability states, and verification records.
          </p>
        </div>

        <button
          onClick={() => fetchVehicles(true)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter & Search Bar - 2 Columns (Keyword + Status) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brand, model, plate number, owner..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-medium"
          >
            <option value="ALL">All Statuses ({vehicles.length})</option>
            <option value="APPROVED">Approved Vehicles ({approvedVehiclesCount})</option>
            <option value="PENDING">Pending Approval ({pendingVehiclesCount})</option>
            <option value="REJECTED">Rejected Vehicles ({rejectedVehiclesCount})</option>
            <option value="MAINTENANCE">Under Maintenance ({vehicles.filter(v => v.status === 'MAINTENANCE').length})</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading all registered vehicles...</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Vehicles Found</h3>
          <p className="text-xs text-slate-400">No vehicles match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => {
            const isApproved = v.approvalStatus === 'APPROVED' || (v.isApproved === true && v.approvalStatus !== 'REJECTED' && v.status !== 'REJECTED');
            const isRejected = v.approvalStatus === 'REJECTED' || v.status === 'REJECTED';
            const displayApproval = isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'UNDER REVIEW';
            const availability = v.status || 'AVAILABLE';

            return (
              <div
                key={v.vehicleId || v.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="h-44 bg-slate-950 relative flex items-center justify-center p-4 border-b border-slate-800/60">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.model || v.name} className="h-full object-contain" />
                    ) : (
                      <Car className="w-16 h-16 text-slate-700" />
                    )}

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border bg-slate-900/90 text-slate-300 border-slate-700">
                      {v.vehicleType || 'SUV'}
                    </span>

                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      isApproved
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isRejected
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {displayApproval}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-100">
                          {v.brand ? `${v.brand} ${v.model}` : v.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{v.vehicleNumber || 'MH-12-REG'}</p>
                      </div>
                      <span className="text-xs font-bold text-blue-400">₹{v.ratePerKm || v.pricePerKm || 15}/KM</span>
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/60 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner:</span>
                        <strong className="text-slate-200">{v.ownerName || 'Apex Auto Rentals'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operating City:</span>
                        <span>{v.city || 'Pune'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Availability:</span>
                        <span className={`font-bold ${availability === 'AVAILABLE' ? 'text-emerald-400' : availability === 'MAINTENANCE' ? 'text-amber-400' : 'text-blue-400'}`}>
                          {availability}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{v.seatingCapacity || 5} Seats</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{v.fuelType || 'Diesel'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-sky-400" />
                        <span>{v.hasAc !== undefined ? (v.hasAc ? 'AC' : 'Non-AC') : (v.ac !== false ? 'AC' : 'Non-AC')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 pt-3 mt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedVehicle(v)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>Specifications</span>
                  </button>
                  <button
                    onClick={() => {
                      setStatusPromptVehicle(v);
                      setNewVehicleStatus(v.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE');
                      setVehicleStatusReason('');
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-indigo-400 border border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    title="Change Vehicle Operational Status"
                  >
                    Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VEHICLE DETAILS MODAL */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-100">
                  {selectedVehicle.brand ? `${selectedVehicle.brand} ${selectedVehicle.model}` : selectedVehicle.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedVehicle.vehicleNumber || 'MH-12-REG'}</p>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Photos 4-Angle Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {selectedVehicle.images?.front || selectedVehicle.imageUrl ? (
                    <img src={selectedVehicle.images?.front || selectedVehicle.imageUrl} alt="Front" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-500">Front</span>
                  )}
                </div>
                <div className="h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {selectedVehicle.images?.back || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80'}
                  <img src={selectedVehicle.images?.back || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80'} alt="Rear" className="w-full h-full object-cover" />
                </div>
                <div className="h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img src={selectedVehicle.images?.side || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&auto=format&fit=crop&q=80'} alt="Side" className="w-full h-full object-cover" />
                </div>
                <div className="h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img src={selectedVehicle.images?.interior || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80'} alt="Interior" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Specifications</p>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Owner:</span>
                  <strong className="text-slate-100">{selectedVehicle.ownerName || 'Rental Owner'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span>{selectedVehicle.location || selectedVehicle.city || 'Pune'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tariff:</span>
                  <span className="text-emerald-400 font-bold">₹{selectedVehicle.pricePerKm || selectedVehicle.ratePerKm || 15} / KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approval Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    (selectedVehicle.approvalStatus === 'APPROVED' || selectedVehicle.isApproved) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedVehicle.approvalStatus || (selectedVehicle.isApproved ? 'APPROVED' : 'PENDING')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operational Availability:</span>
                  <span className="font-bold text-blue-400">{selectedVehicle.status || selectedVehicle.operationalStatus || 'AVAILABLE'}</span>
                </div>
              </div>

              {/* RC Documents Section */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RC & Verification Documents</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-semibold">RC Certificate (Front)</span>
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                      <img src={selectedVehicle.rcFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'} alt="RC Front" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-400 block font-semibold">RC Certificate (Back)</span>
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                      <img src={selectedVehicle.rcBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80'} alt="RC Back" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStatusPromptVehicle(selectedVehicle);
                  setNewVehicleStatus(selectedVehicle.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE');
                  setVehicleStatusReason('');
                }}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Change Operational Status
              </button>

              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE STATUS PROMPT MODAL */}
      {statusPromptVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-100">
                Update Status: {statusPromptVehicle.brand} {statusPromptVehicle.model} ({statusPromptVehicle.licensePlate || statusPromptVehicle.vehicleNumber})
              </h3>
              <button onClick={() => setStatusPromptVehicle(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Operational Status
                </label>
                <select
                  value={newVehicleStatus}
                  onChange={(e) => setNewVehicleStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE (Ready for Customer Reservations)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Temporarily Withdrawn for Service)</option>
                  <option value="INACTIVE">INACTIVE (Deactivated / Offline)</option>
                  <option value="BOOKED">BOOKED (Reserved)</option>
                  <option value="ON_TRIP">ON_TRIP (Active on Route)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for status change (e.g. 50,000km scheduled service)..."
                  value={vehicleStatusReason}
                  onChange={(e) => setVehicleStatusReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStatusPromptVehicle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateVehicleStatus}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Status Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
