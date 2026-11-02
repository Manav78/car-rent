import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Car, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { authApi } from '../../api/authApi';
import { IS_STANDALONE_MODE } from '../../api/axiosClient';
import { saveAuth } from '../../utils/authStorage';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const DEFAULT_ACCOUNTS = {
  'customer@carrental.com': { name: 'Rahul Sharma (Customer)', roles: ['ROLE_CUSTOMER'], password: 'Password@123' },
  'owner@carrental.com': { name: 'Apex Auto Rentals (Owner)', roles: ['ROLE_OWNER'], password: 'Password@123' },
  'driver@carrental.com': { name: 'Vikram Singh (Driver)', roles: ['ROLE_DRIVER'], password: 'Password@123' },
  'admin@carrental.com': { name: 'Super Admin', roles: ['ROLE_ADMIN'], password: 'Admin@123' },
};

const BookingAuthModal = ({ isOpen, onClose, targetVehicle, onSuccess }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState('form'); // 'form' | 'otp'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Status & Errors
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  const otpInputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
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
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleAuthComplete = (authData) => {
    saveAuth(authData);
    showToast(`Signed in successfully as ${authData.user?.name || 'Customer'}!`, 'success');
    if (onSuccess) {
      onSuccess(authData);
    } else {
      navigate('/customer/bookings/create', { 
        state: { selectedVehicle: targetVehicle } 
      });
    }
    onClose();
  };

  const handleQuickLogin = async (roleEmail) => {
    const account = DEFAULT_ACCOUNTS[roleEmail] || {};
    const pwd = account.password || 'Password@123';
    setLoading(true);
    setGeneralError(null);

    try {
      const data = await authApi.login({ email: roleEmail, password: pwd });
      handleAuthComplete(data);
    } catch (err) {
      console.warn('Quick login error:', err);
      if (IS_STANDALONE_MODE) {
        const fallbackAccount = DEFAULT_ACCOUNTS[roleEmail] || { name: 'Demo Customer', roles: ['ROLE_CUSTOMER'] };
        const fallbackData = {
          accessToken: `demo_token_${Date.now()}`,
          user: { id: Date.now(), name: fallbackAccount.name, email: roleEmail, phone: '9822011223' },
          roles: fallbackAccount.roles,
        };
        handleAuthComplete(fallbackData);
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check credentials or register.';
        setGeneralError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!email.trim() || !password) {
      setGeneralError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setGeneralError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!phone.trim()) {
          setGeneralError('Please enter your 10-digit mobile number.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setGeneralError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const registrationData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          confirmPassword,
          role: ROLES.CUSTOMER,
        };

        const signupRes = await authApi.register(registrationData);
        if (signupRes && signupRes.accessToken && signupRes.user) {
          handleAuthComplete(signupRes);
          return;
        }

        setDemoOtp('123456');
        setStep('otp');
        setResendTimer(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        showToast(`Verification code sent to ${email}!`, 'info');
      } else {
        // Sign In
        const data = await authApi.login({ email: email.trim(), password });
        handleAuthComplete(data);
      }
    } catch (err) {
      console.error('Auth Modal Error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.';
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    setOtpError(null);
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasteDigits.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasteDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: ROLES.CUSTOMER,
        expectedOtp: demoOtp,
      };

      const data = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: enteredOtp,
        password,
        registrationData,
      });

      if (data?.accessToken) {
        handleAuthComplete(data);
      } else {
        const loginData = await authApi.login({ email: email.trim().toLowerCase(), password });
        handleAuthComplete(loginData);
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid OTP code.';
      setOtpError(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Vehicle Context Banner */}
        {targetVehicle && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-950/60 to-slate-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {targetVehicle.imageUrl ? (
                  <img src={targetVehicle.imageUrl} alt={targetVehicle.model} className="w-full h-full object-contain" />
                ) : (
                  <Car className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Selected Car
                  </span>
                  <span className="text-[10px] text-slate-400">{targetVehicle.city || 'Pune'}</span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-100 truncate mt-0.5">
                  {targetVehicle.brand ? `${targetVehicle.brand} ${targetVehicle.model}` : targetVehicle.name}
                </h4>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block font-semibold">Tariff</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                ₹{targetVehicle.pricePerKm || targetVehicle.ratePerKm || 15}/KM
              </span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
            {step === 'otp' ? 'Verify Mobile & Email' : 'Account Required to Reserve'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {step === 'otp'
              ? 'Enter the 6-digit verification code sent to your account.'
              : 'Sign in or create a free customer account to confirm your car booking, assign verified drivers, and manage trips.'}
          </p>
        </div>

        {/* Mode Switcher */}
        {step === 'form' && (
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setGeneralError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Reserve
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setGeneralError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Sign Up
            </button>
          </div>
        )}

        {/* General Error Banner */}
        {generalError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: FORM (LOGIN / SIGNUP)                             */}
        {/* ========================================================= */}
        {step === 'form' ? (
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number (For Trip Updates)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98220 11223"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@carrental.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account & Reserve' : 'Sign In & Reserve Car'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ========================================================= */
          /* STEP 2: OTP VERIFICATION                                  */
          /* ========================================================= */
          <div className="space-y-4">
            {/* Locked Registration Email Badge */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Verification Code Dispatched
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{email}</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-sans">Locked</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
              <div className="text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Instant Demo OTP Code</span>
                <span className="text-base font-black font-mono text-emerald-300 tracking-wider">123456</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpDigits(['1', '2', '3', '4', '5', '6']);
                  setOtpError(null);
                }}
                className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/40 transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 text-center text-lg font-black bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-100 focus:outline-none"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifyingOtp ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify & Proceed to Booking</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 1-Click Instant Seed Account Logins */}
        {step === 'form' && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>1-Click Instant Demo Login</span>
              </span>
              <span className="text-emerald-400 font-semibold">Fast Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@carrental.com')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 hover:border-emerald-500/40 text-left font-bold truncate flex items-center gap-2 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                  👤
                </div>
                <div className="truncate">
                  <span className="block text-[11px] font-bold">Demo Customer</span>
                  <span className="block text-[9px] text-slate-400 font-normal">Direct Booking</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner@carrental.com')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 hover:border-blue-500/40 text-left font-bold truncate flex items-center gap-2 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">
                  🚗
                </div>
                <div className="truncate">
                  <span className="block text-[11px] font-bold">Owner Account</span>
                  <span className="block text-[9px] text-slate-400 font-normal">Apex Rentals</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingAuthModal;
