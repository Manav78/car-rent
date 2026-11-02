import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  Phone, 
  Mail, 
  Eye, 
  X, 
  Building,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const AdminDrivers = () => {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'OWNER_DRIVER' | 'FLEET_DRIVER' | 'ACTIVE' | 'INACTIVE'
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDrivers = async (bypass = false) => {
    try {
      setLoading(true);
      const data = await adminApi.getAllDrivers({ bypassCache: bypass });
      if (Array.isArray(data)) {
        setDrivers(data);
      }
    } catch (err) {
      console.error('Failed to fetch platform drivers:', err);
      showToast('Failed to load drivers directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleStatus = async (driver, targetStatus) => {
    const drivId = driver.driverId || driver.id || driver.userId;
    setUpdatingId(drivId);
    try {
      await adminApi.updateDriverStatus(drivId, targetStatus, `Status updated to ${targetStatus} by administrator`);
      showToast(`Driver #${drivId} status updated to ${targetStatus}!`, 'success');
      setDrivers((prev) =>
        prev.map((d) => {
          if ((d.driverId || d.id || d.userId) === drivId) {
            return { ...d, operationalStatus: targetStatus, status: targetStatus };
          }
          return d;
        })
      );
      if (selectedDriver && (selectedDriver.driverId || selectedDriver.id || selectedDriver.userId) === drivId) {
        setSelectedDriver((prev) => ({ ...prev, operationalStatus: targetStatus, status: targetStatus }));
      }
    } catch (err) {
      console.error('Failed to update driver status:', err);
      showToast(`Failed to update driver #${drivId} status.`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const isDualRole = (d) => {
    return Boolean(
      d.isOwnerDriver ||
      d.role === 'ROLE_OWNER_DRIVER' ||
      (d.managingOwnerName && d.fullName && d.managingOwnerName.toLowerCase().includes(d.fullName.toLowerCase())) ||
      d.managingOwnerName === 'Self-Employed' ||
      d.managingOwnerName === 'Self-Managing'
    );
  };

  const getDriverOperationalStatus = (d) => {
    const s = String(d.operationalStatus || d.status || 'AVAILABLE').toUpperCase();
    if (s === 'ACTIVE' || s === 'AVAILABLE') return 'AVAILABLE';
    if (s === 'BUSY' || s === 'ON_TRIP') return 'BUSY';
    if (s === 'SUSPENDED' || s === 'INACTIVE' || s === 'DISABLED') return 'INACTIVE';
    return s;
  };

  const filteredDrivers = drivers.filter((d) => {
    const name = d.fullName || d.name || '';
    const email = d.email || '';
    const phone = d.mobileNumber || d.phone || '';
    const license = d.licenseNumber || d.drivingLicenseNumber || '';
    const owner = d.managingOwnerName || d.ownerName || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.toLowerCase().includes(searchTerm.toLowerCase());

    const dualRole = isDualRole(d);
    const opStatus = getDriverOperationalStatus(d);

    let matchesFilter = true;
    if (roleFilter === 'OWNER_DRIVER') matchesFilter = dualRole;
    else if (roleFilter === 'FLEET_DRIVER') matchesFilter = !dualRole;
    else if (roleFilter === 'ACTIVE') matchesFilter = opStatus === 'AVAILABLE' || opStatus === 'BUSY';
    else if (roleFilter === 'INACTIVE') matchesFilter = opStatus === 'INACTIVE' || opStatus === 'OFFLINE';

    return matchesSearch && matchesFilter;
  });

  const totalDualRole = drivers.filter((d) => isDualRole(d)).length;
  const totalActive = drivers.filter((d) => {
    const s = getDriverOperationalStatus(d);
    return s === 'AVAILABLE' || s === 'BUSY';
  }).length;
  const totalInactive = drivers.filter((d) => {
    const s = getDriverOperationalStatus(d);
    return s === 'INACTIVE' || s === 'OFFLINE';
  }).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-bold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Platform Drivers & Owner-Drivers Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Platform Drivers Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin terminal for monitoring fleet drivers, dual-role owner-drivers, compliance licenses, and operational dispatch statuses.
          </p>
        </div>

        <button
          onClick={() => fetchDrivers(true)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Drivers</p>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{drivers.length}</h3>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-400">Active / Available</p>
          <h3 className="text-2xl font-extrabold text-emerald-300 mt-1">{totalActive}</h3>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-400">Dual-Role Owner-Drivers</p>
          <h3 className="text-2xl font-extrabold text-blue-300 mt-1">{totalDualRole}</h3>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-400">Offline / Suspended</p>
          <h3 className="text-2xl font-extrabold text-amber-300 mt-1">{totalInactive}</h3>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by driver, email, license, or owner..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Drivers ({drivers.length})</option>
            <option value="OWNER_DRIVER">Dual-Role Owner-Drivers ({totalDualRole})</option>
            <option value="FLEET_DRIVER">Fleet Drivers ({drivers.length - totalDualRole})</option>
            <option value="ACTIVE">Active & Available ({totalActive})</option>
            <option value="INACTIVE">Offline & Suspended ({totalInactive})</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading platform drivers directory...</span>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Drivers Found</h3>
          <p className="text-xs text-slate-400">No drivers matched your search and filter criteria.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Driver Name & Role</th>
                  <th className="py-3.5 px-4">Managing Fleet / Owner</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Commercial License</th>
                  <th className="py-3.5 px-4">License Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDrivers.map((d) => {
                  const drivId = d.driverId || d.id || d.userId;
                  const drivName = d.fullName || d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Platform Driver';
                  const ownerName = d.managingOwnerName || d.ownerName || (isDualRole(d) ? `${drivName} (Self-Managing)` : 'Apex Auto Rentals');
                  const ownerEmail = d.managingOwnerEmail || d.ownerEmail || '';
                  const contactPhone = d.mobileNumber || d.phone || d.phoneNumber || '+91 98765 43210';
                  const licenseNo = d.licenseNumber || d.drivingLicenseNumber || 'MH-12-2024-DRV';
                  const expiry = d.licenseExpiryDate || d.licenseExpiry || '2030-12-31';
                  const dual = isDualRole(d);
                  const opStatus = getDriverOperationalStatus(d);
                  const isSuspended = opStatus === 'INACTIVE' || opStatus === 'SUSPENDED';

                  return (
                    <tr key={drivId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center border ${
                            dual
                              ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                              : 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                          }`}>
                            {drivName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-slate-100 block">{drivName}</strong>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {dual ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                                  <Building className="w-2.5 h-2.5" />
                                  <span>Owner-Driver</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                                  <UserCheck className="w-2.5 h-2.5" />
                                  <span>Fleet Driver</span>
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono">#{drivId}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-semibold text-slate-200">{ownerName}</div>
                        {ownerEmail && <div className="text-[11px] text-slate-400">{ownerEmail}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{d.email}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{contactPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-400 font-bold">{licenseNo}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{expiry}</td>
                      <td className="py-3.5 px-4">
                        {opStatus === 'AVAILABLE' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            AVAILABLE
                          </span>
                        ) : opStatus === 'BUSY' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-blue-500/15 text-blue-400 border-blue-500/30">
                            ON TRIP
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-rose-500/15 text-rose-400 border-rose-500/30">
                            OFFLINE / SUSPENDED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {isSuspended ? (
                          <button
                            onClick={() => handleToggleStatus(d, 'ACTIVE')}
                            disabled={updatingId === drivId}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(d, 'INACTIVE')}
                            disabled={updatingId === drivId}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedDriver({ ...d, name: drivName, ownerName, phone: contactPhone, licenseNo, expiry, dual, opStatus })}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Dossier</span>
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

      {/* DRIVER DETAILS MODAL */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center border ${
                  selectedDriver.dual
                    ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                    : 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                }`}>
                  {selectedDriver.name ? selectedDriver.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">{selectedDriver.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedDriver.dual ? 'Dual-Role Owner-Driver' : 'Dedicated Fleet Driver'} • ID #{selectedDriver.driverId || selectedDriver.id}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{selectedDriver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono">{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Building className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Managing Fleet: <strong>{selectedDriver.ownerName}</strong></span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance & License Dossier</p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Commercial License:</span>
                  <strong className="text-purple-400 font-mono font-bold">{selectedDriver.licenseNo}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">License Validity:</span>
                  <span className="text-slate-200 font-mono">{selectedDriver.expiry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Operational Dispatch:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedDriver.opStatus === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    selectedDriver.opStatus === 'BUSY' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {selectedDriver.opStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Dual Role Privileges:</span>
                  <span className="text-slate-100 font-semibold">
                    {selectedDriver.dual ? 'Owner & Driver (Self-Driving Enabled)' : 'Driver Only'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => handleToggleStatus(
                  selectedDriver,
                  selectedDriver.opStatus === 'INACTIVE' || selectedDriver.opStatus === 'SUSPENDED' ? 'ACTIVE' : 'INACTIVE'
                )}
                disabled={updatingId === (selectedDriver.driverId || selectedDriver.id)}
                className={`px-4 py-2 font-bold text-xs rounded-xl border cursor-pointer ${
                  selectedDriver.opStatus === 'INACTIVE' || selectedDriver.opStatus === 'SUSPENDED'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                }`}
              >
                {selectedDriver.opStatus === 'INACTIVE' || selectedDriver.opStatus === 'SUSPENDED' ? 'Activate Driver' : 'Suspend Driver'}
              </button>

              <button
                onClick={() => setSelectedDriver(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;
