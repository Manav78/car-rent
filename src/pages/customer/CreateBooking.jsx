import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Car, 
  ArrowLeft, 
  Phone, 
  Users, 
  FileText,
  Fuel,
  Zap,
  Info,
  Eye,
  X,
  Check,
  ShieldCheck,
  Wind,
  Image as ImageIcon
} from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { getUser } from '../../utils/authStorage';
import { useToast } from '../../context/ToastContext';

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const user = getUser();
  const preselectedVehicle = location.state?.selectedVehicle;

  const [vehicles, setVehicles] = useState(preselectedVehicle ? [preselectedVehicle] : []);
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle || null);

  const [customerPhone, setCustomerPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [tripType, setTripType] = useState('LOCAL');
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    customerApi
      .getAvailableVehicles({ status: 'AVAILABLE' })
      .then((data) => {
        if (Array.isArray(data)) {
          const avail = data.filter((v) => (v.status || 'AVAILABLE') === 'AVAILABLE');
          setVehicles(avail);
          if (preselectedVehicle) {
            const match = avail.find((v) => (v.id === preselectedVehicle.id || v.vehicleId === preselectedVehicle.vehicleId));
            setSelectedVehicle(match || preselectedVehicle);
          } else if (avail.length > 0) {
            setSelectedVehicle(avail[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching vehicles for booking:', err));
  }, [preselectedVehicle]);

  const handleVehicleChange = (vehicleId) => {
    const found = vehicles.find((v) => (v.vehicleId || v.id) === parseInt(vehicleId));
    setSelectedVehicle(found || null);
    setActiveImageIndex(0);
  };

  const getVehicleImageList = (v) => {
    if (!v) return [];
    const list = [];
    if (v.images && typeof v.images === 'object') {
      if (v.images.front) list.push({ label: 'Front Exterior', url: v.images.front });
      if (v.images.back) list.push({ label: 'Rear View', url: v.images.back });
      if (v.images.interior) list.push({ label: 'Cabin Interior', url: v.images.interior });
    }
    if (list.length === 0 && v.imageUrl) {
      list.push({ label: 'Main View', url: v.imageUrl });
    }
    return list;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVehicle || !startDate || !endDate || !pickupLocation || !dropoffLocation || !customerPhone) {
      showToast('Please complete all required itinerary fields.', 'warning');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      showToast('End Date cannot be earlier than Start Date.', 'warning');
      return;
    }

    const parsedPassengerCount = Math.max(1, parseInt(passengerCount, 10) || 1);
    const maxCapacity = selectedVehicle.seatingCapacity || 5;
    if (parsedPassengerCount > maxCapacity) {
      showToast(`Passenger count (${parsedPassengerCount}) exceeds vehicle seating capacity (${maxCapacity} seats).`, 'warning');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vehicleId: selectedVehicle.vehicleId || selectedVehicle.id,
        customerPhone,
        startDate,
        endDate,
        pickupLocation,
        dropoffLocation,
        tripType,
        passengerCount: parsedPassengerCount,
        notes,
      };

      await customerApi.createBooking(payload);
      showToast('🎉 Reservation request submitted! Status set to PENDING owner approval.', 'success');
      setTimeout(() => {
        navigate('/customer/bookings');
      }, 1000);
    } catch (err) {
      console.error('Failed to submit booking:', err);
      showToast(err.response?.data?.message || 'Failed to submit booking request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create Vehicle Reservation</h1>
          <p className="text-xs text-slate-400">Specify trip dates, pickup points, and itinerary details for vehicle owner dispatch.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 md:p-7 shadow-2xl space-y-6 backdrop-blur">
          {/* Vehicle Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Available Vehicle
            </label>
            <div className="relative">
              <Car className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400" />
              <select
                value={selectedVehicle ? (selectedVehicle.vehicleId || selectedVehicle.id) : ''}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              >
                <option value="">-- Select Available Car --</option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId || v.id} value={v.vehicleId || v.id}>
                    {v.brand ? `${v.brand} ${v.model}` : v.name} • {v.seatingCapacity} Seats • ₹{v.ratePerKm || v.pricePerKm || 15}/KM ({v.city || 'Pune'})
                  </option>
                ))}
              </select>
            </div>
            {vehicles.length === 0 && (
              <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>No available cars found. Please browse available vehicles first.</span>
              </p>
            )}
          </div>

          {/* Contact Mobile */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Customer Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98220 11223"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Pickup & Dropoff Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400" />
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Pune Station, CSMT Airport..."
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Drop Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-rose-400" />
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Mahabaleshwar, Goa Beach..."
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Trip Type & Passenger Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Trip Category
              </label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="LOCAL">LOCAL (Intra-city Ride)</option>
                <option value="OUTSTATION">OUTSTATION (Inter-city Tour)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Passengers (Max: {selectedVehicle?.seatingCapacity || 5})
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-indigo-400 pointer-events-none" />
                  <input
                    type="number"
                    min={1}
                    max={selectedVehicle?.seatingCapacity || 10}
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(passengerCount, 10);
                      const max = selectedVehicle?.seatingCapacity || 10;
                      if (!val || val < 1) setPassengerCount(1);
                      else if (val > max) setPassengerCount(max);
                      else setPassengerCount(val);
                    }}
                    placeholder="e.g. 2"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(passengerCount, 10) || 1;
                      if (current > 1) setPassengerCount(current - 1);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-sm flex items-center justify-center transition-colors border border-slate-800"
                    aria-label="Decrease passenger count"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-300">
                    {parseInt(passengerCount, 10) || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(passengerCount, 10) || 1;
                      const max = selectedVehicle?.seatingCapacity || 10;
                      if (current < max) setPassengerCount(current + 1);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-sm flex items-center justify-center transition-colors border border-slate-800"
                    aria-label="Increase passenger count"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Trip Notes / Luggage Instructions
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Luggage carrier requirement, extra stopovers, timing..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/customer/vehicles')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedVehicle}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              {loading ? 'Submitting Reservation...' : 'Submit Reservation Request'}
            </button>
          </div>
        </form>

        {/* Right 1 Col: Selected Vehicle Summary & Specs Modal Trigger */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Selected Vehicle Preview</span>
            </h3>

            {selectedVehicle ? (
              <div className="space-y-4">
                <div className="h-40 bg-slate-950 rounded-2xl p-3 flex items-center justify-center relative overflow-hidden border border-slate-800">
                  {selectedVehicle.imageUrl ? (
                    <img src={selectedVehicle.imageUrl} alt={selectedVehicle.model} className="h-full object-contain" />
                  ) : (
                    <Car className="w-16 h-16 text-slate-700" />
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-lg uppercase">
                    AVAILABLE
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedVehicle.brand ? `${selectedVehicle.brand} ${selectedVehicle.model}` : selectedVehicle.name} ({selectedVehicle.year || 2024})
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Stationed in {selectedVehicle.city || 'Pune'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Capacity</span>
                      <span>{selectedVehicle.seatingCapacity || 5} Seats</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Fuel</span>
                      <span>{selectedVehicle.fuelType || 'Diesel'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Standard Tariff</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ₹ {selectedVehicle.pricePerKm || 15} <span className="text-xs font-normal text-slate-400">/ KM</span>
                  </span>
                </div>

                {/* Inspect Full Vehicle Specs Button */}
                <button
                  type="button"
                  onClick={() => setShowVehicleDetailsModal(true)}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>View Full Car Specs & Gallery</span>
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-500 space-y-2">
                <Car className="w-10 h-10 text-slate-700 mx-auto" />
                <p>Select a vehicle to preview itinerary details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL VEHICLE SPECIFICATION MODAL */}
      {showVehicleDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Operational Vehicle</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year || 2024})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stationed in {selectedVehicle.city || 'Pune'} • Owned by {selectedVehicle.ownerName || 'Apex Auto Rentals'}</span>
                </p>
              </div>

              <button
                onClick={() => setShowVehicleDetailsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              {(() => {
                const images = getVehicleImageList(selectedVehicle);
                const currentImg = images[activeImageIndex] || images[0];

                return (
                  <div className="space-y-2">
                    <div className="h-64 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-4 relative">
                      {currentImg ? (
                        <img
                          src={currentImg.url}
                          alt={currentImg.label}
                          className="h-full w-full object-contain transition-all duration-300"
                        />
                      ) : (
                        <Car className="w-20 h-20 text-slate-700 opacity-60" />
                      )}
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700">
                        {currentImg?.label || 'Vehicle View'}
                      </span>
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 ${
                              activeImageIndex === idx
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{img.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle Type</span>
                <p className="font-extrabold text-slate-200">{selectedVehicle.vehicleType || 'SUV'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Seating</span>
                <p className="font-extrabold text-indigo-400">{selectedVehicle.seatingCapacity || 5} Seats</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Fuel Type</span>
                <p className="font-extrabold text-emerald-400">{selectedVehicle.fuelType || 'DIESEL'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tariff Rate</span>
                <p className="font-extrabold text-emerald-400 font-mono">₹ {selectedVehicle.pricePerKm || selectedVehicle.ratePerKm || 15} / KM</p>
              </div>
            </div>

            {selectedVehicle.description && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
                <span className="text-[10px] font-bold text-slate-300 block mb-1">Description</span>
                {selectedVehicle.description}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVehicleDetailsModal(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Proceed with Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBooking;
