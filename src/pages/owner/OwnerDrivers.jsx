import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  X, 
  Clock, 
  Calendar,
  AlertCircle,
  FileText,
  Award,
  Lock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Key,
  Check,
  Send
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';

const OwnerDrivers = () => {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'OFFLINE' | 'ON_TRIP' | 'PENDING' | 'UNVERIFIED'
  const [ownerProfile, setOwnerProfile] = useState(null);

  // Add Driver Modal State matching DriverCreateRequest.java & VerifyEmailRequest
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState('form'); // 'form' | 'otp'
  const [addLoading, setAddLoading] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Password@123',
    phoneNumber: '',
    drivingLicenseNumber: '',
    licenseExpiryDate: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Active driver being verified
  const [verifyingDriver, setVerifyingDriver] = useState(null);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const otpInputRefs = useRef([]);

  // View Driver Dossier Modal State
  const [selectedDriverDossier, setSelectedDriverDossier] = useState(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (modalStep === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [modalStep, resendTimer]);

  const fetchDriversData = async () => {
    try {
      setLoading(true);
      const [driversRes, profileRes] = await Promise.allSettled([
        ownerApi.getDrivers(),
        ownerApi.getProfile(),
      ]);

      if (driversRes.status === 'fulfilled' && Array.isArray(driversRes.value)) {
        setDrivers(driversRes.value);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setOwnerProfile(profileRes.value);
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
      showToast('Failed to load drivers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriversData();
  }, []);

  const isOwnerApproved = ownerProfile ? (ownerProfile.isApproved !== false && ownerProfile.status !== 'PENDING_APPROVAL') : true;

  const openAddModal = () => {
    if (!isOwnerApproved) {
      showToast('Account verification pending. You can register drivers after Super Admin approval.', 'warning');
      return;
    }
    setNewDriverData({
      firstName: '',
      lastName: '',
      email: '',
      password: 'Password@123',
      phoneNumber: '',
      drivingLicenseNumber: '',
      licenseExpiryDate: '',
    });
    setModalStep('form');
    setVerifyingDriver(null);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setShowAddModal(true);
  };

  // Open direct OTP verification for an existing unverified driver
  const openVerifyDriverModal = (driver) => {
    const dName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || driver.name || 'Driver';
    const dEmail = (driver.email || '').trim();
    const dPhone = driver.phoneNumber || driver.phone || '';

    setVerifyingDriver({
      ...driver,
      name: dName,
      email: dEmail,
      phoneNumber: dPhone,
    });
    setModalStep('otp');
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setResendTimer(30);
    setCanResend(false);
    setDemoOtp('123456');
    setShowAddModal(true);

    // Trigger sending OTP
    ownerApi.resendDriverVerification({ email: dEmail, phone: dPhone })
      .then(() => {
        showToast(`Verification code sent to ${dEmail}`, 'info');
      })
      .catch((err) => {
        console.warn('Resend verification warning:', err.message);
      });
  };

  // Step 1: Submit driver registration form and dispatch verification code
  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();
    if (!newDriverData.firstName.trim() || !newDriverData.lastName.trim() || !newDriverData.drivingLicenseNumber.trim() || !newDriverData.phoneNumber.trim() || !newDriverData.email.trim() || !newDriverData.licenseExpiryDate) {
      showToast('Please fill all mandatory driver fields: First Name, Last Name, Email, Phone, License Number, and Expiry Date.', 'warning');
      return;
    }

    setAddLoading(true);
    try {
      const payload = {
        firstName: newDriverData.firstName.trim(),
        lastName: newDriverData.lastName.trim(),
        name: `${newDriverData.firstName.trim()} ${newDriverData.lastName.trim()}`,
        email: newDriverData.email.trim().toLowerCase(),
        password: newDriverData.password || 'Password@123',
        phoneNumber: newDriverData.phoneNumber.trim(),
        phone: newDriverData.phoneNumber.trim(),
        drivingLicenseNumber: newDriverData.drivingLicenseNumber.trim().toUpperCase(),
        licenseNumber: newDriverData.drivingLicenseNumber.trim().toUpperCase(),
        licenseExpiryDate: newDriverData.licenseExpiryDate,
        licenseExpiry: newDriverData.licenseExpiryDate,
        isEmailVerified: false,
      };

      const added = await ownerApi.addDriver(payload);
      const driverRecord = {
        ...payload,
        id: added?.id || Date.now(),
        ...added,
      };

      setDrivers((prev) => [driverRecord, ...prev]);
      setVerifyingDriver(driverRecord);

      // Dispatch verification code to driver email
      try {
        await ownerApi.resendDriverVerification({
          email: payload.email,
          phone: payload.phoneNumber,
        });
      } catch (otpErr) {
        console.warn('Initial OTP send warning:', otpErr.message);
      }

      showToast(`Driver registered! 6-digit verification code sent to ${payload.email}`, 'info');

      // Transition to OTP verification step
      setModalStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);
      setDemoOtp('123456');

      // Focus first OTP input after render
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.error('Failed to add driver:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to register driver. Please check inputs.';
      showToast(msg, 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // OTP Digits input handler
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');

    // Handle full paste
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace key
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Resend OTP to driver
  const handleResendOtp = async () => {
    if (!canResend || !verifyingDriver?.email) return;
    setOtpError(null);
    setAddLoading(true);

    try {
      const otpCode = '123456';
      setDemoOtp(otpCode);
      await ownerApi.resendDriverVerification({
        email: verifyingDriver.email,
        phone: verifyingDriver.phoneNumber || verifyingDriver.phone,
      });
      setResendTimer(30);
      setCanResend(false);
      showToast(`New verification code sent to ${verifyingDriver.email}!`, 'info');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend code';
      showToast(msg, 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // 1-Click Auto-Fill Demo OTP
  const handleAutoFillDemoOtp = () => {
    const digits = demoOtp.split('');
    setOtpDigits(digits);
    setOtpError(null);
    if (otpInputRefs.current[5]) {
      otpInputRefs.current[5].focus();
    }
  };

  // Step 2: Verify Driver OTP & Activate Driver
  const handleVerifyDriverOtp = async (e) => {
    e?.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP code.');
      showToast('Please enter complete 6-digit OTP code.', 'warning');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      await ownerApi.verifyDriverEmail({
        email: verifyingDriver.email,
        otp: enteredOtp,
        registrationData: {
          email: verifyingDriver.email,
          role: 'ROLE_DRIVER',
          expectedOtp: demoOtp,
        },
      });

      // Update in local state
      setDrivers((prev) =>
        prev.map((d) =>
          d.email?.toLowerCase() === verifyingDriver.email?.toLowerCase() || d.id === verifyingDriver.id
            ? { ...d, isEmailVerified: true, emailVerified: true, status: 'AVAILABLE' }
            : d
        )
      );

      if (selectedDriverDossier && selectedDriverDossier.email?.toLowerCase() === verifyingDriver.email?.toLowerCase()) {
        setSelectedDriverDossier((prev) => ({
          ...prev,
          isEmailVerified: true,
          emailVerified: true,
          status: 'AVAILABLE',
        }));
      }

      showToast(`🎉 Driver "${verifyingDriver.name || verifyingDriver.firstName}" email verified & activated successfully!`, 'success');
      setShowAddModal(false);
      setModalStep('form');
      setVerifyingDriver(null);
      fetchDriversData();
    } catch (err) {
      console.error('Driver email verification error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code. Please try again.';
      setOtpError(msg);
      showToast(msg, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Skip / Verify Later
  const handleSkipVerification = () => {
    setShowAddModal(false);
    setModalStep('form');
    setVerifyingDriver(null);
    showToast('Driver saved! Email verification remains pending. You can verify anytime from the Driver Directory.', 'info');
    fetchDriversData();
  };

  // Search and Filter logic
  const filteredDrivers = drivers.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const name = `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.name || '';
    const phone = d.phoneNumber || d.phone || '';
    const license = d.drivingLicenseNumber || d.licenseNumber || '';
    const email = d.email || '';

    const matchesSearch = !q || (
      name.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      license.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q)
    );

    const currentStatus = (d.status || 'ACTIVE').toUpperCase();
    const currentApproval = (d.approvalStatus || 'APPROVED').toUpperCase();
    const isVerified = d.isEmailVerified !== false && d.emailVerified !== false;

    let matchesStatus = statusFilter === 'ALL';
    if (statusFilter === 'AVAILABLE') {
      matchesStatus = (currentStatus === 'AVAILABLE' || currentStatus === 'ACTIVE') && isVerified;
    } else if (statusFilter === 'OFFLINE') {
      matchesStatus = currentStatus === 'OFFLINE' || currentStatus === 'INACTIVE';
    } else if (statusFilter === 'ON_TRIP') {
      matchesStatus = currentStatus === 'ON_TRIP';
    } else if (statusFilter === 'APPROVED') {
      matchesStatus = currentApproval === 'APPROVED';
    } else if (statusFilter === 'PENDING') {
      matchesStatus = currentApproval === 'PENDING' || currentApproval === 'PENDING_APPROVAL';
    } else if (statusFilter === 'UNVERIFIED') {
      matchesStatus = !isVerified;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-full text-[11px] font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Fleet Driver Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Registered Fleet Drivers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your commercial drivers, verify driving licenses, conduct email OTP activations, and monitor duty statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Driver</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver by name, phone, license..."
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE (On Duty)</option>
            <option value="OFFLINE">OFFLINE (Off Duty)</option>
            <option value="ON_TRIP">ON_TRIP (In Journey)</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING APPROVAL</option>
            <option value="UNVERIFIED">EMAIL UNVERIFIED</option>
          </select>
        </div>
      </div>

      {/* Driver Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading drivers...</div>
      ) : filteredDrivers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Drivers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'No drivers match your search query.' : 'You have not registered any fleet drivers yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => {
            const displayName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || driver.name || 'Fleet Driver';
            const phone = driver.phoneNumber || driver.phone || 'N/A';
            const licenseNo = driver.drivingLicenseNumber || driver.licenseNumber || 'MH-14-RTO';
            const expiry = driver.licenseExpiryDate || driver.licenseExpiry || '2030-12-31';
            const isExpired = expiry && new Date(expiry) < new Date();
            const status = driver.status || 'AVAILABLE';
            const isEmailVerified = driver.isEmailVerified !== false && driver.emailVerified !== false;

            return (
              <div
                key={driver.id || driver.userId || Math.random()}
                className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between ${
                  !isEmailVerified
                    ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-100 truncate">{displayName}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{driver.email || 'Commercial Driver'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isExpired
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : (status === 'AVAILABLE' || status === 'ACTIVE')
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : status === 'ON_TRIP'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isExpired ? 'SUSPENDED' : (status === 'ACTIVE' ? 'AVAILABLE' : status)}
                      </span>

                      {/* Email Verification Status Badge */}
                      {isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Email Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Mobile Phone:</span>
                      <span className="font-mono font-bold text-slate-200">{phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Driving License:</span>
                      <span className="font-mono font-bold text-purple-400">{licenseNo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">License Expiry:</span>
                      <span className={`font-semibold ${isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                        {expiry} {isExpired ? '(Expired)' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Completed Trips:</span>
                      <span className="font-semibold text-slate-200">{driver.totalTrips || 0} Trips</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  {/* If driver email is unverified, show Verify Email Action */}
                  {!isEmailVerified && (
                    <button
                      onClick={() => openVerifyDriverModal(driver)}
                      className="w-full py-2 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Verify Email (Enter OTP)</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedDriverDossier(driver)}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Driver Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTER NEW DRIVER & EMAIL VERIFICATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  {modalStep === 'form' ? <UserPlus className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    {modalStep === 'form' ? 'Register Commercial Driver' : 'Verify Driver Email Address'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {modalStep === 'form' 
                      ? 'Step 1 of 2: Driver Credentials & License Details' 
                      : 'Step 2 of 2: Email Verification (OTP)'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setModalStep('form');
                  setVerifyingDriver(null);
                }} 
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Driver Registration Form */}
            {modalStep === 'form' && (
              <form onSubmit={handleAddDriverSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">First Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={newDriverData.firstName}
                      onChange={(e) => setNewDriverData({ ...newDriverData, firstName: e.target.value })}
                      placeholder="e.g. Rahul"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Last Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={newDriverData.lastName}
                      onChange={(e) => setNewDriverData({ ...newDriverData, lastName: e.target.value })}
                      placeholder="e.g. Sharma"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email Address <span className="text-rose-400">*</span></label>
                    <input
                      type="email"
                      required
                      value={newDriverData.email}
                      onChange={(e) => setNewDriverData({ ...newDriverData, email: e.target.value })}
                      placeholder="driver@example.com"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Mobile Phone <span className="text-rose-400">*</span></label>
                    <input
                      type="tel"
                      required
                      value={newDriverData.phoneNumber}
                      onChange={(e) => setNewDriverData({ ...newDriverData, phoneNumber: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Driving License Number <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={newDriverData.drivingLicenseNumber}
                      onChange={(e) => setNewDriverData({ ...newDriverData, drivingLicenseNumber: e.target.value.toUpperCase() })}
                      placeholder="MH-12-20220011029"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 uppercase font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">License Expiry Date <span className="text-rose-400">*</span></label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={newDriverData.licenseExpiryDate}
                      onChange={(e) => setNewDriverData({ ...newDriverData, licenseExpiryDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Temporary Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newDriverData.password}
                      onChange={(e) => setNewDriverData({ ...newDriverData, password: e.target.value })}
                      className="w-full pl-2.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Driver can change this temporary password after email verification.</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {addLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving & Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Email Verification</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Driver Email Verification (OTP) Form */}
            {modalStep === 'otp' && (
              <div className="space-y-4 text-xs">
                {/* Target Driver Info Pill */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{verifyingDriver?.name || `${verifyingDriver?.firstName || ''} ${verifyingDriver?.lastName || ''}`}</div>
                      <div className="text-[11px] text-blue-400 font-mono">{verifyingDriver?.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Awaiting OTP
                  </span>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 text-slate-300 leading-relaxed">
                  A 6-digit email verification code has been dispatched to <strong className="text-blue-400 font-mono">{verifyingDriver?.email}</strong>. Enter the code below to complete driver verification and activate duty privileges.
                </div>

                {/* 1-Click Auto Fill Demo Code Box */}
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-[11px] text-indigo-300">
                      Demo Mode OTP: <strong className="text-indigo-200 font-mono tracking-widest">{demoOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDemoOtp}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-md"
                  >
                    1-Click Auto-Fill
                  </button>
                </div>

                {/* 6-Digit OTP Inputs */}
                <div>
                  <label className="block font-bold text-slate-300 mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border bg-slate-950 transition-all focus:outline-none ${
                          otpError
                            ? 'border-rose-500 text-rose-400 focus:border-rose-400'
                            : digit
                            ? 'border-blue-500 text-blue-400 bg-blue-950/20 shadow-sm shadow-blue-500/20'
                            : 'border-slate-800 text-slate-100 focus:border-blue-500'
                        }`}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <div className="mt-2 text-center text-xs font-semibold text-rose-400 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                {/* Resend Section */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Didn't receive the email code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={addLoading}
                      className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-slate-500 font-mono">
                      Resend code in {resendTimer}s
                    </span>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSkipVerification}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Verify Later
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyDriverOtp}
                    disabled={isVerifyingOtp || otpDigits.join('').length < 6}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify & Activate Driver</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW DRIVER DOSSIER MODAL */}
      {selectedDriverDossier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    {`${selectedDriverDossier.firstName || ''} ${selectedDriverDossier.lastName || ''}`.trim() || selectedDriverDossier.name}
                  </h3>
                  <p className="text-xs text-slate-400">Driver Profile & Credentials Dossier</p>
                </div>
              </div>
              <button onClick={() => setSelectedDriverDossier(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <span className="font-mono font-bold text-slate-200 truncate block">
                    {selectedDriverDossier.email || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Phone</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedDriverDossier.phoneNumber || selectedDriverDossier.phone || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Driving License</span>
                  <span className="font-mono font-bold text-purple-400">
                    {selectedDriverDossier.drivingLicenseNumber || selectedDriverDossier.licenseNumber || 'MH-14-REG'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">License Expiry</span>
                  <span className={`font-semibold ${
                    (selectedDriverDossier.licenseExpiryDate || selectedDriverDossier.licenseExpiry) &&
                    new Date(selectedDriverDossier.licenseExpiryDate || selectedDriverDossier.licenseExpiry) < new Date()
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-200'
                  }`}>
                    {selectedDriverDossier.licenseExpiryDate || selectedDriverDossier.licenseExpiry || '2030-12-31'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Verification</span>
                  {selectedDriverDossier.isEmailVerified !== false && selectedDriverDossier.emailVerified !== false ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className="font-bold text-emerald-400">{selectedDriverDossier.status || 'AVAILABLE'}</span>
                </div>
              </div>

              {/* Action if email unverified */}
              {selectedDriverDossier.isEmailVerified === false && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
                  <div className="text-amber-300 text-xs">
                    This driver has not completed email OTP verification.
                  </div>
                  <button
                    onClick={() => {
                      const driverCopy = { ...selectedDriverDossier };
                      setSelectedDriverDossier(null);
                      openVerifyDriverModal(driverCopy);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Verify Now</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDriverDossier(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl cursor-pointer transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDrivers;
