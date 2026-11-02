import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Car, 
  Filter, 
  MapPin, 
  Users, 
  Fuel, 
  CalendarPlus, 
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
  ArrowLeft,
  Shield,
  Clock,
  Award,
  Grid,
  List,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  BadgePercent,
  Image as ImageIcon,
  Navigation as NavIcon
} from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { VEHICLE_TYPES, SEATING_CAPACITIES } from '../../utils/constants';
import { isAuthenticated } from '../../utils/authStorage';
import BookingAuthModal from '../../components/customer/BookingAuthModal';

const HERO_SLIDES = [
  {
    id: 1,
    categoryKey: '7_SEATER',
    badge: '🏖️ Outstation Special • Pune ⇄ Goa / Mahabaleshwar',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    title: 'Spacious Family Comfort for Outstation Journeys',
    subtitle: 'Toyota Innova Crysta VX • 7-Seater Luxury with Extra Boot Space & Dual Climate AC',
    description: 'Perfect for long-distance family road trips and coastal drives. Equipped with captain executive seats, roof luggage carrier, dual front airbags, and certified chauffeurs.',
    features: ['7 Executive Seats', 'Diesel Turbo Power', 'Dual Climate AC Vents', 'Luggage Roof Rack'],
    pricePerKm: 22,
    rateEstimate: '₹2,640 / Day',
    carName: 'Toyota Innova Crysta VX',
    city: 'Pune / Mumbai',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=80',
    rating: '4.9 ★ (240+ Trips)',
    vehicleRefId: 1,
  },
  {
    id: 2,
    categoryKey: 'SUV',
    badge: '⛰️ Western Ghats Off-Road • Pune ⇄ Mahabaleshwar & Konkan',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    title: 'Conquer Monsoon Trails & Mountain Escapes',
    subtitle: 'Mahindra Thar 4x4 LX • All-Terrain 4WD with Convertible Hardtop & High Ground Clearance',
    description: 'Engineered for Western Ghat mountain trails and rugged tours. Features low-ratio 4x4 transfer case, roll-cage safety, and all-terrain tyres for extreme reliability.',
    features: ['Low-Range 4x4 AWD', 'All-Terrain Tyres', 'Hill Descent Control', 'Roll Cage Protection'],
    pricePerKm: 20,
    rateEstimate: '₹2,400 / Day',
    carName: 'Mahindra Thar 4x4 LX',
    city: 'Kolhapur / Pune',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&auto=format&fit=crop&q=80',
    rating: '4.95 ★ (190+ Trips)',
    vehicleRefId: 2,
  },
  {
    id: 3,
    categoryKey: 'ELECTRIC',
    badge: '⚡ 100% Electric • Zero Emissions • Mumbai ⇄ Pune Expressway',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    title: 'Silent, High-Tech Luxury with 400+ KM Range',
    subtitle: 'Tata Nexon EV Max • Instant Torque, Fast DC Charging & Ventilated Luxury Seats',
    description: 'Zip across the Mumbai-Pune Expressway with zero tailpipe emissions, silent electric drive, electronic glass sunroof, wireless phone charging, and Harman 8-speaker audio.',
    features: ['Zero Tailpipe Emission', 'Fast DC Charging Support', 'Electronic Sunroof', 'Harman 8-Speaker Audio'],
    pricePerKm: 16,
    rateEstimate: '₹1,920 / Day',
    carName: 'Tata Nexon EV Max',
    city: 'Sangli / Pune',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&auto=format&fit=crop&q=80',
    rating: '4.9 ★ (150+ Trips)',
    vehicleRefId: 3,
  },
  {
    id: 4,
    categoryKey: 'LUXURY',
    badge: '👑 Executive Class • Corporate & VIP Events • Mumbai & Pune',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    title: 'Arrive in Executive Class & Pure Prestige',
    subtitle: 'Mercedes-Benz C-Class AMG Line • VIP Corporate Transport & Wedding Escorts',
    description: 'Chauffeured luxury for corporate delegations, wedding escorts, and airport VIP pickups. Features Nappa leather upholstery, Burmester 3D audio, and 64-color ambient lighting.',
    features: ['Nappa Leather Interior', 'Burmester 3D Sound', 'Panoramic Glass Sunroof', 'VIP Uniformed Chauffeur'],
    pricePerKm: 45,
    rateEstimate: '₹5,400 / Day',
    carName: 'Mercedes-Benz C-Class AMG',
    city: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=80',
    rating: '5.0 ★ (95+ VIP Escorts)',
    vehicleRefId: 4,
  },
];

