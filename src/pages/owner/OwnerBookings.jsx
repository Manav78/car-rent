import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  Car, 
  Eye, 
  FileText,
  Sparkles,
  ShieldCheck,
  Navigation,
  RefreshCw,
  Info,
  UserCheck
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import StatusBadge from '../../components/ui/StatusBadge';
import { STATUS } from '../../utils/constants';
import { getRoles } from '../../utils/authStorage';
import { useToast } from '../../context/ToastContext';

const OwnerBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Inspect Full Booking Request Dossier
  const [inspectBooking, setInspectBooking] = useState(null);

  // Accept Modal State
  const [acceptModalBooking, setAcceptModalBooking] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [useMyselfAsDriver, setUseMyselfAsDriver] = useState(false);

  // Replace Vehicle Modal State (Dedicated API: POST /api/v1/owners/bookings/{id}/replace-vehicle)
  const [replaceVehicleModalBooking, setReplaceVehicleModalBooking] = useState(null);
  const [selectedReplacementVehicleId, setSelectedReplacementVehicleId] = useState('');
  const [replaceVehicleReason, setReplaceVehicleReason] = useState('');
  const [replaceVehicleError, setReplaceVehicleError] = useState('');

  // Replace Driver Modal State (Dedicated API: POST /api/v1/owners/bookings/{id}/replace-driver)
  const [replaceDriverModalBooking, setReplaceDriverModalBooking] = useState(null);
  const [selectedReplacementDriverId, setSelectedReplacementDriverId] = useState('');
  const [replaceDriverUseMyself, setReplaceDriverUseMyself] = useState(false);
  const [replaceDriverReason, setReplaceDriverReason] = useState('');
  const [replaceDriverError, setReplaceDriverError] = useState('');

  // Reject Modal State
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Filter Tabs: Only 4 clean categories (No "ongoing")
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'HISTORY'

  const userRoles = getRoles();
  const isOwnerAndDriver = userRoles.includes('ROLE_OWNER') && userRoles.includes('ROLE_DRIVER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, driversData, profileData, vehiclesData] = await Promise.allSettled([
        ownerApi.getBookings(),
        ownerApi.getDrivers(),
        ownerApi.getProfile(),
        ownerApi.getVehicles(),
      ]);

      if (bookingsData.status === 'fulfilled' && Array.isArray(bookingsData.value)) {
        setBookings(bookingsData.value);
      }

      if (driversData.status === 'fulfilled' && Array.isArray(driversData.value)) {
        setDrivers(driversData.value);
      }

      if (vehiclesData.status === 'fulfilled' && Array.isArray(vehiclesData.value)) {
        setVehicles(vehiclesData.value);
      }

      if (profileData.status === 'fulfilled' && profileData.value) {
        setOwnerProfile(profileData.value);
      }
    } catch (err) {
      console.error('Error fetching owner bookings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isOwnerApproved = ownerProfile ? (ownerProfile.isApproved !== false && ownerProfile.status !== 'PENDING_APPROVAL') : true;

  const openAcceptModal = (booking) => {
    if (!isOwnerApproved) {
      showToast('Account verification pending. You can accept bookings and assign drivers after Super Admin approval.', 'warning');
      return;
    }
    const firstApprovedActiveDriver = drivers.find((d) => {
      const isExpired = (d.licenseExpiryDate || d.licenseExpiry) ? new Date(d.licenseExpiryDate || d.licenseExpiry) < new Date() : false;
      const isInactive = (d.operationalStatus || d.status || d.availabilityStatus || '').toUpperCase() === 'INACTIVE';
      return !isExpired && !isInactive;
    }) || drivers[0];
    setAcceptModalBooking(booking);
    setSelectedDriverId(firstApprovedActiveDriver ? String(firstApprovedActiveDriver.id || firstApprovedActiveDriver.driverId || firstApprovedActiveDriver.userId) : '');
    setUseMyselfAsDriver(false);
  };

  const handleConfirmAccept = async () => {
    if (!useMyselfAsDriver && !selectedDriverId) {
      showToast('Please select an approved active driver or check "Use Myself as Driver".', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      if (useMyselfAsDriver) {
        await ownerApi.updateBookingStatus(
          acceptModalBooking.id,
          'CONFIRMED',
          'Confirmed by owner (self-driving)'
        );
      } else {
        await ownerApi.assignDriver(acceptModalBooking.id, selectedDriverId);
      }
      showToast(`Driver assigned and Booking #${acceptModalBooking.id} confirmed successfully!`, 'success');
      setAcceptModalBooking(null);
      if (inspectBooking && inspectBooking.id === acceptModalBooking.id) {
        setInspectBooking(null);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to accept booking / assign driver:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to assign driver. Please check backend response.';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Dedicated Vehicle Replacement Modal
  const openReplaceVehicleModal = (booking) => {
    setReplaceVehicleModalBooking(booking);
    const otherVehicles = vehicles.filter((v) => v.id !== booking.vehicleId);
    setSelectedReplacementVehicleId(otherVehicles[0] ? String(otherVehicles[0].id) : (vehicles[0] ? String(vehicles[0].id) : ''));
    setReplaceVehicleReason('');
    setReplaceVehicleError('');
  };

  // Confirm Dedicated Vehicle Replacement
  const handleConfirmReplaceVehicle = async () => {
    if (!selectedReplacementVehicleId) {
      setReplaceVehicleError('Please select a replacement vehicle from your fleet.');
      return;
    }

    setActionLoading(true);
    try {
      await ownerApi.replaceVehicle(replaceVehicleModalBooking.id, {
        newVehicleId: selectedReplacementVehicleId,
        reason: replaceVehicleReason.trim() || 'Vehicle replaced by fleet owner',
      });
      showToast(`Vehicle replaced successfully for Booking #${replaceVehicleModalBooking.id}!`, 'success');
      setReplaceVehicleModalBooking(null);
      if (inspectBooking && inspectBooking.id === replaceVehicleModalBooking.id) {
        setInspectBooking(null);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to replace vehicle:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to replace vehicle.';
      setReplaceVehicleError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Dedicated Driver Replacement Modal
  const openReplaceDriverModal = (booking) => {
    setReplaceDriverModalBooking(booking);
    const firstApprovedActiveDriver = drivers.find((d) => {
      const isExpired = (d.licenseExpiryDate || d.licenseExpiry) ? new Date(d.licenseExpiryDate || d.licenseExpiry) < new Date() : false;
      const isInactive = (d.operationalStatus || d.status || d.availabilityStatus || '').toUpperCase() === 'INACTIVE';
      const isCurrent = (d.id || d.driverId) === booking.driverId;
      return !isExpired && !isInactive && !isCurrent;
    }) || drivers[0];
    setSelectedReplacementDriverId(firstApprovedActiveDriver ? String(firstApprovedActiveDriver.id || firstApprovedActiveDriver.driverId || firstApprovedActiveDriver.userId) : '');
    setReplaceDriverUseMyself(booking.driverId === 999);
    setReplaceDriverReason('');
    setReplaceDriverError('');
  };

  // Confirm Dedicated Driver Replacement
  const handleConfirmReplaceDriver = async () => {
    if (!replaceDriverUseMyself && !selectedReplacementDriverId) {
      setReplaceDriverError('Please select a verified on-duty driver or check "Use Myself as Driver".');
      return;
    }

    setActionLoading(true);
    try {
      if (replaceDriverUseMyself) {
        await ownerApi.updateBookingStatus(
          replaceDriverModalBooking.id,
          'CONFIRMED',
          replaceDriverReason.trim() || 'Assigned owner as driver'
        );
      } else {
        await ownerApi.replaceDriver(replaceDriverModalBooking.id, {
          newDriverId: selectedReplacementDriverId,
          reason: replaceDriverReason.trim() || 'Driver replaced by fleet owner',
        });
      }
      showToast(`Driver replaced successfully for Booking #${replaceDriverModalBooking.id}!`, 'success');
      setReplaceDriverModalBooking(null);
      if (inspectBooking && inspectBooking.id === replaceDriverModalBooking.id) {
        setInspectBooking(null);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to replace driver:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to replace driver.';
      setReplaceDriverError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (booking) => {
    setRejectModalBooking(booking);
    setRejectionReason('');
    setRejectError('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('A mandatory rejection reason is required.');
      return;
    }

    setActionLoading(true);
    try {
      await ownerApi.rejectBooking(rejectModalBooking.id, rejectionReason.trim());
      showToast(`Booking #${rejectModalBooking.id} rejected.`, 'info');
      setRejectModalBooking(null);
      if (inspectBooking && inspectBooking.id === rejectModalBooking.id) {
        setInspectBooking(null);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to reject booking:', err);
      showToast('Failed to reject booking. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (tab === 'PENDING') return b.status === STATUS.PENDING || b.status === STATUS.ACCEPTED;
    if (tab === 'CONFIRMED') return b.status === STATUS.CONFIRMED || b.status === 'IN_PROGRESS' || b.status === 'TRIP_STARTED';
    if (tab === 'HISTORY') return b.status === STATUS.COMPLETED || b.status === 'TRIP_COMPLETED' || b.status === 'CANCELLED' || b.status === 'REJECTED';
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status === STATUS.PENDING || b.status === STATUS.ACCEPTED).length;
  const confirmedCount = bookings.filter((b) => b.status === STATUS.CONFIRMED || b.status === 'IN_PROGRESS' || b.status === 'TRIP_STARTED').length;
  const historyCount = bookings.filter((b) => b.status === STATUS.COMPLETED || b.status === 'TRIP_COMPLETED' || b.status === 'CANCELLED' || b.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Verification Gate Banner */}
      {!isOwnerApproved && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 md:p-6 shadow-xl flex items-start gap-4 text-xs text-amber-900 dark:text-amber-300">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-600 dark:text-amber-300 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-full font-bold text-[10px] border border-amber-500/30">
              <span>ACCOUNT VERIFICATION PENDING</span>
            </div>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Owner Verification in Progress</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Your owner profile is awaiting Super Admin verification. You cannot accept bookings or assign drivers until verification is complete.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Owner Booking Command</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Customer Booking Requests</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect incoming customer booking requests, view complete trip dossiers, and assign verified on-duty drivers.
          </p>
        </div>
      </div>

      {/* Filter Tabs: Clean categories, strictly no "ongoing" */}
      <div className="flex flex-wrap bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1.5 text-xs">
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            tab === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Requests ({bookings.length})
        </button>
        <button
          onClick={() => setTab('PENDING')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            tab === 'PENDING' ? 'bg-amber-600 text-white shadow' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review ({pendingCount})</span>
        </button>
        <button
          onClick={() => setTab('CONFIRMED')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            tab === 'CONFIRMED' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Confirmed Bookings ({confirmedCount})</span>
        </button>
        <button
          onClick={() => setTab('HISTORY')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            tab === 'HISTORY' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Past / Archived ({historyCount})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading booking requests...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Bookings in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">No customer bookings match the selected status category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const isPending = b.status === STATUS.PENDING || b.status === STATUS.ACCEPTED;
            const isConfirmed = b.status === STATUS.CONFIRMED || b.status === 'IN_PROGRESS' || b.status === 'TRIP_STARTED';

            return (
              <div
                key={b.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Reference & Status */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-blue-400 text-xs">#{b.id}</span>
                      <strong className="text-slate-100 text-sm font-bold">{b.vehicleName || 'Vehicle Reservation'}</strong>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Route Summary */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                        <p className="font-semibold text-slate-100">{b.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="border-l-2 border-dashed border-slate-800 ml-2 pl-4 py-0.5" />
                    <div className="flex items-start gap-2.5">
                      <Navigation className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Drop-off Destination</span>
                        <p className="font-semibold text-slate-100">{b.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Trip Schedule Summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Customer</span>
                      <p className="font-bold text-slate-200">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{b.customerPhoneNumber || b.customerPhone || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Travel Dates</span>
                      <p className="font-semibold text-slate-200">{b.startDate} {b.endDate ? `➔ ${b.endDate}` : ''}</p>
                      <p className="text-[11px] text-blue-400 font-bold mt-0.5">{b.tripType || 'LOCAL'} Trip • {b.passengerCount || 1} Pass.</p>
                    </div>
                  </div>

                  {/* Assigned Driver Badge if Confirmed */}
                  {b.driverName && (
                    <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-slate-300">Assigned Driver: <strong className="text-purple-300">{b.driverName}</strong></span>
                        </div>
                        {(b.driverPhoneNumber || b.driverPhone) && <span className="font-mono text-[11px] text-slate-400">{b.driverPhoneNumber || b.driverPhone}</span>}
                      </div>
                      {b.reassignmentReason && (
                        <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1 pt-0.5 border-t border-purple-500/20">
                          <Info className="w-3 h-3 shrink-0" />
                          <span>Reassigned: {b.reassignmentReason} ({b.reassignedAt || 'Updated'})</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Controls */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectBooking(b)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Full Dossier</span>
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openRejectModal(b)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => openAcceptModal(b)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Assign Driver</span>
                      </button>
                    </div>
                  )}

                  {isConfirmed && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openReplaceVehicleModal(b)}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                        title="Replace assigned vehicle in case of breakdown or upgrade"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Replace Vehicle</span>
                      </button>
                      <button
                        onClick={() => openReplaceDriverModal(b)}
                        className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                        title="Replace assigned driver in case of leave or unavailability"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Replace Driver</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPLETE CUSTOMER BOOKING REQUEST DOSSIER MODAL */}
      {inspectBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-100">
                    Booking Dossier #{inspectBooking.id}
                  </h3>
                  <p className="text-xs text-slate-400">Complete customer reservation request details.</p>
                </div>
              </div>
              <button onClick={() => setInspectBooking(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Information Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Full Name:</span>
                    <strong className="text-slate-100">{inspectBooking.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contact Phone:</span>
                    <span className="font-mono text-emerald-400 font-bold">{inspectBooking.customerPhoneNumber || inspectBooking.customerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email Address:</span>
                    <span className="text-slate-300">{inspectBooking.customerEmail || 'customer@example.com'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Booking Placed On:</span>
                    <span className="text-slate-300">{inspectBooking.createdAt || 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Trip Route & Timeline */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trip Route & Itinerary</span>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Pickup Address:</span>
                      <p className="font-bold text-slate-100">{inspectBooking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Drop-off Destination:</span>
                      <p className="font-bold text-slate-100">{inspectBooking.dropoffLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Trip Type:</span>
                    <strong className="text-blue-400">{inspectBooking.tripType || 'LOCAL'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Start Date:</span>
                    <strong className="text-slate-200">{inspectBooking.startDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">End Date:</span>
                    <strong className="text-slate-200">{inspectBooking.endDate || inspectBooking.startDate}</strong>
                  </div>
                </div>
              </div>

              {/* Vehicle & Passenger Specifications */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle Requested & Notes</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Vehicle Model:</span>
                    <strong className="text-slate-100">{inspectBooking.vehicleName || 'Requested Car'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Passengers Count:</span>
                    <strong className="text-slate-100">{inspectBooking.passengerCount || 1} Passengers</strong>
                  </div>
                </div>
                {inspectBooking.driverName && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-semibold">Assigned Driver:</span>
                    <p className="text-xs text-purple-300 font-bold mt-0.5">
                      {inspectBooking.driverName} ({inspectBooking.driverPhoneNumber || inspectBooking.driverPhone || 'On-Duty'})
                    </p>
                    {inspectBooking.reassignmentReason && (
                      <p className="text-[11px] text-blue-400 mt-1 italic">
                        Reassigned note: "{inspectBooking.reassignmentReason}"
                      </p>
                    )}
                  </div>
                )}
                {inspectBooking.notes && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-semibold">Customer Instructions:</span>
                    <p className="p-2.5 bg-slate-900 rounded-xl text-slate-300 italic text-[11px] mt-1 border border-slate-800">
                      "{inspectBooking.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Current Status Banner */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 font-semibold">Current Booking State:</span>
                <StatusBadge status={inspectBooking.status} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectBooking(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>

              {(inspectBooking.status === STATUS.PENDING || inspectBooking.status === STATUS.ACCEPTED) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const b = inspectBooking;
                      setInspectBooking(null);
                      openRejectModal(b);
                    }}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      const b = inspectBooking;
                      setInspectBooking(null);
                      openAcceptModal(b);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Assign Driver</span>
                  </button>
                </div>
              )}

              {(inspectBooking.status === STATUS.CONFIRMED || inspectBooking.status === 'IN_PROGRESS') && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const b = inspectBooking;
                      setInspectBooking(null);
                      openReplaceVehicleModal(b);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Replace Vehicle</span>
                  </button>
                  <button
                    onClick={() => {
                      const b = inspectBooking;
                      setInspectBooking(null);
                      openReplaceDriverModal(b);
                    }}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Replace Driver</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STREAMLINED ACCEPT MODAL */}
      {acceptModalBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-100">
                  Accept Booking #{acceptModalBooking.id}
                </h3>
                <p className="text-xs text-slate-400">Assign a verified on-duty driver to confirm trip.</p>
              </div>
              <button onClick={() => setAcceptModalBooking(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <strong className="text-slate-100">{acceptModalBooking.customerName} ({acceptModalBooking.customerPhoneNumber || acceptModalBooking.customerPhone || 'N/A'})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="text-slate-200">{acceptModalBooking.pickupLocation} ➔ {acceptModalBooking.dropoffLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="text-blue-400 font-bold">{acceptModalBooking.vehicleName || 'Assigned Car'}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Assign Verified Driver *</label>
                <select
                  disabled={useMyselfAsDriver}
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-40"
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map((d) => {
                    const approval = (d.approvalStatus || (d.status === 'APPROVED' ? 'APPROVED' : '') || (d.isApproved ? 'APPROVED' : '')).toUpperCase();
                    const operational = (d.operationalStatus || d.status || d.availabilityStatus || 'ACTIVE').toUpperCase();
                    const isApproved = approval === 'APPROVED' || (approval !== 'PENDING' && approval !== 'PENDING_APPROVAL' && approval !== 'REJECTED' && d.isApproved !== false);
                    const isExpired = (d.licenseExpiryDate || d.licenseExpiry) ? new Date(d.licenseExpiryDate || d.licenseExpiry) < new Date() : false;
                    const isInactive = operational === 'INACTIVE' || operational === 'OFFLINE';
                    const isDisabled = !isApproved || isInactive || isExpired;
                    const driverName = d.fullName || (d.firstName ? `${d.firstName} ${d.lastName || ''}`.trim() : d.name) || `Driver #${d.id || d.driverId}`;
                    const licNo = d.licenseNumber || d.drivingLicenseNumber || 'Active';
                    const expDate = d.licenseExpiryDate || d.licenseExpiry || '';

                    return (
                      <option key={d.id || d.driverId} value={d.id || d.driverId} disabled={isDisabled}>
                        {driverName} {isExpired
                          ? `• ⛔ LICENSE EXPIRED (${expDate}) (Suspended - Cannot Assign)`
                          : !isApproved 
                          ? '• ⚠️ PENDING ADMIN APPROVAL (Cannot Assign)' 
                          : isInactive 
                          ? `• ⏸️ OFF-DUTY (${d.inactivityReason || 'On Leave'})` 
                          : `• ✅ Verified & On-Duty (${licNo})`}
                      </option>
                    );
                  })}
                </select>
                {drivers.filter((d) => {
                  const approval = (d.approvalStatus || (d.status === 'APPROVED' ? 'APPROVED' : '') || (d.isApproved ? 'APPROVED' : '')).toUpperCase();
                  const operational = (d.operationalStatus || d.status || d.availabilityStatus || 'ACTIVE').toUpperCase();
                  const isApproved = approval === 'APPROVED' || (approval !== 'PENDING' && approval !== 'PENDING_APPROVAL' && approval !== 'REJECTED' && d.isApproved !== false);
                  const isExpired = (d.licenseExpiryDate || d.licenseExpiry) ? new Date(d.licenseExpiryDate || d.licenseExpiry) < new Date() : false;
                  const isInactive = operational === 'INACTIVE' || operational === 'OFFLINE';
                  return isApproved && !isExpired && !isInactive;
                }).length === 0 && !useMyselfAsDriver && (
                  <p className="text-[11px] text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No verified active drivers with valid licenses currently available. Check "Use Myself as Driver" or wait for driver renewal/approval.</span>
                  </p>
                )}
              </div>

              {/* Multi-role option: Use Myself as Driver */}
              {isOwnerAndDriver && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-2.5 text-purple-300">
                  <input
                    type="checkbox"
                    id="useMyself"
                    checked={useMyselfAsDriver}
                    onChange={(e) => setUseMyselfAsDriver(e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <label htmlFor="useMyself" className="font-semibold text-xs cursor-pointer">
                    Use Myself as Driver (Dual Role: Owner + Driver)
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAcceptModalBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                disabled={actionLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
              >
                {actionLoading ? 'Processing...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED REPLACE VEHICLE MODAL (POST /api/v1/owners/bookings/{id}/replace-vehicle) */}
      {replaceVehicleModalBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    Replace Vehicle • Booking #{replaceVehicleModalBooking.id}
                  </h3>
                  <p className="text-xs text-slate-400">Select a replacement fleet vehicle for this booking.</p>
                </div>
              </div>
              <button onClick={() => setReplaceVehicleModalBooking(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Current Vehicle State */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Assignment</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <strong className="text-slate-100">{replaceVehicleModalBooking.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Assigned Vehicle:</span>
                  <span className="text-blue-400 font-bold">{replaceVehicleModalBooking.vehicleName || 'Current Car'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="text-slate-200">{replaceVehicleModalBooking.pickupLocation} ➔ {replaceVehicleModalBooking.dropoffLocation}</span>
                </div>
              </div>

              {/* Select Replacement Vehicle */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Select Replacement Vehicle *</label>
                <select
                  value={selectedReplacementVehicleId}
                  onChange={(e) => {
                    setSelectedReplacementVehicleId(e.target.value);
                    setReplaceVehicleError('');
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Fleet Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} • {v.vehicleNumber} ({v.status || 'AVAILABLE'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason for Vehicle Replacement */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Reason for Vehicle Replacement</label>
                <input
                  type="text"
                  value={replaceVehicleReason}
                  onChange={(e) => {
                    setReplaceVehicleReason(e.target.value);
                    setReplaceVehicleError('');
                  }}
                  placeholder="e.g. Mechanical breakdown, tyre puncture, vehicle maintenance, upgrade..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {replaceVehicleError && (
                <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{replaceVehicleError}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReplaceVehicleModalBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReplaceVehicle}
                disabled={actionLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {actionLoading ? 'Replacing...' : 'Confirm Vehicle Replacement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED REPLACE DRIVER MODAL (POST /api/v1/owners/bookings/{id}/replace-driver) */}
      {replaceDriverModalBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    Replace Driver • Booking #{replaceDriverModalBooking.id}
                  </h3>
                  <p className="text-xs text-slate-400">Reassign a verified on-duty driver for this booking.</p>
                </div>
              </div>
              <button onClick={() => setReplaceDriverModalBooking(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Current Driver State */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Assignment</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <strong className="text-slate-100">{replaceDriverModalBooking.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Assigned Driver:</span>
                  <span className="text-purple-300 font-bold">{replaceDriverModalBooking.driverName || 'None Assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="text-slate-200">{replaceDriverModalBooking.vehicleName || 'Assigned Car'}</span>
                </div>
              </div>

              {/* Select Replacement Driver */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Select Replacement Driver *</label>
                <select
                  disabled={replaceDriverUseMyself}
                  value={selectedReplacementDriverId}
                  onChange={(e) => {
                    setSelectedReplacementDriverId(e.target.value);
                    setReplaceDriverError('');
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500 disabled:opacity-40"
                >
                  <option value="">-- Select Verified Driver --</option>
                  {drivers.map((d) => {
                    const approval = (d.approvalStatus || (d.status === 'APPROVED' ? 'APPROVED' : '') || (d.isApproved ? 'APPROVED' : '')).toUpperCase();
                    const operational = (d.operationalStatus || d.status || d.availabilityStatus || 'ACTIVE').toUpperCase();
                    const isApproved = approval === 'APPROVED' || (approval !== 'PENDING' && approval !== 'PENDING_APPROVAL' && approval !== 'REJECTED' && d.isApproved !== false);
                    const isExpired = (d.licenseExpiryDate || d.licenseExpiry) ? new Date(d.licenseExpiryDate || d.licenseExpiry) < new Date() : false;
                    const isInactive = operational === 'INACTIVE' || operational === 'OFFLINE';
                    const isDisabled = !isApproved || isInactive || isExpired;
                    const driverName = d.fullName || (d.firstName ? `${d.firstName} ${d.lastName || ''}`.trim() : d.name) || `Driver #${d.id || d.driverId}`;
                    const licNo = d.licenseNumber || d.drivingLicenseNumber || 'Active';
                    const expDate = d.licenseExpiryDate || d.licenseExpiry || '';

                    return (
                      <option key={d.id || d.driverId} value={d.id || d.driverId} disabled={isDisabled}>
                        {driverName} {isExpired
                          ? `• ⛔ LICENSE EXPIRED (${expDate}) (Suspended - Cannot Assign)`
                          : !isApproved 
                          ? '• ⚠️ PENDING ADMIN APPROVAL (Cannot Assign)' 
                          : isInactive 
                          ? `• ⏸️ OFF-DUTY (${d.inactivityReason || 'On Leave'})` 
                          : `• ✅ Verified & On-Duty (${licNo})`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Multi-role option: Use Myself as Driver */}
              {isOwnerAndDriver && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-2.5 text-purple-300">
                  <input
                    type="checkbox"
                    id="replaceDriverMyself"
                    checked={replaceDriverUseMyself}
                    onChange={(e) => {
                      setReplaceDriverUseMyself(e.target.checked);
                      setReplaceDriverError('');
                    }}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <label htmlFor="replaceDriverMyself" className="font-semibold text-xs cursor-pointer">
                    Use Myself as Replacement Driver (Owner Dual Role)
                  </label>
                </div>
              )}

              {/* Reason for Driver Replacement */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Reason for Driver Replacement</label>
                <input
                  type="text"
                  value={replaceDriverReason}
                  onChange={(e) => {
                    setReplaceDriverReason(e.target.value);
                    setReplaceDriverError('');
                  }}
                  placeholder="e.g. Driver emergency leave, illness, shift schedule conflict..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {replaceDriverError && (
                <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{replaceDriverError}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReplaceDriverModalBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReplaceDriver}
                disabled={actionLoading}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                {actionLoading ? 'Replacing...' : 'Confirm Driver Replacement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Reject Booking #{rejectModalBooking.id}</h3>
              <button onClick={() => setRejectModalBooking(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setRejectError('');
                  }}
                  placeholder="e.g. Vehicle scheduled for maintenance, all drivers engaged on outstation duty..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                />
                {rejectError && <p className="text-rose-400 text-[11px] mt-1">{rejectError}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
