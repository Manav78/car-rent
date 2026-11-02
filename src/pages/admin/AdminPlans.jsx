import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  X, 
  Edit3, 
  Trash2, 
  Percent, 
  Car, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const AdminPlans = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Plan Creation / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    monthlyPrice: '',
    annualPrice: '',
    maxVehicles: '',
    commissionPercent: '8',
    description: '',
    featuresText: '',
    isPopular: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSubscriptionPlans();
      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
      showToast('Failed to load subscription plans.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      monthlyPrice: '1499',
      annualPrice: '14999',
      maxVehicles: '8',
      commissionPercent: '8',
      description: 'Comprehensive tier for vehicle rental owners.',
      featuresText: 'List up to 8 Vehicles\nPriority Driver Dispatch\n24/7 Live GPS Telemetry\nDedicated Support',
      isPopular: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      monthlyPrice: plan.monthlyPrice || plan.price?.replace(/[^0-9]/g, '') || '1999',
      annualPrice: plan.annualPrice || '19999',
      maxVehicles: plan.maxVehicles || '10',
      commissionPercent: plan.commissionPercent || '8',
      description: plan.description || '',
      featuresText: (plan.features || []).join('\n'),
      isPopular: !!plan.isPopular,
      isActive: plan.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.monthlyPrice || !formData.maxVehicles) {
      showToast('Please provide plan name, price, and vehicle capacity.', 'warning');
      return;
    }

    setSubmitting(true);
    const features = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      monthlyPrice: Number(formData.monthlyPrice),
      annualPrice: Number(formData.annualPrice) || Number(formData.monthlyPrice) * 10,
      price: `₹${Number(formData.monthlyPrice).toLocaleString('en-IN')} / mo`,
      maxVehicles: Number(formData.maxVehicles),
      commissionPercent: Number(formData.commissionPercent) || 8,
      description: formData.description.trim(),
      features,
      isPopular: formData.isPopular,
      isActive: formData.isActive,
    };

    try {
      if (editingPlan) {
        await adminApi.updateSubscriptionPlan(editingPlan.id, payload);
        showToast(`Subscription plan "${payload.name}" updated successfully!`, 'success');
      } else {
        await adminApi.createSubscriptionPlan(payload);
        showToast(`🎉 New subscription plan "${payload.name}" created! Available for owners now.`, 'success');
      }

      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Plan save failed:', err);
      showToast('Failed to save subscription plan. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePlanStatus = async (plan) => {
    try {
      const updated = !plan.isActive;
      await adminApi.updateSubscriptionPlan(plan.id, { isActive: updated });
      showToast(`Plan "${plan.name}" is now ${updated ? 'Active' : 'Disabled'}.`, 'info');
      fetchPlans();
    } catch (err) {
      console.error('Toggle failed:', err);
      showToast('Failed to toggle plan status.', 'error');
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      await adminApi.deleteSubscriptionPlan(deletingPlan.id);
      showToast(`Subscription plan "${deletingPlan.name}" deleted successfully!`, 'success');
      setDeletingPlan(null);
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
      showToast('Failed to delete subscription plan.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Monetization & Plans Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Subscription Plans Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, configure, edit, and delete subscription tiers for vehicle owners across the platform.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading subscription plans...</div>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Subscription Plans Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "Create New Plan" to create the first tier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all relative ${
                plan.isActive !== false ? 'border-slate-800' : 'border-slate-800/40 opacity-60 bg-slate-950/40'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg">
                  POPULAR
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-100">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    plan.isActive !== false ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {plan.isActive !== false ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-100">
                      ₹{plan.monthlyPrice || plan.price?.replace(/[^0-9]/g, '') || 999}
                    </span>
                    <span className="text-xs text-slate-400"> / mo</span>
                  </div>
                  <span className="text-xs font-semibold text-rose-400">
                    {plan.commissionPercent || 8}% Comm.
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Max Vehicle Limit:</span>
                  <strong className="text-slate-200">{plan.maxVehicles >= 900 ? 'Unlimited' : `${plan.maxVehicles} Cars`}</strong>
                </div>

                <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  {(plan.features || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => handleTogglePlanStatus(plan)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    plan.isActive !== false
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {plan.isActive !== false ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                  <span>{plan.isActive !== false ? 'Active' : 'Disabled'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="p-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-colors"
                    title="Edit Plan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPlan(plan)}
                    className="p-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PLAN MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-extrabold text-slate-100">
                  {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Subscription Plan'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Plan Title / Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electric Vehicle Tier, City Starter"
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    placeholder="1499"
                    required
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Annual Price (₹)</label>
                  <input
                    type="number"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })}
                    placeholder="14999"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Max Vehicles Limit *</label>
                  <input
                    type="number"
                    value={formData.maxVehicles}
                    onChange={(e) => setFormData({ ...formData, maxVehicles: e.target.value })}
                    placeholder="5 (use 999 for unlimited)"
                    required
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Platform Commission (%)</label>
                  <input
                    type="number"
                    value={formData.commissionPercent}
                    onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                    placeholder="8"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Plan Short Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Target audience & vehicle capacity summary"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Plan Features (One feature per line)</label>
                <textarea
                  rows={4}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="List up to 5 Vehicles&#10;Priority Driver Dispatch&#10;24/7 Dedicated Support"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded accent-rose-500"
                  />
                  <span className="font-semibold text-slate-300">Mark as Popular Tier</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="font-semibold text-slate-300">Active for Owners</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30"
                >
                  {submitting ? 'Saving Plan...' : editingPlan ? 'Save Changes' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PLAN CONFIRMATION MODAL */}
      {deletingPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/15 rounded-2xl border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">Delete Subscription Plan?</h3>
                <p className="text-xs text-slate-400">This tier will be removed platform-wide.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete <strong className="text-white">{deletingPlan.name}</strong> ({deletingPlan.price})? Owners will no longer be able to select this tier.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeletingPlan(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
