import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Users, 
  Fuel, 
  Wind, 
  RefreshCw, 
  CheckCircle2, 
  Search,
  Zap,
  Eye,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Star,
  Compass,
  ArrowRight,
  Shield,
  Clock,
  Award,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Calendar,
  Key,
  BadgePercent
} from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { VEHICLE_TYPES, SEATING_CAPACITIES } from '../../utils/constants';
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
    tag: 'Holiday Special',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bangalore ⇄ Mysore Highway',
    distance: '145 km',
    duration: '2.0 hrs',
    recommended: 'Prime Sedan / Nexon EV',
    fare: 'From ₹1,999',
    tag: '10-Lane Expressway',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80',
  },
];

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: '₹0 Security Deposit',
    description: 'No blocked credit card funds. Pay only for the journey you actually drive.',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
  },
  {
    icon: Zap,
    title: 'Doorstep Delivery',
    description: 'Clean, sanitized vehicle delivered straight to your home, office, or airport gate.',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
  },
  {
    icon: Award,
    title: 'Verified Chauffeurs',
    description: 'Police & RTO background checked, professional drivers with 4.8+ passenger ratings.',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
  },
  {
    icon: Clock,
    title: '24×7 Roadside SOS',
    description: 'Instant on-road mechanical support, tyre changes, and vehicle replacement across highways.',
    color: 'text-slate-800 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  }
];

const CATEGORY_TABS = [
  { label: 'All Fleet', value: '', icon: Car },
  { label: 'SUVs & 4x4', value: 'SUV', icon: Car },
  { label: 'Executive Sedans', value: 'SEDAN', icon: Car },
  { label: 'Luxury & AMG', value: 'LUXURY', icon: Sparkles },
  { label: 'Family 7-Seater', value: '7_SEATER', icon: Users },
  { label: 'Eco Electric (EV)', value: 'ELECTRIC', icon: Zap },
];

