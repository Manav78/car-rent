import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Mail, 
  Phone, 
  Lock, 
  Unlock, 
  Eye, 
  X, 
  UserCheck, 
  Building, 
  Navigation, 
  Shield, 
  UserX,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const PRESET_DELETE_REASONS = [
  'Account deactivated by user request',
  'Terms of Service / Compliance violation',
  'Fraudulent / suspicious account activity',
  'Inactivity / abandoned registration',
  'Administrative restructuring',
];

const AdminAccounts = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'deleted'
  const [loading, setLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Deleted Accounts State
  const [deletedAccounts, setDeletedAccounts] = useState([]);
  const [deletedSearch, setDeletedSearch] = useState('');

  // Modals
  const [softDeleteTarget, setSoftDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState(PRESET_DELETE_REASONS[0]);
  const [customDeleteReason, setCustomDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const [statusEditUser, setStatusEditUser] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    enabled: true,
    isActive: true,
    emailVerified: true,
    accountNonLocked: true,
  });

  const fetchUsersData = async (bypass = false) => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers({ bypassCache: bypass });
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Failed to load platform users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedData = async (bypass = false) => {
    try {
      setLoading(true);
      const data = await adminApi.getDeletedAccounts({ bypassCache: bypass, search: deletedSearch });
      if (Array.isArray(data)) {
        setDeletedAccounts(data);
      }
    } catch (err) {
      console.error('Failed to load deleted accounts:', err);
      showToast('Failed to load deleted accounts log.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAll = (bypass = false) => {
    if (activeTab === 'users') {
      fetchUsersData(bypass);
    } else {
      fetchDeletedData(bypass);
    }
  };

  useEffect(() => {
    loadAll();
  }, [activeTab]);

  // Soft Delete Handler
  const handleConfirmSoftDelete = async () => {
    if (!softDeleteTarget) return;
    const finalReason = customDeleteReason.trim() || deleteReason;
    try {
      setActionLoading(true);
      const userId = softDeleteTarget.id || softDeleteTarget.userId;
      await adminApi.softDeleteAccount(userId, finalReason);
      showToast(`Account #${userId} successfully deactivated and moved to deleted log.`, 'success');
      setSoftDeleteTarget(null);
      setCustomDeleteReason('');
      fetchUsersData(true);
    } catch (err) {
      console.error('Error soft-deleting account:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to soft-delete account.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Restore Account Handler
  const handleRestoreAccount = async (userId) => {
    try {
      setActionLoading(true);
      await adminApi.restoreAccount(userId);
      showToast(`Account #${userId} restored successfully.`, 'success');
      fetchDeletedData(true);
    } catch (err) {
      console.error('Error restoring account:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to restore account.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Permanent Delete Handler
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    try {
      setActionLoading(true);
      const userId = permanentDeleteTarget.userId || permanentDeleteTarget.id;
      await adminApi.permanentDeleteAccount(userId);
      showToast(`Account #${userId} permanently erased from database.`, 'success');
      setPermanentDeleteTarget(null);
      fetchDeletedData(true);
    } catch (err) {
      console.error('Error permanently deleting account:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to delete account permanently.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Status Handler
  const handleSaveUserStatus = async () => {
    if (!statusEditUser) return;
    try {
      setActionLoading(true);
      const userId = statusEditUser.id;
      await adminApi.toggleUserStatus(userId, statusFormData);
      showToast(`User #${userId} security flags updated successfully.`, 'success');
      setStatusEditUser(null);
      fetchUsersData(true);
    } catch (err) {
      console.error('Error updating user status:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to update user status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (u) => {
    setStatusEditUser(u);
    setStatusFormData({
      enabled: u.enabled ?? true,
      isActive: u.isActive ?? true,
      emailVerified: u.emailVerified ?? false,
      accountNonLocked: u.accountNonLocked ?? true,
    });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phoneNumber || u.phone || '').toLowerCase();
    const term = userSearch.toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term) || phone.includes(term);
    const roleStr = String(u.role || '').toUpperCase();
    const matchesRole = roleFilter === 'ALL' || roleStr.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  // Filtered Deleted Accounts
  const filteredDeleted = deletedAccounts.filter((a) => {
    const name = (a.fullName || '').toLowerCase();
    const email = (a.email || '').toLowerCase();
    const phone = (a.mobileNumber || '').toLowerCase();
    const reason = (a.deleteReason || '').toLowerCase();
    const term = deletedSearch.toLowerCase();

    return name.includes(term) || email.includes(term) || phone.includes(term) || reason.includes(term);
  });

  const getRoleBadge = (role) => {
    const r = String(role || '').toUpperCase();
    if (r.includes('ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Shield className="w-3 h-3" />
          ADMIN
        </span>
      );
    }
    if (r.includes('OWNER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <Building className="w-3 h-3" />
          OWNER
        </span>
      );
    }
    if (r.includes('DRIVER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-400 border border-purple-500/30">
          <Navigation className="w-3 h-3" />
          DRIVER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <Users className="w-3 h-3" />
        CUSTOMER
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform User Governance & Lifecycle</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">User Accounts & Recovery Log</h1>
          <p className="text-xs text-slate-400 mt-1">
            Govern registered platform users, toggle login credentials, soft-delete accounts, and restore deactivated users.
          </p>
        </div>

        <button
          onClick={() => loadAll(true)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 max-w-md gap-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Platform Users ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('deleted')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'deleted'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Deleted Accounts ({deletedAccounts.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ACTIVE PLATFORM USERS                              */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Role Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="OWNER">Owners</option>
                <option value="DRIVER">Drivers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
              Loading platform user records...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No user accounts found matching query.
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">User Details</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status & Flags</th>
                      <th className="py-3.5 px-4">Registered</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const fullName = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'User';
                      const isEnabled = u.enabled !== false && u.isActive !== false;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 font-black text-xs flex items-center justify-center">
                                {fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong className="text-slate-100 block">{fullName}</strong>
                                <span className="text-[11px] font-mono text-slate-400">UID #{u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200">{u.email}</div>
                            <div className="text-[11px] text-slate-400">{u.phoneNumber || u.phone || 'No phone'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getRoleBadge(u.role)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isEnabled
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {isEnabled ? 'ACTIVE' : 'DISABLED'}
                              </span>
                              {u.emailVerified && (
                                <span className="text-[10px] text-emerald-400" title="Email Verified">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => openStatusModal(u)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              title="Toggle User Credentials & Lock"
                            >
                              <Lock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Status</span>
                            </button>

                            <button
                              onClick={() => setSoftDeleteTarget(u)}
                              className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              title="Soft-Delete User Account"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DELETED ACCOUNTS & RESTORATION LOG                 */}
      {/* ========================================================= */}
      {activeTab === 'deleted' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deleted accounts by name, email, deletion reason..."
                value={deletedSearch}
                onChange={(e) => setDeletedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Deleted Accounts Table */}
          {loading ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
              Loading deleted account logs...
            </div>
          ) : filteredDeleted.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-slate-200 font-bold">No Soft-Deleted Accounts</p>
              <p className="text-slate-500 text-[11px]">All platform accounts are in good standing.</p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Account Dossier</th>
                      <th className="py-3.5 px-4">Origin & Roles</th>
                      <th className="py-3.5 px-4">Deletion Reason</th>
                      <th className="py-3.5 px-4">Deleted By & At</th>
                      <th className="py-3.5 px-4 text-right">Recovery Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredDeleted.map((a) => (
                      <tr key={a.userId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-black text-xs flex items-center justify-center">
                              {a.fullName ? a.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <strong className="text-slate-200 block line-through decoration-rose-500">{a.fullName}</strong>
                              <span className="text-[11px] text-slate-400">{a.email}</span>
                              {a.mobileNumber && <span className="text-[11px] text-slate-500 block">{a.mobileNumber}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {a.accountOrigin || 'PORTAL'}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {Array.isArray(a.roles) ? a.roles.join(', ') : a.roles || 'USER'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl text-[11px] leading-relaxed">
                            {a.deleteReason || 'No specific reason recorded.'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          <div className="text-slate-200 font-bold">{a.deletedByName || 'Admin'}</div>
                          <div className="text-slate-400 font-mono">
                            {a.deletedAt ? new Date(a.deletedAt).toLocaleString() : 'Recent'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleRestoreAccount(a.userId)}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                            title="Restore Account Immediately"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() => setPermanentDeleteTarget(a)}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/40 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            title="Permanently Purge from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SOFT DELETE REASON PROMPT                        */}
      {/* ========================================================= */}
      {softDeleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold text-slate-100">Soft-Delete User Account</h3>
              </div>
              <button onClick={() => setSoftDeleteTarget(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Deactivating <strong className="text-slate-100">{softDeleteTarget.fullName || softDeleteTarget.email}</strong> (UID #{softDeleteTarget.id}) will disable their platform credentials and move them into the restoration queue.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Preset Deactivation Reason
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {PRESET_DELETE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Custom Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide additional context or audit comments..."
                  value={customDeleteReason}
                  onChange={(e) => setCustomDeleteReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSoftDeleteTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftDelete}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Deactivation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PERMANENT PURGE CONFIRMATION                     */}
      {/* ========================================================= */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-500">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold text-slate-100">Permanent Database Purge</h3>
              </div>
              <button onClick={() => setPermanentDeleteTarget(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 leading-relaxed">
                ⚠️ <strong>WARNING:</strong> This action is permanent and completely irreversible. All user credentials and audit logs for <strong className="text-white">{permanentDeleteTarget.fullName}</strong> will be permanently wiped.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: EDIT USER CREDENTIALS & SECURITY FLAGS           */}
      {/* ========================================================= */}
      {statusEditUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Lock className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold text-slate-100">User Security Flags</h3>
              </div>
              <button onClick={() => setStatusEditUser(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-400">
                Update Spring Security account status flags for <strong className="text-slate-100">{statusEditUser.fullName || statusEditUser.email}</strong>.
              </p>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-200">Account Enabled</span>
                  <input
                    type="checkbox"
                    checked={statusFormData.enabled}
                    onChange={(e) => setStatusFormData({ ...statusFormData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-200">Is Active</span>
                  <input
                    type="checkbox"
                    checked={statusFormData.isActive}
                    onChange={(e) => setStatusFormData({ ...statusFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-200">Email Verified</span>
                  <input
                    type="checkbox"
                    checked={statusFormData.emailVerified}
                    onChange={(e) => setStatusFormData({ ...statusFormData, emailVerified: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-200">Account Non-Locked</span>
                  <input
                    type="checkbox"
                    checked={statusFormData.accountNonLocked}
                    onChange={(e) => setStatusFormData({ ...statusFormData, accountNonLocked: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStatusEditUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserStatus}
                disabled={actionLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
