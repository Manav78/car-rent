import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Users, 
  Fuel, 
  Wind, 
  RefreshCw, 
  Search,
  Zap,
  Eye,
  X,
  ShieldCheck,
  Check,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Award,
  Grid,
  List,
  Calendar,
  Key,
  Luggage,
  Sparkles
} from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { isAuthenticated } from '../../utils/authStorage';
import BookingAuthModal from '../../components/customer/BookingAuthModal';

const POPULAR_DESTINATIONS = [
  {
    name: 'Mumbai ⇄ Pune Expressway',
    distance: '150 km',
    duration: '2.5 hrs',
    recommended: 'Sedan / Electric EV',
    fare: 'From ₹1,899',
    tag: 'Express Corridor',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pune ⇄ Mahabaleshwar',
    distance: '120 km',
    duration: '3.0 hrs',
    recommended: 'Mahindra Thar 4x4 / SUV',
    fare: 'From ₹2,499',
    tag: 'Western Ghats',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mumbai ⇄ Goa Coastal',
    distance: '590 km',
    duration: '9.5 hrs',
    recommended: 'Innova Crysta 7-Seater',
    fare: 'From ₹6,499',
    tag: 'Coastal Highway',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bangalore ⇄ Mysore Highway',
    distance: '145 km',
    duration: '2.0 hrs',
    recommended: 'Prime Sedan / Nexon EV',
    fare: 'From ₹1,999',
    tag: '10-Lane Access',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80',
  },
];

const CATEGORY_TABS = [
  { label: 'All Fleet', value: '' },
  { label: 'SUVs & 4x4', value: 'SUV' },
  { label: 'Executive Sedans', value: 'SEDAN' },
  { label: 'Luxury & AMG', value: 'LUXURY' },
  { label: 'Family 7-Seater', value: '7_SEATER' },
  { label: 'Eco Electric (EV)', value: 'ELECTRIC' },
];

const QUICK_HUBS = [
  'Pune Swargate',
  'Pune Airport (PNQ)',
  'Mumbai BKC',
  'Mumbai T2 Airport (BOM)',
  'Goa Dabolim Airport (GOI)'
];