const VehicleDiscovery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [allAvailableVehicles, setAllAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobility Ride Mode: 'RENTAL' | 'CHAUFFEUR' | 'OUTSTATION'
  const [rideMode, setRideMode] = useState('RENTAL');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeating, setSelectedSeating] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');

  // Inspect Modal State
  const [inspectVehicle, setInspectVehicle] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    if (isAuthenticated()) {
      navigate('/customer/bookings/create', { 
        state: { 
          selectedVehicle: vehicle,
          pickupLocation: cityInput || vehicle.location || 'Pune',
          dropoffLocation: destinationInput || 'Same City Return',
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
    setCityInput(dest.name.split(' ⇄ ')[0]);
    setDestinationInput(dest.name.split(' ⇄ ')[1]);
    setRideMode('OUTSTATION');
    const catalogEl = document.getElementById('fleet-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* ========================================================= */}
      {/* 1. OLA/UBER STYLE HERO & MOBILITY BOOKING CONSOLE          */}
      {/* ========================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Car Rental & Chauffeur Mobility Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Book Self-Drive Rentals & Chauffeur Rides in Minutes.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Transparent per-km tariffs, zero security deposit, sanitized vehicles, and 24×7 roadside assistance across Maharashtra & Goa.
            </p>
          </div>

          {/* Interactive Mobility Console */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setRideMode('RENTAL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  rideMode === 'RENTAL'
                    ? 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Self-Drive Car</span>
              </button>
              <button
                type="button"
                onClick={() => setRideMode('CHAUFFEUR')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  rideMode === 'CHAUFFEUR'
                    ? 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Chauffeur Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setRideMode('OUTSTATION')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  rideMode === 'OUTSTATION'
                    ? 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Outstation (Intercity)</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Pickup Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>Pickup City / Area</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Mumbai, Baner..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Destination / Drop */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span>Drop-off Destination</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goa, Airport, Same City..."
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Pickup Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Pickup Date</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Search CTA */}
              <div className="flex items-end">
                <a
                  href="#fleet-catalog"
                  className="w-full btn-mobility-amber py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Available Cars</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SCIENCE OF MOBILITY / TRUST PILLARS                     */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5"
            >
              <div className={`p-2.5 rounded-xl border ${pillar.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{pillar.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ========================================================= */}
      {/* 3. FLEET CATALOG & REAL-TIME FILTERS (ID: fleet-catalog)   */}
      {/* ========================================================= */}
      <section id="fleet-catalog" className="space-y-6 scroll-mt-20">
        {/* Category Filter Chips Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">
              Verified Fleet Available
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant booking with certified vehicle health and clean maintenance records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
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
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="capacity">Seating Capacity</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-amber-400 border-slate-950 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vehicle Results Grid / List */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Loading Verified Fleet...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-2xl text-center text-xs text-rose-600 shadow-sm">
            {error}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-sm">
            <Car className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Vehicles Match Your Search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any available vehicles matching your criteria. Try resetting your search filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-mobility-primary text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear All Search Filters</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((v) => {
              const isElectric = (v.fuelType || '').toLowerCase() === 'electric';
              const isSuv = (v.vehicleType || '').toLowerCase() === 'suv';

              return (
                <div
                  key={v.id}
                  className="mobility-card flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Vehicle Photo Container */}
                    <div className="h-48 bg-slate-100 dark:bg-slate-800/60 relative flex items-center justify-center p-4 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                      {v.imageUrl ? (
                        <img
                          src={v.imageUrl}
                          alt={v.model || v.brand}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Car className="w-16 h-16 text-slate-300" />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase rounded-lg shadow-xs">
                          {v.vehicleType || 'SUV'}
                        </span>
                        {isElectric && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 text-[10px] font-bold rounded-lg flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>EV Eco</span>
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-slate-950/80 text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.9 (90+)</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                          {v.brand} {v.model}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{v.location || 'Pune / Mumbai'} • Fast Pickup</span>
                        </p>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.seatingCapacity || 5} Seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span className="capitalize">{v.fuelType || 'Diesel'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-slate-400" />
                          <span>AC Air Care</span>
                        </div>
                      </div>

                      {/* Trust Highlights */}
                      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Zero Security Deposit • Free Cancellation</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-slate-400" />
                          <span>150 km / day included with comprehensive insurance</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA Footer */}
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 mt-2">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-950 dark:text-slate-100">
                          ₹{v.pricePerKm || 16}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">/ km</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Est. ₹{(v.pricePerKm || 16) * 120} / day</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectVehicle(v)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Inspect Car"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookVehicleClick(v)}
                        className="btn-mobility-primary text-xs px-4 py-2"
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
          <div className="space-y-4">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="mobility-card p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-24 h-24 sm:w-32 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded-xl p-2 shrink-0 flex items-center justify-center">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.model} className="max-h-full object-contain" />
                    ) : (
                      <Car className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {v.brand} {v.model}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {v.vehicleType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {v.location || 'Pune / Mumbai'} • {v.seatingCapacity || 5} Seats • {v.fuelType || 'Diesel'} • Automatic
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      ✓ Instant Confirmation • Zero Deposit
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                      ₹{v.pricePerKm || 16} <span className="text-xs font-semibold text-slate-500">/ km</span>
                    </p>
                    <p className="text-[10px] text-slate-400">₹{(v.pricePerKm || 16) * 120} est. day rate</p>
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
      {/* 4. POPULAR INTERCITY ROUTES (UBER OUTSTATION STYLE)        */}
      {/* ========================================================= */}
      <section id="routes" className="space-y-6 pt-4 scroll-mt-20">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">
            Popular Intercity Corridors
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fixed transparent outstation tariffs with certified toll estimations and professional chauffeurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              className="mobility-card overflow-hidden group cursor-pointer"
              onClick={() => handlePreFillDestination(dest)}
            >
              <div className="h-36 relative overflow-hidden bg-slate-900">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold">
                    {dest.tag}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                  {dest.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{dest.distance} • {dest.duration}</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{dest.fare}</span>
                </div>
                <p className="text-[10px] text-slate-400">Ideal for: {dest.recommended}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FLEET OWNER & DRIVER RECRUITMENT CALLOUT               */}
      {/* ========================================================= */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            Partner With DriveEase
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Earn with Your Fleet or Drive as a Certified Chauffeur.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Attach single or multi-car fleets to earn steady lease revenue. Or join as a professional driver with verified trips, instant weekly payouts, and insurance coverage.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login?action=signup&role=ROLE_OWNER')}
              className="btn-mobility-amber text-xs"
            >
              <Car className="w-4 h-4" />
              <span>List Your Vehicle Fleet</span>
            </button>
            <button
              onClick={() => navigate('/login?action=signup&role=ROLE_DRIVER')}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {inspectVehicle.brand} {inspectVehicle.model}
                </h3>
                <p className="text-xs text-slate-500">{inspectVehicle.location || 'Pune / Mumbai'}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectVehicle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-52 bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
              <img
                src={inspectVehicle.imageUrl}
                alt={inspectVehicle.model}
                className="max-h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Transmission</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Automatic / Manual</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Fuel Economy</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">18.5 km/l certified</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Luggage Boot</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">3 Large Suitcases</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Safety Rating</span>
                <span className="font-bold text-emerald-600">5-Star Global NCAP</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                  ₹{inspectVehicle.pricePerKm || 16}
                </span>
                <span className="text-xs text-slate-500"> / km</span>
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