const POPULAR_DESTINATIONS = [
  {
    name: 'Mumbai ⇄ Goa Coastal Highway',
    distance: '590 km',
    duration: '9.5 hrs',
    recommended: 'Toyota Innova Crysta / Fortuner',
    tag: 'Scenic Coastal Route',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pune ⇄ Mahabaleshwar & Panchgani',
    distance: '120 km',
    duration: '3.0 hrs',
    recommended: 'Mahindra Thar 4x4 / Nexon EV',
    tag: 'Hill Station & Ghats',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mumbai ⇄ Lonavala & Khandala',
    distance: '85 km',
    duration: '2.0 hrs',
    recommended: 'Honda City / Swift Dzire',
    tag: 'Weekend Express',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kolhapur ⇄ Goa Western Ghats',
    distance: '215 km',
    duration: '4.5 hrs',
    recommended: 'Scorpio-N / Innova',
    tag: 'Nature Trail',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sameer Joshi',
    city: 'Pune',
    rating: 5,
    car: 'Toyota Innova Crysta',
    comment: 'Booked an Innova for our family trip to Goa. Flawless vehicle condition, crystal clear tariff, and the driver arrived 15 mins before time!',
  },
  {
    name: 'Pooja Kulkarni',
    city: 'Mumbai',
    rating: 5,
    car: 'Tata Nexon EV Max',
    comment: 'Rented the Nexon EV for a weekend trip to Lonavala. Smooth silent drive and great battery health. Super transparent booking with zero hidden charges.',
  },
  {
    name: 'Amit Deshmukh',
    city: 'Kolhapur',
    rating: 5,
    car: 'Mahindra Thar 4x4',
    comment: 'The Thar 4x4 handled the monsoon Western Ghats with ease. Excellent customer support and instant confirmation!',
  },
];

const CATEGORY_TABS = [
  { label: 'All Fleet', value: '' },
  { label: 'SUVs & 4x4', value: 'SUV' },
  { label: 'Executive Sedans', value: 'SEDAN' },
  { label: 'Luxury & AMG', value: 'LUXURY' },
  { label: 'Family 7-Seaters', value: '7_SEATER' },
  { label: 'Eco Electric (EV)', value: 'ELECTRIC' },
];