const VehicleDiscovery = () => {
  const navigate = useNavigate();

  const [allAvailableVehicles, setAllAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobility Ride Mode: 'RENTAL' | 'CHAUFFEUR' | 'OUTSTATION'
  const [rideMode, setRideMode] = useState('RENTAL');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [isSameLocationDrop, setIsSameLocationDrop] = useState(true);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeating, setSelectedSeating] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');

  // Inspect Modal State
  const [inspectVehicle, setInspectVehicle] = useState(null);

  // In-Context Booking Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetBookingVehicle, setTargetBookingVehicle] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getAvailableVehicles({ status: 'AVAILABLE' });
      const list = Array.isArray(data) ? data : [];
      setAllAvailableVehicles(list);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError('Unable to load fleet vehicles right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter & Sort Logic
  const filteredVehicles = useMemo(() => {
    let result = [...allAvailableVehicles].filter(
      (v) => (v.status || 'AVAILABLE') === 'AVAILABLE'
    );

    // Free Text Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.name || '').toLowerCase().includes(q) ||
          (v.brand || '').toLowerCase().includes(q) ||
          (v.model || '').toLowerCase().includes(q) ||
          (v.location || '').toLowerCase().includes(q) ||
          (v.vehicleType || '').toLowerCase().includes(q)
      );
    }

    // City Filter
    if (cityInput.trim()) {
      const c = cityInput.toLowerCase().trim();
      result = result.filter((v) => (v.location || '').toLowerCase().includes(c));
    }

    // Category / Type Filter
    if (selectedCategory) {
      if (selectedCategory === '7_SEATER') {
        result = result.filter((v) => Number(v.seatingCapacity) >= 7);
      } else if (selectedCategory === 'ELECTRIC') {
        result = result.filter((v) => (v.fuelType || '').toUpperCase() === 'ELECTRIC');
      } else {
        result = result.filter(
          (v) => (v.vehicleType || '').toUpperCase() === selectedCategory.toUpperCase()
        );
      }
    }

    // Seating Capacity Filter
    if (selectedSeating) {
      result = result.filter((v) => Number(v.seatingCapacity) === Number(selectedSeating));
    }

    // Fuel Type Filter
    if (selectedFuel) {
      result = result.filter(
        (v) => (v.fuelType || '').toLowerCase() === selectedFuel.toLowerCase()
      );
    }

    // Sorting
    if (sortBy === 'price_low') {
      result.sort((a, b) => (a.pricePerKm || 15) - (b.pricePerKm || 15));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.pricePerKm || 15) - (a.pricePerKm || 15));
    } else if (sortBy === 'capacity') {
      result.sort((a, b) => (b.seatingCapacity || 5) - (a.seatingCapacity || 5));
    }

    return result;
  }, [
    allAvailableVehicles,
    searchTerm,
    cityInput,
    selectedCategory,
    selectedSeating,
    selectedFuel,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCityInput('');
    setDestinationInput('');
    setSelectedCategory('');
    setSelectedSeating('');
    setSelectedFuel('');
    setSortBy('recommended');
  };

  const handleBookVehicleClick = (vehicle) => {
    const finalDrop = isSameLocationDrop ? (cityInput || vehicle.location || 'Pune Hub') : (destinationInput || 'Pune Hub');
    if (isAuthenticated()) {
      navigate('/customer/bookings/create', { 
        state: { 
          selectedVehicle: vehicle,
          pickupLocation: cityInput || vehicle.location || 'Pune Hub',
          dropoffLocation: finalDrop,
          startDate: pickupDate,
          endDate: returnDate,
          tripType: rideMode === 'OUTSTATION' ? 'OUTSTATION' : 'LOCAL'
        } 
      });
    } else {
      setTargetBookingVehicle(vehicle);
      setAuthModalOpen(true);
    }
  };

  const handlePreFillDestination = (dest) => {
    const [origin, drop] = dest.name.split(' ⇄ ');
    setCityInput(origin);
    setDestinationInput(drop);
    setIsSameLocationDrop(false);
    setRideMode('OUTSTATION');
    const catalogEl = document.getElementById('fleet-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* ========================================================= */}
      {/* 1. PROFESSIONAL MOBILITY BOOKING CONSOLE                  */}
      {/* ========================================================= */}
      <section className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-800 shadow-sm">
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
              Verified Rental & Chauffeur Fleet
            </span>
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Fleet Availability Active</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-100">
              Reserve Premium Cars & Chauffeurs.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Transparent per-km tariffs, zero security deposit, sanitized vehicles, and 24×7 roadside breakdown assistance.
            </p>
          </div>

          {/* Connected Booking Console */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 text-zinc-100 space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <button
                type="button"
                onClick={() => {
                  setRideMode('RENTAL');
                  setIsSameLocationDrop(true);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rideMode === 'RENTAL'
                    ? 'bg-amber-500 text-zinc-950 font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Self-Drive Rental</span>
              </button>
              <button
                type="button"
                onClick={() => setRideMode('CHAUFFEUR')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rideMode === 'CHAUFFEUR'
                    ? 'bg-amber-500 text-zinc-950 font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Chauffeur Drive</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRideMode('OUTSTATION');
                  setIsSameLocationDrop(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rideMode === 'OUTSTATION'
                    ? 'bg-amber-500 text-zinc-950 font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Intercity Outstation</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Pickup Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Pickup City / Hub</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Mumbai, Baner..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Destination / Drop */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>Drop-off Location</span>
                  </label>
                  {rideMode !== 'OUTSTATION' && (
                    <label className="text-[10px] text-zinc-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSameLocationDrop}
                        onChange={(e) => setIsSameLocationDrop(e.target.checked)}
                        className="rounded"
                      />
                      <span>Same city</span>
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={isSameLocationDrop ? 'Return to same location' : 'e.g. Mumbai Airport, Goa...'}
                  disabled={isSameLocationDrop}
                  value={isSameLocationDrop ? (cityInput ? `${cityInput} (Same Return)` : 'Same Location Return') : destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>

              {/* Pickup Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>Pickup Date</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Search Fleet CTA */}
              <div className="flex items-end">
                <a
                  href="#fleet-catalog"
                  className="w-full btn-mobility-amber py-2 text-xs flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Fleet ({filteredVehicles.length})</span>
                </a>
              </div>
            </div>

            {/* Quick Hub Tags */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-zinc-500 font-medium">Quick Hubs:</span>
              {QUICK_HUBS.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => setCityInput(hub.split(' ')[0])}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. VALUE PROPOSITIONS & TRUST STRIP                       */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800 text-center">
          <div className="pt-2 md:pt-0 px-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>₹0 Security Deposit</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">No blocked card funds. Zero upfront deposit required.</p>
          </div>
          <div className="pt-2 md:pt-0 px-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
              <span>Doorstep Delivery</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Sanitized car delivered to your home, hotel, or airport terminal.</p>
          </div>
          <div className="pt-2 md:pt-0 px-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Shield className="w-4 h-4" />
              <span>Insured & RTO Verified</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Comprehensive bumper-to-bumper insurance with verified fastag.</p>
          </div>
          <div className="pt-2 md:pt-0 px-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <Clock className="w-4 h-4" />
              <span>24×7 Highway SOS</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Instant on-road mechanical support and replacement coverage.</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FLEET CATALOG & REFINEMENT BAR                         */}
      {/* ========================================================= */}
      <section id="fleet-catalog" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
              Available Fleet
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Showing {filteredVehicles.length} vehicles ready for immediate reservation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs font-bold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded text-xs font-bold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="capacity">Seating Capacity</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-950 text-amber-400 border-zinc-950 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vehicle Results Grid / List */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Loading Verified Fleet...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 rounded-xl text-center text-xs text-rose-600 shadow-xs">
            {error}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
            <Car className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Vehicles Match Your Search</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              We could not find available vehicles matching this category in the selected hub. Try resetting your search filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-mobility-secondary text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear All Search Filters</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map((v) => {
              const isElectric = (v.fuelType || '').toLowerCase() === 'electric';
              return (
                <div
                  key={v.id}
                  className="mobility-card flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Vehicle Photo Container */}
                    <div className="h-44 bg-zinc-50 dark:bg-zinc-950 relative flex items-center justify-center p-4 overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
                      {v.imageUrl ? (
                        <img
                          src={v.imageUrl}
                          alt={v.model || v.brand}
                          className="h-full w-full object-contain group-hover:scale-102 transition-transform duration-200"
                        />
                      ) : (
                        <Car className="w-14 h-14 text-zinc-300 dark:text-zinc-700" />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-zinc-900/80 backdrop-blur text-white text-[10px] font-bold uppercase rounded">
                          {v.vehicleType || 'SUV'}
                        </span>
                        {isElectric && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>EV</span>
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/95 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.9</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100 leading-snug">
                          {v.brand} {v.model}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{v.location || 'Pune / Mumbai'} • Fast Pickup</span>
                        </p>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{v.seatingCapacity || 5} Seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="capitalize">{v.fuelType || 'Diesel'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Climate AC</span>
                        </div>
                      </div>

                      {/* Trust Highlights */}
                      <div className="space-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Zero Security Deposit · Free Cancellation</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-zinc-400" />
                          <span>120 km / day included with insurance</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA Footer */}
                  <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 mt-1">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-zinc-950 dark:text-zinc-100">
                          ₹{v.pricePerKm || 16}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">/ km</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium">Est. ₹{(v.pricePerKm || 16) * 120} / day</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectVehicle(v)}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Inspect Car Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookVehicleClick(v)}
                        className="btn-mobility-primary text-xs px-3.5 py-2"
                      >
                        <span>Reserve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="mobility-card p-4 flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-24 h-20 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-2 shrink-0 flex items-center justify-center">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.model} className="max-h-full object-contain" />
                    ) : (
                      <Car className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                        {v.brand} {v.model}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold">
                        {v.vehicleType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {v.location || 'Pune / Mumbai'} • {v.seatingCapacity || 5} Seats • {v.fuelType || 'Diesel'} • Automatic
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      ✓ Instant Confirmation · Zero Security Deposit
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-right">
                    <p className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                      ₹{v.pricePerKm || 16} <span className="text-xs font-semibold text-zinc-500">/ km</span>
                    </p>
                    <p className="text-[10px] text-zinc-400">₹{(v.pricePerKm || 16) * 120} est. day rate</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookVehicleClick(v)}
                    className="btn-mobility-primary text-xs"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. POPULAR INTERCITY CORRIDORS (UBER OUTSTATION STYLE)     */}
      {/* ========================================================= */}
      <section id="routes" className="space-y-4 pt-4 scroll-mt-20">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Popular Intercity Corridors
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Fixed transparent outstation tariffs with certified toll estimations and professional chauffeurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              className="mobility-card overflow-hidden group cursor-pointer"
              onClick={() => handlePreFillDestination(dest)}
            >
              <div className="h-32 relative overflow-hidden bg-zinc-900">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur text-white text-[10px] font-bold">
                    {dest.tag}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-1.5">
                <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100 leading-snug">
                  {dest.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{dest.distance} • {dest.duration}</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{dest.fare}</span>
                </div>
                <p className="text-[10px] text-zinc-400">Recommended: {dest.recommended}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FLEET OWNER & CHAUFFEUR PARTNERSHIP BANNER              */}
      {/* ========================================================= */}
      <section className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
            Partner With DriveEase
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100">
            Earn with Your Vehicle Fleet or Drive as a Certified Chauffeur.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Attach single or multi-car fleets to earn steady lease revenue. Or register as a professional chauffeur with verified trip bookings, instant weekly payouts, and insurance coverage.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login?action=signup&role=ROLE_OWNER')}
              className="btn-mobility-amber text-xs"
            >
              <Car className="w-4 h-4" />
              <span>List Fleet as Owner</span>
            </button>
            <button
              onClick={() => navigate('/login?action=signup&role=ROLE_DRIVER')}
              className="btn-mobility-secondary text-xs"
            >
              <Users className="w-4 h-4" />
              <span>Register as Chauffeur</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. INSPECT VEHICLE MODAL                                  */}
      {/* ========================================================= */}
      {inspectVehicle && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                  {inspectVehicle.brand} {inspectVehicle.model}
                </h3>
                <p className="text-xs text-zinc-500">{inspectVehicle.location || 'Pune / Mumbai Depot'}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectVehicle(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-48 bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 flex items-center justify-center overflow-hidden">
              <img
                src={inspectVehicle.imageUrl}
                alt={inspectVehicle.model}
                className="max-h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Transmission</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Automatic / Manual</span>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Fuel Efficiency</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">18.5 km/l certified</span>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Boot Capacity</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">3 Large Suitcases</span>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Safety NCAP</span>
                <span className="font-bold text-emerald-600">5-Star Certified</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                  ₹{inspectVehicle.pricePerKm || 16}
                </span>
                <span className="text-xs text-zinc-500"> / km</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = inspectVehicle;
                  setInspectVehicle(null);
                  handleBookVehicleClick(target);
                }}
                className="btn-mobility-primary text-xs"
              >
                <span>Proceed to Reserve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Context Booking Auth Modal */}
      {authModalOpen && (
        <BookingAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          selectedVehicle={targetBookingVehicle}
        />
      )}
    </div>
  );
};

export default VehicleDiscovery;
