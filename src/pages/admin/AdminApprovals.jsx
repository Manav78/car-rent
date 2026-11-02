import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Car, 
  ShieldAlert, 
  Eye, 
  FileCheck, 
  MapPin, 
  Users, 
  Fuel, 
  Calendar,
  Phone,
  Mail,
  Building,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const AdminApprovals = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('VEHICLES'); // 'VEHICLES' | 'DRIVERS' | 'OWNERS'
  const [owners, setOwners] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // Inspection Dossier Modal state
  const [inspectingItem, setInspectingItem] = useState(null); // { type: 'VEHICLE'|'DRIVER'|'OWNER_DRIVER', item: {...} }
  const [inspectingDetail, setInspectingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Rejection Modal state
  const [rejectionTarget, setRejectionTarget] = useState(null); // { type: 'VEHICLE'|'DRIVER'|'OWNER_DRIVER', item: {...} }
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const [oRes, dRes, vRes] = await Promise.allSettled([
        adminApi.getPendingOwners({ bypassCache: true }),
        adminApi.getPendingDrivers({ bypassCache: true }),
        adminApi.getPendingVehicles({ bypassCache: true }),
      ]);

      if (oRes.status === 'fulfilled' && Array.isArray(oRes.value)) setOwners(oRes.value);
      if (dRes.status === 'fulfilled' && Array.isArray(dRes.value)) setDrivers(dRes.value);
      if (vRes.status === 'fulfilled' && Array.isArray(vRes.value)) setVehicles(vRes.value);
    } catch (err) {
      console.error('Failed to fetch approval queues:', err);
      showToast('Failed to load pending approvals queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const handleOpenDossier = async (type, item) => {
    const rawId = item.driverProfileId || item.driverId || item.vehicleId || item.ownerId || item.id || item.userId;
    setInspectingItem({ type, item: { ...item, id: rawId } });
    setInspectingDetail(null);
    setLoadingDetail(true);

    try {
      let detail = null;
      if (type === 'OWNER' || type === 'OWNER_DRIVER') {
        if (item.driverProfileId) {
          detail = await adminApi.getOwnerDriverApprovalDetail(item.driverProfileId).catch(() => null);
        }
      } else if (type === 'DRIVER') {
        detail = await adminApi.getDriverApprovalDetail(rawId).catch(() => null);
      } else if (type === 'VEHICLE') {
        detail = await adminApi.getVehicleApprovalDetail(rawId).catch(() => null);
      }
      if (detail && typeof detail === 'object') {
        setInspectingDetail(detail);
      }
    } catch (err) {
      console.warn(`Could not load full detail for ${type} #${rawId}:`, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (type, id, item = null) => {
    setActionId(id);
    try {
      if (type === 'VEHICLE') {
        await adminApi.approveVehicle(id);
        setVehicles((prev) => prev.filter((v) => (v.vehicleId || v.id) !== id));
        showToast(`Vehicle #${id} successfully approved!`, 'success');
      } else if (type === 'DRIVER') {
        await adminApi.approveDriver(id);
        setDrivers((prev) => prev.filter((d) => (d.driverId || d.userId || d.id) !== id));
        showToast(`Driver #${id} successfully approved!`, 'success');
      } else if (type === 'OWNER' || type === 'OWNER_DRIVER') {
        await adminApi.approveOwner(item || id);
        setOwners((prev) => prev.filter((o) => (o.driverProfileId || o.ownerId || o.userId || o.id) !== id));
        showToast(`Owner application #${id} successfully approved!`, 'success');
      }
      if (inspectingItem && (inspectingItem.item.id === id || inspectingItem.item.vehicleId === id || inspectingItem.item.driverId === id || inspectingItem.item.driverProfileId === id || inspectingItem.item.ownerId === id)) {
        setInspectingItem(null);
      }
      await fetchPendingData();
    } catch (err) {
      console.error('Approval failed:', err);
      showToast(`Failed to approve ${type.toLowerCase()} #${id}. Please try again.`, 'error');
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (type, item) => {
    setRejectionTarget({ type, item });
    setRejectionReason('');
    setRejectionError('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Mandatory rejection reason is required (SRS Section 58 & 61).');
      return;
    }

    const { type, item } = rejectionTarget;
    const targetId = item.driverProfileId || item.driverId || item.vehicleId || item.id || item.userId;
    setActionId(targetId);

    try {
      if (type === 'VEHICLE') {
        await adminApi.rejectVehicle(targetId, rejectionReason.trim());
        setVehicles((prev) => prev.filter((v) => (v.vehicleId || v.id) !== targetId));
        showToast(`Vehicle #${targetId} rejected. Reason: "${rejectionReason.trim()}"`, 'info');
      } else if (type === 'DRIVER') {
        await adminApi.rejectDriver(targetId, rejectionReason.trim());
        setDrivers((prev) => prev.filter((d) => (d.driverId || d.userId || d.id) !== targetId));
        showToast(`Driver #${targetId} rejected. Reason: "${rejectionReason.trim()}"`, 'info');
      } else if (type === 'OWNER' || type === 'OWNER_DRIVER') {
        await adminApi.rejectOwner(item || targetId, rejectionReason.trim());
        setOwners((prev) => prev.filter((o) => (o.driverProfileId || o.ownerId || o.userId || o.id) !== targetId));
        showToast(`Owner #${targetId} rejected. Reason: "${rejectionReason.trim()}"`, 'info');
      }

      setRejectionTarget(null);
      if (inspectingItem && (inspectingItem.item.id === targetId || inspectingItem.item.vehicleId === targetId || inspectingItem.item.driverId === targetId || inspectingItem.item.driverProfileId === targetId || inspectingItem.item.ownerId === targetId)) {
        setInspectingItem(null);
      }
      await fetchPendingData();
    } catch (err) {
      console.error('Rejection failed:', err);
      showToast(`Failed to reject ${type.toLowerCase()} #${targetId}.`, 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin Verification Terminal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            System Approvals & Document Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect RC documents, driver licenses, vehicle photos, and approve or reject platform onboarding requests.
          </p>
        </div>

        <button
          onClick={fetchPendingData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Verification Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('VEHICLES')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'VEHICLES'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Approvals ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'DRIVERS'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Driver Approvals ({drivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OWNERS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'OWNERS'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Owner Approvals ({owners.length})</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Fleet & Dual-Role</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading verification queues...</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* VEHICLES TAB TABLE */}
          {activeTab === 'VEHICLES' && (
            vehicles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No pending vehicle approvals found.</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Brand & Model</th>
                    <th className="py-3.5 px-4">Number Plate</th>
                    <th className="py-3.5 px-4">Owner</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Tariff</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vehicles.map((v) => {
                    const vehId = v.vehicleId || v.id;
                    const vehTitle = v.vehicleName || `${v.brand || ''} ${v.model || ''}`.trim() || v.name || 'Vehicle';
                    const vehPlate = v.vehicleNumber || v.licensePlate || 'MH-01-XX-0000';
                    const ownerName = v.ownerFullName || v.ownerName || 'Vehicle Owner';
                    const city = v.location || v.city || 'Pune';
                    const tariff = v.ratePerKm || v.pricePerKm || 18;

                    return (
                      <tr key={vehId} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">#{vehId}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{vehTitle}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-400">{vehPlate}</td>
                        <td className="py-3.5 px-4 text-slate-400">{ownerName}</td>
                        <td className="py-3.5 px-4 text-slate-400">{city}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">₹{tariff} / KM</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenDossier('VEHICLE', { ...v, id: vehId, name: vehTitle, vehicleNumber: vehPlate })}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={() => openRejectModal('VEHICLE', { ...v, id: vehId })}
                            disabled={actionId === vehId}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove('VEHICLE', vehId)}
                            disabled={actionId === vehId}
                            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {/* DRIVERS TAB TABLE */}
          {activeTab === 'DRIVERS' && (
            drivers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No pending driver approvals found.</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Driver Name</th>
                    <th className="py-3.5 px-4">License Number</th>
                    <th className="py-3.5 px-4">License Expiry</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {drivers.map((d) => {
                    const drivId = d.driverId || d.userId || d.id;
                    const drivName = d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.name || 'Driver';
                    const licenseNo = d.licenseNumber || d.drivingLicenseNumber || 'DL-MH-PENDING';
                    const expiry = d.licenseExpiryDate || d.licenseExpiry || '2030-12-31';

                    return (
                      <tr key={drivId} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">#{drivId}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{drivName}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-400">{licenseNo}</td>
                        <td className="py-3.5 px-4 text-slate-400">{expiry}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenDossier('DRIVER', { ...d, id: drivId, name: drivName })}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={() => openRejectModal('DRIVER', { ...d, id: drivId })}
                            disabled={actionId === drivId}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove('DRIVER', drivId)}
                            disabled={actionId === drivId}
                            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {/* OWNERS TAB TABLE */}
          {activeTab === 'OWNERS' && (
            owners.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No pending owner applications found.</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Profile ID</th>
                    <th className="py-3.5 px-4">Owner & Fleet</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Role Type</th>
                    <th className="py-3.5 px-4">Driving License</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {owners.map((o) => {
                    const ownId = o.driverProfileId || o.ownerId || o.userId || o.id;
                    const ownName = o.fullName || `${o.firstName || ''} ${o.lastName || ''}`.trim() || o.businessName || o.name || 'Vehicle Owner';
                    const fleetName = o.businessName || (o.name ? `${o.name}'s Fleet` : 'Owner Agency Fleet');
                    const email = o.email || o.ownerEmail || 'owner@carrental.com';
                    const phone = o.mobileNumber || o.phone || '+91 98765 00000';
                    const isDualRole = Boolean(o.isOwnerDriver || o.driverProfileId || (o.licenseNumber && !o.licenseNumber.includes('N/A')));
                    const licenseNo = isDualRole ? (o.licenseNumber || o.drivingLicenseNumber || 'MH-12-PENDING') : 'N/A (Fleet Host)';
                    const expiry = isDualRole ? (o.licenseExpiryDate || o.licenseExpiry || '2032-12-31') : 'N/A';
                    const regDate = o.submittedAt || o.createdAt ? new Date(o.submittedAt || o.createdAt).toLocaleDateString() : 'Recent';

                    return (
                      <tr key={ownId} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">#{ownId}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-100 block">{ownName}</span>
                          <span className="text-[11px] text-blue-400 font-medium">{fleetName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300">{email}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isDualRole ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Owner-Driver
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Fleet Host
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-purple-400 font-bold">
                          {licenseNo}
                          {isDualRole && expiry !== 'N/A' && (
                            <span className="block text-[10px] font-normal text-slate-400">Exp: {expiry}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{regDate}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenDossier('OWNER', { ...o, id: ownId, fullName: ownName, name: ownName, businessName: fleetName, email, mobileNumber: phone, licenseNumber: licenseNo, licenseExpiryDate: expiry, isDualRole })}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={() => openRejectModal('OWNER', o)}
                            disabled={actionId === ownId}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove('OWNER', ownId, o)}
                            disabled={actionId === ownId}
                            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow cursor-pointer"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {/* INSPECTION DOSSIER MODAL */}
      {inspectingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-100">
                    Verification Dossier: {inspectingItem.type} #{inspectingItem.item.id}
                  </h3>
                  <p className="text-xs text-slate-400">Inspect all uploaded documents and identity credentials.</p>
                </div>
              </div>
              <button onClick={() => setInspectingItem(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VEHICLE INSPECTION DOSSIER */}
            {inspectingItem.type === 'VEHICLE' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                    <h4 className="font-extrabold text-slate-100 text-sm mt-0.5">{inspectingItem.item.brand} {inspectingItem.item.model}</h4>
                    <p className="text-blue-400 font-mono font-bold">{inspectingItem.item.vehicleNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Owner & City</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{inspectingItem.item.ownerName || 'Apex Auto Rentals'}</p>
                    <p className="text-slate-400">{inspectingItem.item.city || 'Pune'}, {inspectingItem.item.state || 'Maharashtra'}</p>
                  </div>
                </div>

                {/* RC Documents */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Registration Certificate (RC) Documents</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">RC Certificate (Front)</span>
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={inspectingItem.item.rcFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'} alt="RC Front" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">RC Certificate (Back)</span>
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={inspectingItem.item.rcBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80'} alt="RC Back" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle 4-Angle Photos */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Vehicle Exterior & Interior Photos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                      <img src={inspectingItem.item.images?.front || inspectingItem.item.imageUrl} alt="Front" className="w-full h-full object-cover" />
                    </div>
                    <div className="h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                      <img src={inspectingItem.item.images?.back || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80'} alt="Back" className="w-full h-full object-cover" />
                    </div>
                    <div className="h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                      <img src={inspectingItem.item.images?.side || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&auto=format&fit=crop&q=80'} alt="Side" className="w-full h-full object-cover" />
                    </div>
                    <div className="h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                      <img src={inspectingItem.item.images?.interior || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80'} alt="Interior" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DRIVER INSPECTION DOSSIER */}
            {inspectingItem.type === 'DRIVER' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Driver Name</span>
                    <h4 className="font-extrabold text-slate-100 text-sm mt-0.5">{inspectingItem.item.name}</h4>
                    <p className="text-purple-400 font-mono font-bold">{inspectingItem.item.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">License Details</span>
                    <p className="font-mono text-slate-200 font-bold mt-0.5">{inspectingItem.item.drivingLicenseNumber || inspectingItem.item.licenseNumber || 'MH-12-REG'}</p>
                    <p className="text-slate-400">Expiry Date: {inspectingItem.item.licenseExpiryDate || inspectingItem.item.licenseExpiry || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-400" />
                    <span>Driving License Front & Back Images</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">License (Front)</span>
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={inspectingItem.item.licenseFrontImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'} alt="License Front" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">License (Back)</span>
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={inspectingItem.item.licenseBackImage || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80'} alt="License Back" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OWNER-DRIVER INSPECTION DOSSIER */}
            {(inspectingItem.type === 'OWNER' || inspectingItem.type === 'OWNER_DRIVER') && (
              <div className="space-y-4 text-xs">
                {loadingDetail && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading verified credentials and compliance audit history...</span>
                  </div>
                )}

                {(() => {
                  const merged = { ...inspectingItem.item, ...inspectingDetail };
                  const name = merged.fullName || merged.name || 'Owner-Driver';
                  const fleet = merged.businessName || (merged.name ? `${merged.name}'s Fleet` : 'Owner Agency Fleet');
                  const email = merged.email || 'N/A';
                  const phone = merged.mobileNumber || merged.phone || 'N/A';
                  const licenseNo = merged.licenseNumber || merged.drivingLicenseNumber || 'MH-12-PENDING';
                  const expiry = merged.licenseExpiryDate || merged.licenseExpiry || '2032-12-31';
                  const docs = Array.isArray(merged.documents) ? merged.documents : [];
                  const history = Array.isArray(merged.approvalHistory) ? merged.approvalHistory : [];

                  return (
                    <>
                      {/* Identity & Business Profile */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Owner-Driver Profile</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/30">
                              Dual-Role Active
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-100 text-sm mt-0.5">{name}</h4>
                          <p className="text-blue-400 font-semibold">{fleet}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">Profile #{merged.driverProfileId || merged.id} • User #{merged.userId || merged.id}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Credentials</span>
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="font-mono">{phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Commercial Driving License */}
                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Commercial Driving License (Self-Driving Privileges)</span>
                            <p className="font-mono text-purple-400 font-bold text-sm mt-0.5">{licenseNo}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">License Expiry</span>
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 text-xs font-bold inline-block mt-0.5">
                              {expiry}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Verification Documents */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <span>Submitted Verification Documents</span>
                        </h4>
                        {docs.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {docs.map((doc, idx) => (
                              <div key={doc.documentId || doc.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-300 uppercase block truncate">
                                    {(doc.documentType || doc.type || 'DOCUMENT').replace(/_/g, ' ')}
                                  </span>
                                  {doc.isPrimary && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                  <img
                                    src={doc.fileUrl || doc.url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'}
                                    alt={doc.documentType || 'Doc'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Commercial Driving License</span>
                              <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80" alt="License Front" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Government Identity Document (Aadhaar)</span>
                              <div className="h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                <img src="https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80" alt="Identity Proof" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prior Decision & Audit History */}
                      {history.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Approval Audit Trail</h4>
                          <div className="bg-slate-950 rounded-xl border border-slate-800 p-2.5 space-y-2">
                            {history.map((h, hIdx) => (
                              <div key={h.approvalId || hIdx} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                                <div>
                                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] mr-2 ${
                                    h.decision === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {h.decision}
                                  </span>
                                  <span className="text-slate-300">{h.reason || 'Decision recorded'}</span>
                                </div>
                                <span className="text-slate-500 font-mono text-[10px]">
                                  {h.decidedBy || 'Admin'} • {h.decidedAt ? new Date(h.decidedAt).toLocaleDateString() : 'Recent'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close Dossier
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => openRejectModal(inspectingItem.type, inspectingItem.item)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleApprove(inspectingItem.type, inspectingItem.item.id)}
                  disabled={actionId === inspectingItem.item.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  Approve Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL WITH MANDATORY REASON (SRS Section 58 & 61) */}
      {rejectionTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-400">
                Reject {rejectionTarget.type} #{rejectionTarget.item.id}
              </h3>
              <button onClick={() => setRejectionTarget(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{rejectionError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mandatory Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State specific reason for rejection (e.g. License image unreadable, RC document expired, vehicle image blurry)..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectionTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionId === rejectionTarget.item.id}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30"
              >
                Reject Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