const VehicleDiscovery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [allAvailableVehicles, setAllAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hero Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const sliderTimerRef = useRef(null);

  // Search & Filter States (Customer Free-Form Text Entry)
  const [searchTerm, setSearchTerm] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedSeating, setSelectedSeating] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price_low' | 'price_high' | 'capacity'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

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

  // Automatic Hero Carousel Timer
  useEffect(() => {
    if (isSliderPaused) return;

    sliderTimerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => {
      if (sliderTimerRef.current) clearInterval(sliderTimerRef.current);
    };
  }, [isSliderPaused]);

  const activeSlide = HERO_SLIDES[currentSlideIndex];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // Filter & Sort Logic
  const filteredVehicles = useMemo(() => {
    let result = [...allAvailableVehicles].filter(
      (v) => (v.status || 'AVAILABLE') === 'AVAILABLE'
    );

    // Free Text Search by Keyword (brand, model, name, city, type)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.brand || '').toLowerCase().includes(term) ||
          (v.model || '').toLowerCase().includes(term) ||
          (v.name || '').toLowerCase().includes(term) ||
          (v.city || '').toLowerCase().includes(term) ||
          (v.vehicleType || '').toLowerCase().includes(term)
      );
    }

    // Free Text Customer City Input
    if (cityInput.trim()) {
      const c = cityInput.toLowerCase().trim();
      result = result.filter((v) => 
        (v.city || '').toLowerCase().includes(c) ||
        (v.location || '').toLowerCase().includes(c)
      );
    }

    // Category Quick Tabs
    if (selectedCategory) {
      if (selectedCategory === '7_SEATER') {
        result = result.filter((v) => Number(v.seatingCapacity) >= 7);
      } else if (selectedCategory === 'ELECTRIC') {
        result = result.filter((v) => (v.fuelType || '').toLowerCase() === 'electric');
      } else {
        result = result.filter(
          (v) => (v.vehicleType || '').toLowerCase() === selectedCategory.toLowerCase()
        );
      }
    }

    // Body Type Filter
    if (selectedVehicleType) {
      result = result.filter(
        (v) => (v.vehicleType || '').toLowerCase() === selectedVehicleType.toLowerCase()
      );
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
    selectedVehicleType,
    selectedSeating,
    selectedFuel,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCityInput('');
    setSelectedCategory('');
    setSelectedVehicleType('');
    setSelectedSeating('');
    setSelectedFuel('');
    setSortBy('recommended');
  };

  const handleBookVehicleClick = (vehicle) => {
    if (isAuthenticated()) {
      navigate('/customer/bookings/create', { state: { selectedVehicle: vehicle } });
    } else {
      setTargetBookingVehicle(vehicle);
      setAuthModalOpen(true);
    }
  };

  const handleBookSlideVehicle = (slide) => {
    const matchedVehicle = allAvailableVehicles.find((v) => v.id === slide.vehicleRefId) || {
      id: slide.vehicleRefId,
      name: slide.carName,
      brand: slide.carName.split(' ')[0],
      model: slide.carName.split(' ').slice(1).join(' '),
      pricePerKm: slide.pricePerKm,
      city: slide.city.split(' / ')[0],
      imageUrl: slide.image,
      seatingCapacity: slide.categoryKey === '7_SEATER' ? 7 : 5,
      fuelType: slide.categoryKey === 'ELECTRIC' ? 'Electric' : 'Diesel',
    };

    handleBookVehicleClick(matchedVehicle);
  };

  const openInspectModal = (vehicle) => {
    setInspectVehicle(vehicle);
    setActiveImageIndex(0);
  };

  const openInspectSlideVehicle = (slide) => {
    const matchedVehicle = allAvailableVehicles.find((v) => v.id === slide.vehicleRefId) || {
      id: slide.vehicleRefId,
      brand: slide.carName.split(' ')[0],
      model: slide.carName.split(' ').slice(1).join(' '),
      pricePerKm: slide.pricePerKm,
      city: slide.city.split(' / ')[0],
      imageUrl: slide.image,
      seatingCapacity: slide.categoryKey === '7_SEATER' ? 7 : 5,
      fuelType: slide.categoryKey === 'ELECTRIC' ? 'Electric' : 'Diesel',
      description: slide.description,
      features: slide.features,
    };
    openInspectModal(matchedVehicle);
  };

  const getVehicleImageList = (v) => {
    if (!v) return [];
    const list = [];
    if (v.images && typeof v.images === 'object') {
      if (v.images.front) list.push({ label: 'Front Exterior', url: v.images.front });
      if (v.images.back) list.push({ label: 'Rear Profile', url: v.images.back });
      if (v.images.interior) list.push({ label: 'Cabin Interior', url: v.images.interior });
    }
    if (list.length === 0 && v.imageUrl) {
      list.push({ label: 'Main Exterior', url: v.imageUrl });
    }
    return list;
  };

  const hasActiveFilters =
    searchTerm ||
    cityInput ||
    selectedCategory ||
    selectedVehicleType ||
    selectedSeating ||
    selectedFuel;

  const scrollToFleet = () => {
    const el = document.getElementById('fleet-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* ========================================================= */}
      {/* 1. INTERACTIVE HERO SLIDER & PARTITIONED SHOWCASE         */}
      {/* ========================================================= */}
      <section 
        className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300"
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        {/* Ambient Studio Lighting Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Category Quick Tabs Header within Hero */}
        <div className="relative z-20 px-6 pt-5 sm:px-8 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  currentSlideIndex === idx
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 font-extrabold'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <span>{slide.badge.split(' • ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Slider Pagination Controls */}
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              0{currentSlideIndex + 1} / 0{HERO_SLIDES.length}
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Partitioned Slide Body */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px]">
          
          {/* Left Partition: Experience Storytelling, Value Props & CTAs */}
          <div className="lg:col-span-7 space-y-5 animate-in fade-in duration-300">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${activeSlide.badgeColor} shadow-sm`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeSlide.badge}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
                {activeSlide.title}
              </h1>
              <p className="text-sm font-semibold text-emerald-400">
                {activeSlide.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {activeSlide.description}
              </p>
            </div>

            {/* Spec Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-1">
              {activeSlide.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate font-semibold">{feat}</span>
                </div>
              ))}
            </div>

            {/* Tariff & Action Buttons */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tariff:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{activeSlide.pricePerKm}
                </span>
                <span className="text-xs text-slate-400">/ KM</span>
                <span className="text-xs text-slate-400 ml-1">({activeSlide.rateEstimate})</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openInspectSlideVehicle(activeSlide)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Full Specs</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBookSlideVehicle(activeSlide)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Reserve This Car</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Partition: High-Resolution Automotive Studio Showcase */}
          <div className="lg:col-span-5 relative animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              
              {/* Studio Backdrop & Vehicle Photo */}
              <div className="h-56 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden border border-slate-800/80">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.carName}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Rating Overlay */}
                <span className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-xl shadow">
                  {activeSlide.rating}
                </span>

                {/* Bottom Verified Badge */}
                <span className="absolute bottom-3 left-3 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-xl backdrop-blur flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% RTO Verified Fleet</span>
                </span>
              </div>

              {/* Vehicle Title & Station */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    {activeSlide.carName}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Stationed in {activeSlide.city}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Instant Book</span>
                  <span className="text-xs font-extrabold text-emerald-400">Zero Deposit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Slide Progress Bar Indicators */}
        <div className="relative z-20 px-6 pb-4 flex items-center justify-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlideIndex === idx ? 'w-10 bg-emerald-400' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FLEXIBLE CUSTOMER-DRIVEN SEARCH & DISCOVERY DOCK       */}
      {/* ========================================================= */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Search & Filter Fleet Catalog
            </h2>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* User-Driven Flexible Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Customer City Input (Open text entry) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Pickup City / Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Type city (e.g. Pune, Mumbai, Sangli...)"
                className="w-full pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {cityInput && (
                <button
                  type="button"
                  onClick={() => setCityInput('')}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Model / Keyword Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Car Model or Brand
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Thar, Innova, Nexon, SUV..."
                className="w-full pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Vehicle Body Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Body Type
            </label>
            <div className="relative">
              <Car className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">All Body Types</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Seating Capacity
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-3 text-amber-400" />
              <select
                value={selectedSeating}
                onChange={(e) => setSelectedSeating(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Any Capacity</option>
                {SEATING_CAPACITIES.map((cap) => (
                  <option key={cap} value={cap}>{cap} Passengers</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CATEGORY PILLS & CATALOG HEADER (ID: fleet-catalog)   */}
      {/* ========================================================= */}
      <section id="fleet-catalog" className="space-y-4">
        {/* Category Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 border cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls & Sort Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Available Vehicles ({filteredVehicles.length})</span>
            </span>

            {cityInput && (
              <span className="text-xs text-slate-400 font-semibold">
                in <strong className="text-emerald-400">"{cityInput}"</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Fuel Type Filter */}
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Fuel Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric (EV)</option>
              <option value="CNG">CNG</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="recommended">Featured / Best Match</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="capacity">Seating Capacity</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. E-COMMERCE VEHICLE PRODUCT CATALOG LISTING             */}
      {/* ========================================================= */}
      <section>
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Loading Verified Fleet...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-slate-900 border border-rose-500/30 rounded-3xl text-center text-xs text-rose-300 shadow-xl">
            {error}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800/80 p-8 space-y-4 shadow-xl">
            <div className="p-4 bg-slate-800/60 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-500">
              <Car className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-extrabold text-slate-200">No Vehicles Match Your Search</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              We couldn't find any available cars matching your current filters {cityInput ? `in "${cityInput}"` : ''}. Try broadening your search query or exploring our popular destinations below.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear All Search Filters</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ========================================================= */
          /* GRID VIEW (E-Commerce Product Cards)                      */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Vehicle Media Image Container */}
                  <div className="h-52 bg-gradient-to-b from-slate-950 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden border-b border-slate-800/60">
                    {v.imageUrl ? (
                      <img
                        src={v.imageUrl}
                        alt={v.model || v.name}
                        className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Car className="w-20 h-20 text-slate-700 opacity-50" />
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-700 text-slate-200 text-[10px] font-extrabold uppercase rounded-xl tracking-wider">
                        {v.vehicleType || 'SUV'}
                      </span>
                      {v.fuelType?.toLowerCase() === 'electric' && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-xl">
                          🌱 EV Eco
                        </span>
                      )}
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4.9 (120+)</span>
                      </span>
                    </div>

                    {/* Instant Booking Status Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase border backdrop-blur bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Instant Booking</span>
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Body Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors">
                          {v.brand ? `${v.brand} ${v.model}` : v.name}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          {v.year || 2024}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Stationed in <strong className="text-slate-200">{v.city || 'Pune'}</strong></span>
                      </p>
                    </div>

                    {/* Specifications Row */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-[11px] text-slate-300 text-center">
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center">
                        <Users className="w-3.5 h-3.5 text-indigo-400 mb-0.5" />
                        <span className="font-semibold">{v.seatingCapacity || 5} Seats</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center">
                        <Fuel className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                        <span className="font-semibold truncate">{v.fuelType || 'Diesel'}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center">
                        <Wind className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                        <span className="font-semibold">{v.ac ? 'Climate AC' : 'Standard'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Pricing & Booking Actions */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Standard Tariff
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-emerald-400">
                          ₹{v.pricePerKm || v.ratePerKm || 15}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/ KM</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Estimated Day Rate
                      </span>
                      <span className="text-xs font-extrabold text-slate-200">
                        ₹{(v.pricePerKm || 15) * 120} <span className="text-[10px] text-slate-400 font-normal">/ Day</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openInspectModal(v)}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Specs & Pics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBookVehicleClick(v)}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================= */
          /* LIST VIEW (Compact E-Commerce Layout)                     */
          /* ========================================================= */
          <div className="space-y-4">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
                  <div className="w-full sm:w-44 h-32 bg-slate-950 rounded-2xl border border-slate-800 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.model} className="h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <Car className="w-12 h-12 text-slate-700" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase rounded-lg">
                        {v.vehicleType || 'SUV'}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-100">
                        {v.brand ? `${v.brand} ${v.model}` : v.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">({v.year || 2024})</span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Available in {v.city || 'Pune'}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        {v.seatingCapacity || 5} Seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        {v.fuelType || 'Diesel'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        4.9 (120+ reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Tariff Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-emerald-400">₹{v.pricePerKm || 15}</span>
                      <span className="text-xs text-slate-400">/ KM</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openInspectModal(v)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      View Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookVehicleClick(v)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 cursor-pointer flex items-center gap-1.5"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>Book Car</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 5. HOW IT WORKS (3 SIMPLE STEPS)                          */}
      {/* ========================================================= */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8 shadow-xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Simple & Transparent Rental Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            How DriveIndia Rentals Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From vehicle discovery to doorstep car delivery in 3 effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-3 relative group hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-extrabold text-slate-100">Browse & Select Fleet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore approved SUVs, Sedans, EVs, and 7-seaters with transparent per-KM tariff rates across Maharashtra & Goa.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-3 relative group hover:border-indigo-500/40 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-extrabold text-slate-100">Quick Sign In & Reserve</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in or create a quick account with OTP verification to lock your dates, specify pickup point, and request a booking.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-3 relative group hover:border-purple-500/40 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-extrabold text-slate-100">Instant Dispatch & Trip Start</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive verified commercial driver details and secure trip-start OTP. Enjoy 24/7 roadside assistance on the go!
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. POPULAR GETAWAY ROAD TRIPS (ID: routes)               */}
      {/* ========================================================= */}
      <section id="routes" className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Top Destinations</span>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-0.5">
              Popular Road Trips from Pune & Mumbai 🛣️
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div className="h-40 relative overflow-hidden bg-slate-950">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase rounded-lg">
                  {dest.tag}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{dest.name}</h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{dest.distance}</span>
                  <span>~{dest.duration}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate">Best: {dest.recommended}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCityInput('Pune');
                      scrollToFleet();
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Rent</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. WHY CHOOSE US / TRUST SECTION (ID: why-us)             */}
      {/* ========================================================= */}
      <section id="why-us" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enterprise Trust & Safety</span>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Why Choose DriveIndia?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200">100% Verified Fleet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every vehicle undergoes strict RTO fitness, insurance, and commercial permit validation.
            </p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
              <BadgePercent className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200">Zero Hidden Charges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent per-KM rates and driver allowances. No surprise fees at trip conclusion.
            </p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200">24/7 Roadside Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Round-the-clock emergency support, live breakdown dispatch, and instant replacement guarantee.
            </p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-200">Commercial Licensed Drivers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experienced, polite drivers with verified police clearances and background verifications.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CUSTOMER TESTIMONIALS & REVIEWS                        */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Real Customer Experiences</span>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Loved by 10,000+ Travelers ⭐</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">"{t.comment}"</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-100">{t.name}</h4>
                  <span className="text-[10px] text-slate-400">Trip from {t.city}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {t.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. DETAILED VEHICLE SPECIFICATION MODAL                   */}
      {/* ========================================================= */}
      {inspectVehicle && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified & Approved for Reservation</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-100">
                  {inspectVehicle.brand} {inspectVehicle.model} ({inspectVehicle.year || 2024})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stationed at {inspectVehicle.location || inspectVehicle.city || 'Pune'} • Owned by {inspectVehicle.ownerName || 'Apex Auto Rentals'}</span>
                </p>
              </div>

              <button
                onClick={() => setInspectVehicle(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicle Gallery Carousel */}
            <div className="space-y-3">
              {(() => {
                const images = getVehicleImageList(inspectVehicle);
                const currentImg = images[activeImageIndex] || images[0];

                return (
                  <div className="space-y-2">
                    <div className="h-64 sm:h-72 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-4 relative">
                      {currentImg ? (
                        <img
                          src={currentImg.url}
                          alt={currentImg.label}
                          className="h-full w-full object-contain transition-all duration-300"
                        />
                      ) : (
                        <Car className="w-20 h-20 text-slate-700 opacity-60" />
                      )}
                      <span className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
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

            {/* Specifications Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
                <p className="font-extrabold text-slate-200">{inspectVehicle.vehicleType || 'SUV'}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Seating</span>
                <p className="font-extrabold text-indigo-400">{inspectVehicle.seatingCapacity || 5} Passengers</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Fuel & AC</span>
                <p className="font-extrabold text-emerald-400">{inspectVehicle.fuelType || 'Diesel'} • AC</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tariff</span>
                <p className="font-extrabold text-emerald-400 font-mono">₹{inspectVehicle.pricePerKm || 15} / KM</p>
              </div>
            </div>

            {/* Features & Amenities Checklist */}
            {Array.isArray(inspectVehicle.features) && inspectVehicle.features.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Equipped Features & Amenities
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {inspectVehicle.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {inspectVehicle.description && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Vehicle Overview</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {inspectVehicle.description}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setInspectVehicle(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = inspectVehicle;
                  setInspectVehicle(null);
                  handleBookVehicleClick(target);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Reserve This Car Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. IN-CONTEXT BOOKING AUTH MODAL                         */}
      {/* ========================================================= */}
      <BookingAuthModal
        isOpen={authModalOpen}
        targetVehicle={targetBookingVehicle}
        onClose={() => {
          setAuthModalOpen(false);
          setTargetBookingVehicle(null);
        }}
        onSuccess={(authData) => {
          navigate('/customer/bookings/create', {
            state: { selectedVehicle: targetBookingVehicle },
          });
        }}
      />
    </div>
  );
};

export default VehicleDiscovery;
