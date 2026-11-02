import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Car, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  Eye, 
  X, 
  Sparkles,
  Building,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const AdminOwners = () => {
  const { showToast } = useToast();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [statusPromptOwner, setStatusPromptOwner] = useState(null);
  const [newStatus, setNewStatus] = useState('APPROVED');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateOwnerStatus = async () => {
    if (!statusPromptOwner) return;
    try {
      setActionLoading(true);
      const ownerId = statusPromptOwner.ownerId || statusPromptOwner.userId || statusPromptOwner.id;
      await adminApi.updateOwnerStatus(ownerId, newStatus, statusReason);
      showToast(`Owner status updated to ${newStatus}.`, 'success');
      setStatusPromptOwner(null);
      setSelectedOwner(null);
      setStatusReason('');
      fetchOwners(true);
    } catch (err) {
      console.error('Failed to update owner status:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to update owner status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchOwners = async (bypass = false) => {
    try {
      setLoading(true);
      const data = await adminApi.getAllOwners({ bypassCache: bypass });
      if (Array.isArray(data)) {
        setOwners(data);
      }
    } catch (err) {
      console.error('Failed to fetch owners:', err);
      showToast('Failed to load vehicle owners.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const getOwnerStatus = (o) => {
    if (o.approvalStatus) {
      const s = String(o.approvalStatus).toUpperCase();
      if (s === 'APPROVED' || s === 'VERIFIED') return 'APPROVED';
      if (s === 'REJECTED') return 'REJECTED';
      if (s === 'PENDING' || s === 'PENDING_APPROVAL') return 'PENDING';
    }
    if (o.status) {
      const s = String(o.status).toUpperCase();
      if (s === 'APPROVED' || s === 'VERIFIED') return 'APPROVED';
      if (s === 'REJECTED') return 'REJECTED';
      if (s === 'PENDING' || s === 'PENDING_APPROVAL') return 'PENDING';
    }
    if (o.isActive === true) return 'APPROVED';
    if (o.isActive === false) {
      if (o.rejectionReason || o.rejection_reason) return 'REJECTED';
      return 'PENDING';
    }
    if (o.isApproved === true) return 'APPROVED';
    if (o.isApproved === false) {
      if (o.rejectionReason || o.rejection_reason) return 'REJECTED';
      return 'PENDING';
    }
    return 'APPROVED';
  };

  const filteredOwners = owners.filter((o) => {
    const name = o.fullName || o.name || '';
    const email = o.email || '';
    const city = o.city || 'Pune';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getOwnerStatus(o);
    const matchesStatus =
      statusFilter === 'ALL' ||
      statusFilter === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Platform Owners Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Platform Owners</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository of all registered owners, vehicle limits, subscription plans, and verification statuses.
          </p>
        </div>

        <button
          onClick={() => fetchOwners(true)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or city..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Owners ({owners.length})</option>
            <option value="APPROVED">Verified Owners ({owners.filter(o => getOwnerStatus(o) === 'APPROVED').length})</option>
            <option value="PENDING">Pending Review ({owners.filter(o => getOwnerStatus(o) === 'PENDING').length})</option>
            <option value="REJECTED">Rejected Owners ({owners.filter(o => getOwnerStatus(o) === 'REJECTED').length})</option>
          </select>
        </div>
      </div>

      {/* Owners Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading vehicle owners directory...</div>
      ) : filteredOwners.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Vehicle Owners Found</h3>
          <p className="text-xs text-slate-400">No owners matched your search and filter criteria.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Owner / Company Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Total Cars</th>
                  <th className="py-3.5 px-4">Subscription Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOwners.map((o) => {
                  const ownerName = o.fullName || o.name || 'Vehicle Owner';
                  const compName = o.businessName || o.companyName || `${ownerName} Fleet`;
                  const contactPhone = o.mobileNumber || o.phoneNumber || o.phone || '+91 98765 43213';
                  const status = getOwnerStatus(o);

                  return (
                    <tr key={o.ownerId || o.userId || o.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black text-xs flex items-center justify-center">
                            {ownerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-slate-100 block">{ownerName}</strong>
                            <span className="text-[11px] text-slate-400">{compName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{o.email}</div>
                        <div className="text-[11px] text-slate-400">{contactPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{o.city || 'Pune'}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 font-bold">
                          <Car className="w-3.5 h-3.5 text-blue-400" />
                          <span>{o.fleetCount || 2} Cars</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-bold">{o.activePlan || 'Owner Pro Plan'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {status === 'APPROVED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            VERIFIED
                          </span>
                        ) : status === 'REJECTED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-rose-500/15 text-rose-400 border-rose-500/30">
                            REJECTED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-amber-500/15 text-amber-400 border-amber-500/30">
                            PENDING REVIEW
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOwner({ ...o, name: ownerName, companyName: compName, phone: contactPhone, status })}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setStatusPromptOwner(o);
                            setNewStatus(status === 'APPROVED' ? 'REJECTED' : 'APPROVED');
                            setStatusReason('');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                            status === 'APPROVED'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <span>{status === 'APPROVED' ? 'Suspend' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OWNER DETAILS MODAL */}
      {selectedOwner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black flex items-center justify-center">
                  {selectedOwner.name ? selectedOwner.name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">{selectedOwner.name}</h3>
                  <p className="text-xs text-slate-400">{selectedOwner.companyName || 'Vehicle Rental Host'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOwner(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedOwner.status === 'REJECTED' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Account Verification Rejected</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Reason: <span className="text-rose-200 font-medium">{selectedOwner.rejectionReason || selectedOwner.rejection_reason || 'Verification documents did not meet requirements.'}</span>
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{selectedOwner.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{selectedOwner.phone || '+91 98900 11223'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{selectedOwner.city || 'Pune'}, Maharashtra</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner & Subscription Credentials</p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Subscription:</span>
                  <strong className="text-emerald-400 font-bold">{selectedOwner.activePlan || 'Owner Pro Plan'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Registered Vehicles:</span>
                  <span className="text-slate-100 font-bold">{selectedOwner.fleetCount || 3} Vehicles</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Verification Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedOwner.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    selectedOwner.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {selectedOwner.status === 'APPROVED' ? 'VERIFIED & ACTIVE' : selectedOwner.status === 'REJECTED' ? 'REJECTED' : 'UNDER REVIEW'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Registration Date:</span>
                  <span className="text-slate-300">{selectedOwner.createdAt ? new Date(selectedOwner.createdAt).toLocaleDateString() : 'August 2026'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStatusPromptOwner(selectedOwner);
                  setNewStatus(selectedOwner.status === 'APPROVED' ? 'REJECTED' : 'APPROVED');
                  setStatusReason('');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  selectedOwner.status === 'APPROVED'
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
                }`}
              >
                {selectedOwner.status === 'APPROVED' ? 'Suspend Owner Account' : 'Activate Owner Account'}
              </button>

              <button
                onClick={() => setSelectedOwner(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS UPDATE PROMPT MODAL */}
      {statusPromptOwner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-100">
                Update Owner Status: {statusPromptOwner.name || statusPromptOwner.fullName}
              </h3>
              <button onClick={() => setStatusPromptOwner(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="APPROVED">APPROVED (Active & Listed)</option>
                  <option value="REJECTED">REJECTED (Suspended / Inactive)</option>
                  <option value="PENDING">PENDING (Under Audit)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for status change..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStatusPromptOwner(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateOwnerStatus}
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

export default AdminOwners;
