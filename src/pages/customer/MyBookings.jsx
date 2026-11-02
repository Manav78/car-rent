import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Lock, 
  Car, 
  RefreshCw, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Phone,
  X
} from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import StatusBadge from '../../components/ui/StatusBadge';
import { STATUS } from '../../utils/constants';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED'
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');
  const [cancelling, setCancelling] = useState(false);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setCancelling(true);
      await customerApi.cancelBooking(cancelModalBooking.id, cancelReason);
      setCancelModalBooking(null);
      fetchBookings(true);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  const fetchBookings = async (bypass = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getAllBookings({ bypassCache: bypass });
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error('Error loading my bookings:', err);
      setError('Unable to load trip bookings right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(false);
  }, []);

  const pendingCount = bookings.filter(b => b.status === STATUS.PENDING || b.status === STATUS.ACCEPTED).length;
  const activeCount = bookings.filter(b => b.status === STATUS.CONFIRMED || b.status === STATUS.IN_PROGRESS || b.status === 'TRIP_STARTED').length;
  const completedCount = bookings.filter(b => b.status === STATUS.COMPLETED || b.status === 'TRIP_COMPLETED' || b.status === STATUS.CANCELLED || b.status === STATUS.REJECTED).length;

  const filteredBookings = bookings.filter((b) => {
    if (tab === 'PENDING') return b.status === STATUS.PENDING || b.status === STATUS.ACCEPTED;
    if (tab === 'CONFIRMED') return b.status === STATUS.CONFIRMED || b.status === STATUS.IN_PROGRESS || b.status === 'TRIP_STARTED';
    if (tab === 'COMPLETED') return b.status === STATUS.COMPLETED || b.status === 'TRIP_COMPLETED' || b.status === STATUS.CANCELLED || b.status === STATUS.REJECTED;
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">My Bookings & Trips</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track reservation requests, verified driver contact info, trip-start OTPs, and completed journeys.
          </p>
        </div>
        <button
          onClick={() => fetchBookings(true)}
          className="self-start sm:self-center px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex flex-wrap bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1.5 text-xs">
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            tab === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setTab('PENDING')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            tab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({pendingCount})</span>
        </button>
        <button
          onClick={() => setTab('CONFIRMED')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            tab === 'CONFIRMED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed & Active ({activeCount})</span>
        </button>
        <button
          onClick={() => setTab('COMPLETED')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            tab === 'COMPLETED'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-purple-400 hover:text-purple-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Completed & Past ({completedCount})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Fetching trip reservations...</p>
        </div>
      ) : error ? (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 shadow-xl">
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3 shadow-xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Reservations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tab === 'PENDING' ? 'No pending requests under review.' : tab === 'CONFIRMED' ? 'No active trips at the moment.' : tab === 'COMPLETED' ? 'No completed past trips found in your account history.' : 'You have not booked any trips yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((b) => {
            const isPending = b.status === STATUS.PENDING;
            const isAccepted = b.status === STATUS.ACCEPTED;
            const isConfirmed = b.status === STATUS.CONFIRMED;
            const isInProgress = b.status === STATUS.IN_PROGRESS || b.status === 'TRIP_STARTED';
            const isCompleted = b.status === STATUS.COMPLETED || b.status === 'TRIP_COMPLETED';
            const isRejected = b.status === STATUS.REJECTED;

            return (
              <div
                key={b.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur transition-all space-y-4"
              >
                {/* Booking Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 font-extrabold text-xs font-mono">
                      #{b.bookingReference || b.id}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-400" />
                        <span>{b.vehicleName || b.vehicleBrand || 'Standard Vehicle'}</span>
                        {b.vehicleNumber && (
                          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                            {b.vehicleNumber}
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Requested on: {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'} • Trip Type: <strong className="text-slate-300 font-semibold">{b.tripType || 'Outstation'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {(isPending || isAccepted || isConfirmed) && (
                      <button
                        onClick={() => {
                          setCancelModalBooking(b);
                          setCancelReason('Change of travel plans');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Cancel Reservation"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs text-slate-300">
                  <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong className="text-slate-200">Trip Schedule:</strong>{' '}
                        {b.startDate} {b.pickupTime || '09:00 AM'} → {b.endDate || b.startDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>
                        <strong className="text-slate-200">Pickup:</strong> {b.pickupLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        <strong className="text-slate-200">Destination:</strong> {b.dropoffLocation}
                      </span>
                    </div>
                    {b.passengers && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                        <span>Passengers: <strong className="text-slate-200">{b.passengers}</strong></span>
                        <span>Preference: <strong className="text-slate-200">{b.acPreference ? 'AC Enabled' : 'Standard'}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Status-Specific Dynamic Panel (Prompt Section 18 & 19) */}
                  <div className="bg-slate-950/70 border border-slate-800/60 p-4 rounded-2xl flex flex-col justify-center space-y-2">
                    {isPending && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Owner Review Pending
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          The vehicle owner will review your booking request and contact you to agree on final rental tariff.
                        </p>
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                          ℹ️ Driver details will unlock once confirmed.
                        </div>
                      </div>
                    )}

                    {isAccepted && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Booking Accepted — Driver Dispatch in Progress
                        </span>
                        {b.agreedAmount && (
                          <p className="text-xs text-slate-200">
                            Agreed Rental Amount: <strong className="text-emerald-400 font-extrabold">₹{b.agreedAmount}</strong>
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          Owner has accepted your booking and is assigning an eligible driver.
                        </p>
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          Confirmed Driver & Vehicle Details
                        </span>
                        <div className="space-y-1.5 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                          <p className="font-bold text-slate-100 flex items-center justify-between">
                            <span>{b.driverName || 'Assigned Driver'}</span>
                            <span className="text-[11px] font-mono text-emerald-400">{b.driverPhone || '+91 98765 43210'}</span>
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Vehicle Plate: <strong className="font-mono text-slate-100">{b.vehicleNumber || 'MH-12-REG'}</strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {isInProgress && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5" />
                          Trip in Progress • Active Journey
                        </span>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl space-y-1.5">
                          <p className="font-bold text-slate-100 flex items-center justify-between">
                            <span>{b.driverName || 'Assigned Driver'}</span>
                            <span className="text-[11px] font-mono text-indigo-300">{b.driverPhone || '+91 98765 43210'}</span>
                          </p>
                          <p className="text-[11px] text-slate-300 flex items-center justify-between">
                            <span>Vehicle: <strong className="font-mono text-slate-100">{b.vehicleNumber || 'MH-12-REG'}</strong></span>
                            <span className="text-emerald-400 font-bold text-[10px] uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">On the Road</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="space-y-1.5 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Journey Successfully Completed
                        </span>
                        <p className="text-xs text-slate-300">
                          Completed on: {b.completedAt || b.endDate || 'Recent'}
                        </p>
                      </div>
                    )}

                    {isRejected && (
                      <div className="space-y-1.5 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Booking Request Rejected
                        </span>
                        <p className="text-xs text-slate-300">
                          Reason: <strong className="text-rose-200">{b.rejectionReason || b.reason || 'No specific reason provided'}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-100">Cancel Reservation</h3>
              </div>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to cancel booking <strong className="text-emerald-400 font-mono">#{cancelModalBooking.bookingReference || cancelModalBooking.id}</strong> for <strong className="text-slate-100">{cancelModalBooking.vehicleName || cancelModalBooking.vehicleBrand || 'Vehicle'}</strong>?
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Cancellation Reason
              </label>
              <div className="space-y-1.5">
                {[
                  'Change of travel plans',
                  'Found alternative transport',
                  'Incorrect dates selected',
                  'Cost higher than expected',
                  'Other reason',
                ].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      cancelReason === r
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {cancelling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

