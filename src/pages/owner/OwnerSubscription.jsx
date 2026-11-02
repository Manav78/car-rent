import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Car, 
  Percent, 
  Zap, 
  Download,
  AlertCircle,
  Clock,
  ChevronRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import { useToast } from '../../context/ToastContext';

const OwnerSubscription = () => {
  const { showToast } = useToast();

  const [currentSubscription, setCurrentSubscription] = useState({
    plan: 'Owner Pro Plan',
    price: '₹1,999 / mo',
    status: 'ACTIVE',
    expiryDate: 'August 25, 2027',
    maxVehicles: 10,
    currentVehiclesCount: 3,
    billingCycle: 'Monthly',
  });

  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.allSettled([
        ownerApi.getSubscription(),
        ownerApi.getAvailablePlans(),
      ]);

      if (subRes.status === 'fulfilled' && subRes.value) {
        setCurrentSubscription((prev) => ({
          ...prev,
          ...subRes.value,
          expiryDate: subRes.value.expiryDate || 'August 25, 2027',
        }));
      }

      if (plansRes.status === 'fulfilled' && Array.isArray(plansRes.value)) {
        setAvailablePlans(plansRes.value);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleSelectAndUpgradePlan = async (plan) => {
    if (plan.name === currentSubscription.plan) {
      showToast(`You are already subscribed to the ${plan.name}.`, 'info');
      return;
    }

    setUpgradingPlan(plan.id);
    try {
      await ownerApi.updateSubscription({
        plan: plan.name,
        price: plan.price || `₹${plan.monthlyPrice} / mo`,
        maxVehicles: plan.maxVehicles,
      });

      setCurrentSubscription((prev) => ({
        ...prev,
        plan: plan.name,
        price: plan.price || `₹${plan.monthlyPrice} / mo`,
        maxVehicles: plan.maxVehicles,
        status: 'ACTIVE',
        expiryDate: 'August 25, 2027',
      }));

      showToast(`🎉 Successfully upgraded subscription to ${plan.name}!`, 'success');
    } catch (err) {
      console.error('Upgrade failed:', err);
      showToast('Subscription update failed. Please try again.', 'error');
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner Subscription Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Subscription & Vehicle Limits</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Manage your vehicle listing capacity, platform commission benefits, and upgrade across monthly & annual tiers anytime.
          </p>
        </div>

        {/* Current Active Plan Badge */}
        <div className="bg-slate-950/80 border border-slate-800 backdrop-blur p-4 rounded-2xl shrink-0 flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Plan</span>
            <h4 className="text-base font-extrabold text-slate-100">{currentSubscription.plan}</h4>
            <p className="text-xs text-emerald-400 font-semibold">{currentSubscription.price}</p>
          </div>
        </div>
      </div>

      {/* Active Subscription Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle Limit Capacity</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-100">
              {currentSubscription.currentVehiclesCount || 3} <span className="text-sm font-normal text-slate-400">/ {currentSubscription.maxVehicles} Cars</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              {Math.round(((currentSubscription.currentVehiclesCount || 3) / currentSubscription.maxVehicles) * 100)}% Used
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round(((currentSubscription.currentVehiclesCount || 3) / currentSubscription.maxVehicles) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Renewal & Billing Date</span>
          <h3 className="text-xl font-black text-slate-100 mt-2">{currentSubscription.expiryDate}</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Auto-renews on monthly cycle</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Status</span>
            <h3 className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Vehicle Owner License</span>
            </h3>
          </div>
          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>All enterprise features & driver matching active</span>
          </div>
        </div>
      </div>

      {/* Available Plans Selection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">Choose / Switch Subscription Plan</h2>
            <p className="text-xs text-slate-400">Upgrade anytime to increase your vehicle capacity and reduce platform fees.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading subscription plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => {
              const isCurrent = plan.name === currentSubscription.plan;
              const isUpgrading = upgradingPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 relative ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-slate-900 via-emerald-950/10 to-slate-900 shadow-2xl'
                      : plan.isPopular
                      ? 'border-indigo-500/60 hover:border-indigo-400'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.isPopular && !isCurrent && (
                    <span className="absolute -top-3 right-6 px-3 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  )}

                  {isCurrent && (
                    <span className="absolute -top-3 right-6 px-3 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-full shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>CURRENT PLAN</span>
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-100">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-100">
                          {plan.price ? plan.price.split('/')[0] : `₹${plan.monthlyPrice}`}
                        </span>
                        <span className="text-xs text-slate-400">/ month</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Billed annually as ₹{plan.annualPrice || (plan.monthlyPrice ? plan.monthlyPrice * 10 : 9999)}
                      </p>
                    </div>

                    <ul className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                      {(plan.features || []).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleSelectAndUpgradePlan(plan)}
                      disabled={isCurrent || isUpgrading}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.02]'
                      }`}
                    >
                      {isUpgrading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isCurrent ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Active Subscription</span>
                        </>
                      ) : (
                        <>
                          <span>Switch to {plan.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulated Invoices & Billing History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Billing History & Tax Invoices</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          <div className="py-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-200">Invoice #INV-2026-0891</p>
              <p className="text-[11px] text-slate-400">August 25, 2026 • Owner Pro Plan (Monthly)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-slate-100">₹1,999.00</span>
              <button
                onClick={() => showToast('Downloading invoice PDF...', 'info')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Download Receipt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-200">Invoice #INV-2026-0724</p>
              <p className="text-[11px] text-slate-400">July 25, 2026 • Starter Owner Plan (Monthly)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-slate-100">₹999.00</span>
              <button
                onClick={() => showToast('Downloading invoice PDF...', 'info')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Download Receipt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSubscription;
