import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Play, 
  Square, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle, 
  AlertTriangle,
  AlertOctagon,
  CheckCircle2, 
  Clock, 
  History, 
  User, 
  Car,
  Save,
  Check,
  X,
  Phone,
  Navigation,
  ShieldAlert,
  Building,
  RefreshCw
} from 'lucide-react';
import { driverApi } from '../../api/driverApi';
import StatusBadge from '../../components/ui/StatusBadge';
import { STATUS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const PRESET_INACTIVITY_REASONS = [
  'Medical Leave / Health Recovery',
  'Personal / Family Emergency',
  'Vehicle Under Scheduled Maintenance',
  'Out of Town / Vacation',
  'Off-Duty Rest Period',
];

const DriverTrips = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  const [trips, setTrips] = useState([]);
  const [historyTrips, setHistoryTrips] = useState([]);
  const [statusInfo, setStatusInfo] = useState({ approved: true, status: 'APPROVED' });
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Driver Availability State & Inactivity Reason
  const [availability, setAvailability] = useState({
    status: 'ACTIVE', // 'ACTIVE' | 'INACTIVE'
    inactivityReason: '',
  });
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [tempReason, setTempReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchTripsAndStatus = async () => {
    try {
      setLoading(true);
      const [tripsData, historyData, availData, statusData, profileData] = await Promise.allSettled([
        driverApi.getAssignedTrips(),
        driverApi.getTripHistory(),
        driverApi.getAvailability(),
        driverApi.getApprovalStatus(),
        driverApi.getProfile(),
      ]);

      if (statusData.status === 'fulfilled' && statusData.value) {
        setStatusInfo(statusData.value);
      }

      if (profileData.status === 'fulfilled' && profileData.value) {
        setDriverProfile(profileData.value);
      }

      if (tripsData.status === 'fulfilled' && Array.isArray(tripsData.value)) {
        const all = tripsData.value;
        const filtered = all.filter(
          (t) => t.status === STATUS.CONFIRMED || t.status === STATUS.IN_PROGRESS || t.status === 'TRIP_STARTED'
        );
        setTrips(filtered);
        
        const historyFromTrips = all.filter(
          (t) => t.status === STATUS.COMPLETED || t.status === 'TRIP_COMPLETED' || t.status === STATUS.CANCELLED || t.status === STATUS.REJECTED
        );
        const externalHistory = (historyData.status === 'fulfilled' && Array.isArray(historyData.value)) ? historyData.value : [];
        const map = new Map();
        [...externalHistory, ...historyFromTrips].forEach((item) => {
          if (item && item.id) map.set(item.id, item);
        });
        setHistoryTrips(Array.from(map.values()));
      } else if (historyData.status === 'fulfilled' && Array.isArray(historyData.value)) {
        setHistoryTrips(historyData.value);
      }

      if (availData.status === 'fulfilled' && availData.value) {
        const currentAvail = {
          status: availData.value.status || availData.value.availabilityStatus || 'ACTIVE',
          inactivityReason: availData.value.inactivityReason || '',
        };
        setAvailability(currentAvail);
        setTempReason(currentAvail.inactivityReason);
      }
    } catch (err) {
      console.error('Failed to load driver trips:', err);
      showToast('Failed to load trips data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndStatus();
  }, []);

  // When clicking toggle or button:
  const handleToggleClick = () => {
    if (availability.status === 'ACTIVE') {
      // Switching to INACTIVE -> Reason is MANDATORY!
      setTempReason('');
      setCustomReason('');
      setShowInactiveModal(true);
    } else {
      // Switching to ACTIVE -> Direct update
      handleSetActive();
    }
  };

  const handleSetActive = async () => {
    setSavingStatus(true);
    try {
      await driverApi.updateAvailability('ACTIVE', '');
      setAvailability({ status: 'ACTIVE', inactivityReason: '' });
      showToast('🎉 Availability set to ACTIVE. You are now available for vehicle trip assignments!', 'success');
    } catch (err) {
      console.error('Failed to set active:', err);
      showToast('Failed to update driver status.', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleConfirmInactive = async (e) => {
    e.preventDefault();
    const finalReason = (customReason.trim() || tempReason.trim());
    if (!finalReason) {
      showToast('Inactivity reason is mandatory when setting your status to Inactive.', 'warning');
      return;
    }

    setSavingStatus(true);
    try {
      await driverApi.updateAvailability('INACTIVE', finalReason);
      setAvailability({ status: 'INACTIVE', inactivityReason: finalReason });
      setShowInactiveModal(false);
      showToast(`Availability set to INACTIVE (${finalReason}). You will not be assigned new trips.`, 'info');
    } catch (err) {
      console.error('Failed to set inactive:', err);
      showToast('Failed to update driver status.', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleStartTrip = async (tripId) => {
    if (isLicenseExpired) {
      showToast('Cannot start trip: Driving license has expired. Please submit renewed license copy on your profile.', 'error');
      return;
    }
    setActionLoadingId(tripId);
    try {
      await driverApi.startTrip(tripId);
      showToast(`Trip #${tripId} started! Status changed to IN_PROGRESS.`, 'success');
      fetchTripsAndStatus();
    } catch (err) {
      console.error('Failed to start trip:', err);
      showToast('Error starting trip. Please try again.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEndTrip = async (tripId) => {
    setActionLoadingId(tripId);
    try {
      await driverApi.endTrip(tripId);
      showToast(`Trip #${tripId} completed successfully! Saved to history.`, 'success');
      fetchTripsAndStatus();
    } catch (err) {
      console.error('Failed to end trip:', err);
      showToast('Error completing trip. Please try again.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // End Trip Confirmation Modal State
  const [endTripModal, setEndTripModal] = useState(null); // { tripId, trip }

  const handleConfirmEndTrip = async () => {
    if (!endTripModal) return;
    const tripId = endTripModal.id;
    setActionLoadingId(tripId);
    try {
      await driverApi.endTrip(tripId);
      showToast(`Trip #${tripId} completed successfully! Saved to history.`, 'success');
      setEndTripModal(null);
      fetchTripsAndStatus();
    } catch (err) {
      console.error('Failed to end trip:', err);
      showToast('Error completing trip. Please try again.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isInactive = availability.status === 'INACTIVE';
  const isDriverApproved = statusInfo.approved && statusInfo.status !== 'PENDING';
  const isLicenseExpired = driverProfile?.licenseExpiry ? new Date(driverProfile.licenseExpiry) < new Date() : false;

  return (
    <div className="space-y-6 pb-12">
      {/* Driving License Expired Suspension Banner */}
      {isLicenseExpired && (
        <div className="p-5 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-rose-900 dark:text-rose-200 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 mt-0.5">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider">
                  DRIVING SUSPENDED
                </span>
                <h3 className="text-base font-extrabold text-rose-700 dark:text-rose-100">
                  Driving License Expired ({driverProfile.licenseExpiry})
                </h3>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
                Your driving license expired on {driverProfile.licenseExpiry}. As per compliance rules, you cannot start or conduct trips until an updated license copy is uploaded on your profile.
              </p>
            </div>
          </div>
          <Link
            to="/driver/profile"
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Upload Renewed License</span>
          </Link>
        </div>
      )}

      {/* Driver Verification Status Banner */}
      {!isDriverApproved && !isLicenseExpired && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-amber-900 dark:text-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Driver License Verification Pending</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
                Your driver credentials and license are under review by Super Admin. As per SRS policy, new trips can only be assigned to approved and verified drivers.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold whitespace-nowrap">
            Status: {statusInfo.status || 'PENDING'}
          </span>
        </div>
      )}

      {/* Driver Duty Status Card with Mandatory Inactivity Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                !isInactive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${!isInactive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isInactive ? 'OFF DUTY / INACTIVE' : 'ON DUTY / AVAILABLE'}</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-100">Driver Duty & Trip Console</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Control your live availability. When inactive, vehicle owners cannot assign you to customer bookings. You can always view completed trips history.
          </p>

          {isInactive && availability.inactivityReason && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2 text-xs text-slate-300 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Mandatory Inactivity Reason:</strong> {availability.inactivityReason}</span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleToggleClick}
            disabled={savingStatus}
            className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2.5 ${
              !isInactive
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {!isInactive ? (
              <>
                <ToggleRight className="w-5 h-5" />
                <span>⏸️ Switch to Off-Duty (Set Inactive)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                <span>🟢 Switch to On-Duty (Set Active)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs: Active Assigned Trips vs Completed Trips History */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Active Assigned Trips ({trips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Completed Trips History ({historyTrips.length})</span>
        </button>
      </div>

      {/* ACTIVE TRIPS TAB */}
      {activeTab === 'active' && (
        <>
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading your assigned trips...</div>
          ) : trips.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
              <Car className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No Active Trips Assigned</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isInactive
                  ? 'You are currently Inactive. Set your duty status to Active to receive new trip assignments from vehicle owners.'
                  : 'You have no pending or in-progress trips assigned at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip) => {
                const isOngoing = trip.status === STATUS.IN_PROGRESS;
                const isConfirmed = trip.status === STATUS.CONFIRMED;

                return (
                  <div
                    key={trip.id}
                    className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl space-y-5 transition-all ${
                      isOngoing ? 'border-purple-500/50 shadow-purple-500/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Reference</span>
                        <h3 className="text-base font-extrabold text-slate-100">Trip #{trip.id}</h3>
                      </div>
                      <StatusBadge status={trip.status} />
                    </div>

                    {/* Route Details */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                          <p className="font-semibold text-slate-100">{trip.pickupLocation}</p>
                        </div>
                      </div>

                      <div className="border-l-2 border-dashed border-slate-700 ml-1 pl-5 py-0.5" />

                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Drop-off Destination</span>
                          <p className="font-semibold text-slate-100">{trip.dropoffLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Trip & Customer & Owner Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Assigned By Owner</span>
                        <p className="font-semibold text-blue-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          <span>{trip.ownerName || 'Apex Auto Rentals'}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{trip.ownerPhone || '+91 98900 11223'}</p>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Customer</span>
                        <p className="font-semibold text-slate-200">{trip.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{trip.customerPhone}</p>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Vehicle</span>
                        <p className="font-semibold text-slate-200">{trip.vehicleName || 'Assigned Car'}</p>
                        <p className="text-[11px] text-emerald-400 font-bold mt-0.5">{trip.tripType || 'LOCAL'} Trip</p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
                      {isConfirmed && (
                        <button
                          onClick={() => handleStartTrip(trip.id)}
                          disabled={actionLoadingId === trip.id}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start Journey</span>
                        </button>
                      )}

                      {isOngoing && (
                        <button
                          onClick={() => setEndTripModal(trip)}
                          disabled={actionLoadingId === trip.id}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <Square className="w-4 h-4 fill-white" />
                          <span>End Journey</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* COMPLETED TRIPS HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyTrips.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
              <History className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No Past Trip History</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Your completed and archived driving trips will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyTrips.map((ht) => (
                <div key={ht.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">TRIP RECORD</span>
                      <h4 className="text-sm font-extrabold text-slate-100">Trip #{ht.id}</h4>
                    </div>
                    <StatusBadge status={ht.status} />
                  </div>

                  <div className="text-xs space-y-2 text-slate-300">
                    <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned by Vehicle Owner</span>
                        <p className="font-bold text-blue-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>{ht.ownerName || 'Apex Auto Rentals'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Owner Contact</span>
                        <p className="font-mono text-slate-300 text-[11px] mt-0.5">{ht.ownerPhone || '+91 98900 11223'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 block">Route</span>
                        <strong className="text-slate-100">{ht.pickupLocation} ➔ {ht.dropoffLocation}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Vehicle</span>
                        <strong className="text-slate-100">{ht.vehicleName || 'Vehicle'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Customer</span>
                        <strong className="text-slate-100">{ht.customerName} ({ht.customerPhone})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Trip Completed</span>
                        <span className="text-emerald-400 font-mono font-bold">{ht.completedAt || ht.createdAt || 'August 2026'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* END TRIP CONFIRMATION MODAL (Prompt Section 45) */}
      {endTripModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Square className="w-5 h-5 fill-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-100">Complete Journey</h3>
              </div>
              <button onClick={() => setEndTripModal(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure the customer has safely arrived at the destination and the journey is complete?
            </p>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
              <p>Trip #{endTripModal.id} • Customer: <strong>{endTripModal.customerName}</strong></p>
              <p className="text-[11px] text-slate-400">Destination: {endTripModal.dropoffLocation}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setEndTripModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Back to Trip
              </button>
              <button
                onClick={handleConfirmEndTrip}
                disabled={actionLoadingId === endTripModal.id}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {actionLoadingId === endTripModal.id ? 'Completing...' : 'Yes, Complete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY INACTIVITY REASON MODAL */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-100">Mandatory Inactivity Reason</h3>
              </div>
              <button onClick={() => setShowInactiveModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To go off-duty, you must specify an <strong>Inactivity Reason</strong>. Vehicle owners will see this reason and will not assign you to new bookings.
            </p>

            <form onSubmit={handleConfirmInactive} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Reason Preset:
                </label>
                <div className="space-y-1.5">
                  {PRESET_INACTIVITY_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setTempReason(preset);
                        setCustomReason('');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        tempReason === preset && !customReason
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Or Type Custom Reason:
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    setTempReason('');
                  }}
                  placeholder="e.g. Taking leave for personal reasons until Friday..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInactiveModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus || (!tempReason && !customReason.trim())}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingStatus ? 'Saving...' : 'Confirm Inactive Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTrips;
