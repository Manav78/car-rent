import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Car, 
  Lock, 
  Mail, 
  User, 
  Phone,
  ArrowRight, 
  ArrowLeft,
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  Info,
  Sparkles,
  Shield,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { authApi } from '../../api/authApi';
import { IS_STANDALONE_MODE } from '../../api/axiosClient';
import { saveAuth } from '../../utils/authStorage';
import { DEFAULT_ROLE_REDIRECTS, ROLES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { theme } = useTheme();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');
  // Signup Step: 'form' | 'otp'
  const [step, setStep] = useState('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES.CUSTOMER);
  
  // Owner driving question & details state
  const [wantsToDrive, setWantsToDrive] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Form Validation & Interaction
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Forgot / Reset Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [receivedToken, setReceivedToken] = useState(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);

  const otpInputRefs = useRef([]);
  const emailInputRef = useRef(null);

  const handleOpenForgotPassword = () => {
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      showToast('Please enter your registered email address in the Email field above first.', 'warning');
      setTouched((prev) => ({ ...prev, email: true }));
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter your registered email address first.' }));
      emailInputRef.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showToast('Please enter a valid email address in the Email field above.', 'warning');
      setTouched((prev) => ({ ...prev, email: true }));
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address (e.g. name@example.com).' }));
      emailInputRef.current?.focus();
      return;
    }

    setForgotEmail(trimmedEmail.toLowerCase());
    setForgotError(null);
    setForgotStep('email');
    setShowForgotModal(true);
  };

  // Automatically detect URL parameters for token, email, or reset/forgot routes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token') || params.get('resetToken') || params.get('otp') || params.get('code');
    const emailParam = params.get('email') || params.get('username');
    const actionParam = params.get('action') || params.get('mode');
    const isResetPath = location.pathname.includes('reset-password');
    const isForgotPath = location.pathname.includes('forgot-password');

    if (emailParam) {
      setForgotEmail(emailParam);
      setEmail(emailParam);
    }

    if (tokenParam) {
      setForgotOtp(tokenParam);
      setReceivedToken(tokenParam);
      setForgotStep('reset');
      setShowForgotModal(true);
    } else if (isResetPath && emailParam) {
      setForgotStep('reset');
      setShowForgotModal(true);
    } else if ((isForgotPath || actionParam === 'forgot' || actionParam === 'reset') && emailParam) {
      setForgotStep(actionParam === 'reset' ? 'reset' : 'email');
      setShowForgotModal(true);
    } else if (isForgotPath || isResetPath) {
      // Direct navigation without query params: keep user on form and prompt to enter email
      showToast('Please enter your registered email address in the email field to reset your password.', 'info');
    }
  }, [location.search, location.pathname]);

  // Timer countdown for OTP resend
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

  // Focus first OTP input on step change to OTP
  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Validate single field
  const validateField = (fieldName, val, currentValues = {}) => {
    let error = null;
    const trimmedVal = typeof val === 'string' ? val.trim() : val;

    switch (fieldName) {
      case 'name':
        if (mode === 'signup') {
          if (!trimmedVal) {
            error = 'Full name is required.';
          } else if (trimmedVal.length < 2) {
            error = 'Name must be at least 2 characters.';
          } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedVal)) {
            error = 'Name can only contain letters and spaces.';
          }
        }
        break;

      case 'email':
        if (!trimmedVal) {
          error = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedVal)) {
          error = 'Please enter a valid email address (e.g. name@example.com).';
        }
        break;

      case 'phone':
        if (mode === 'signup') {
          if (!trimmedVal) {
            error = 'Mobile number is required for OTP verification.';
          } else if (!/^[6-9]\d{9}$/.test(trimmedVal.replace(/\D/g, ''))) {
            error = 'Please enter a valid 10-digit Indian mobile number (starts with 6-9).';
          }
        }
        break;

      case 'password':
        if (!val) {
          error = 'Password is required.';
        } else if (val.length < 6) {
          error = 'Password must be at least 6 characters.';
        }
        break;

      case 'confirmPassword':
        if (mode === 'signup') {
          const pass = currentValues.password !== undefined ? currentValues.password : password;
          if (!val) {
            error = 'Please confirm your password.';
          } else if (val !== pass) {
            error = 'Passwords do not match.';
          }
        }
        break;

      case 'licenseNumber':
        if (mode === 'signup' && (selectedRole === ROLES.DRIVER || (selectedRole === ROLES.OWNER && wantsToDrive))) {
          if (!trimmedVal) {
            error = 'Driving license number is required.';
          } else if (trimmedVal.length < 6) {
            error = 'Please enter a valid license number (e.g. MH-12-20230098234).';
          }
        }
        break;

      case 'licenseExpiry':
        if (mode === 'signup' && (selectedRole === ROLES.DRIVER || (selectedRole === ROLES.OWNER && wantsToDrive))) {
          if (trimmedVal) {
            const expiryDate = new Date(trimmedVal);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiryDate < today) {
              error = 'License expiry date cannot be in the past.';
            }
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, getFieldValue(field));
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFieldValue(field, value);
    if (touched[field]) {
      const error = validateField(field, value, {
        password: field === 'password' ? value : password,
        confirmPassword: field === 'confirmPassword' ? value : confirmPassword,
      });
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const getFieldValue = (field) => {
    switch (field) {
      case 'name': return name;
      case 'email': return email;
      case 'phone': return phone;
      case 'password': return password;
      case 'confirmPassword': return confirmPassword;
      case 'licenseNumber': return licenseNumber;
      case 'licenseExpiry': return licenseExpiry;
      default: return '';
    }
  };

  const setFieldValue = (field, value) => {
    switch (field) {
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'licenseNumber': setLicenseNumber(value); break;
      case 'licenseExpiry': setLicenseExpiry(value); break;
      default: break;
    }
  };

  // Validate entire form before submission
  const validateForm = () => {
    const errors = {};
    const currentValues = { name, email, phone, password, confirmPassword, licenseNumber, licenseExpiry };

    const fieldsToValidate = mode === 'signup'
      ? ['name', 'email', 'phone', 'password', 'confirmPassword']
      : ['email', 'password'];

    if (mode === 'signup' && (selectedRole === ROLES.DRIVER || (selectedRole === ROLES.OWNER && wantsToDrive))) {
      fieldsToValidate.push('licenseNumber', 'licenseExpiry');
    }

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, currentValues[field], currentValues);
      if (err) errors[field] = err;
    });

    setFieldErrors(errors);
    const allTouched = {};
    fieldsToValidate.forEach((f) => { allTouched[f] = true; });
    setTouched(allTouched);

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  // Helper to extract clear error message from Spring Boot backend or client
  const extractErrorMsg = (err) => {
    if (!err) return 'An error occurred. Please try again.';
    if (typeof err === 'string') return err;
    if (err.validationErrors) {
      return Object.values(err.validationErrors).join(', ');
    }
    if (err.response?.data?.validationErrors) {
      return Object.values(err.response.data.validationErrors).join(', ');
    }
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
    if (err.data?.message) return err.data.message;
    if (err.message) return err.message;
    if (err.error) return err.error;
    return 'Operation failed. Please check your details.';
  };

  // 1-Click Demo Login with live backend seed credentials
  const handleQuickLogin = async (roleEmail) => {
    const account = DEFAULT_ACCOUNTS[roleEmail] || {};
    const pwd = account.password || (roleEmail.includes('admin') ? 'Admin@123' : 'Password@123');
    setEmail(roleEmail);
    setPassword(pwd);
    setGeneralError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const data = await authApi.login({ email: roleEmail, password: pwd });
      saveAuth(data);

      const targetRole = (data.roles && data.roles[0]) || 'ROLE_CUSTOMER';
      const redirectPath = location.state?.from?.pathname || DEFAULT_ROLE_REDIRECTS[targetRole] || '/customer';

      showToast(`Signed in successfully as ${data.user?.name || 'User'}!`, 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.warn('Quick login error:', err);
      if (IS_STANDALONE_MODE) {
        // Only in offline standalone mode, fallback to seed mock profile
        const fallbackAccount = DEFAULT_ACCOUNTS[roleEmail] || { name: 'User', roles: ['ROLE_CUSTOMER'] };
        const fallbackData = {
          accessToken: `demo_token_${Date.now()}`,
          user: { id: Date.now(), name: fallbackAccount.name, email: roleEmail },
          roles: fallbackAccount.roles,
        };
        saveAuth(fallbackData);
        showToast(`Signed in with profile as ${fallbackAccount.name}!`, 'success');
        const targetRole = fallbackAccount.roles[0] || 'ROLE_CUSTOMER';
        navigate(DEFAULT_ROLE_REDIRECTS[targetRole] || '/customer', { replace: true });
      } else {
        // On live backend, display the actual backend error truthfully
        const errorMsg = extractErrorMsg(err);
        setGeneralError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Switch between Login and Signup modes
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setStep('form');
    setGeneralError(null);
    setFieldErrors({});
    setTouched({});
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
  };

  // Handle Form Submit (Login or initiate Signup OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const { isValid, errors } = validateForm();
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      setGeneralError(firstError || 'Please correct the highlighted errors before proceeding.');
      showToast(firstError || 'Please fill all required fields correctly.', 'warning');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const registrationData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          confirmPassword,
          role: selectedRole,
          wantsToDrive: selectedRole === ROLES.OWNER ? wantsToDrive : false,
          licenseNumber: (selectedRole === ROLES.OWNER && wantsToDrive) || selectedRole === ROLES.DRIVER ? licenseNumber.trim() : null,
          licenseExpiry: (selectedRole === ROLES.OWNER && wantsToDrive) || selectedRole === ROLES.DRIVER ? licenseExpiry : null,
        };

        const signupRes = await authApi.register(registrationData);

        // If backend directly provided tokens (e.g. standalone/auto-verified)
        if (signupRes && signupRes.accessToken && signupRes.user) {
          saveAuth(signupRes);
          showToast(`Welcome, ${signupRes.user?.name || name}!`, 'success');
          const userRoles = signupRes.roles || ['ROLE_CUSTOMER'];
          navigate(DEFAULT_ROLE_REDIRECTS[userRoles[0]] || '/customer', { replace: true });
          return;
        }

        // Advance to OTP step
        const otpCode = '123456';
        setDemoOtp(otpCode);
        setStep('otp');
        setResendTimer(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError(null);
        showToast(`Verification code sent to ${email}!`, 'info');
      } else {
        // Sign In Flow
        const data = await authApi.login({ email: email.trim(), password });
        saveAuth(data);

        showToast(`Signed in successfully as ${data.user?.name || 'User'}!`, 'success');
        const userRoles = data.roles || (data.user?.roles) || ['ROLE_CUSTOMER'];
        const targetRole = userRoles[0];
        const redirectPath = location.state?.from?.pathname || DEFAULT_ROLE_REDIRECTS[targetRole] || '/customer';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const msg = extractErrorMsg(err);
      setGeneralError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    setOtpError(null);
    const cleaned = value.replace(/\D/g, '');

    // If pasted multi-character OTP
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

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpError(null);
    setLoading(true);

    try {
      const otpCode = '123456';
      setDemoOtp(otpCode);
      await authApi.sendOtp({
        email: email.trim(),
        phone: phone.trim(),
        purpose: 'REGISTRATION',
      });
      setResendTimer(30);
      setCanResend(false);
      showToast(`New verification code sent!`, 'info');
    } catch (err) {
      showToast(extractErrorMsg(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Auto Fill Demo OTP
  const handleAutoFillDemoOtp = () => {
    const digits = demoOtp.split('');
    setOtpDigits(digits);
    setOtpError(null);
    if (otpInputRefs.current[5]) {
      otpInputRefs.current[5].focus();
    }
  };

  // Verify OTP and complete registration
  const handleVerifyOtp = async (e) => {
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
      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: selectedRole,
        wantsToDrive: selectedRole === ROLES.OWNER ? wantsToDrive : false,
        licenseNumber: (selectedRole === ROLES.OWNER && wantsToDrive) || selectedRole === ROLES.DRIVER ? licenseNumber.trim() : null,
        licenseExpiry: (selectedRole === ROLES.OWNER && wantsToDrive) || selectedRole === ROLES.DRIVER ? licenseExpiry : null,
        expectedOtp: demoOtp,
      };

      const data = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: enteredOtp,
        password,
        registrationData,
      });

      if (data?.requiresLogin) {
        showToast('🎉 Email verified successfully! Please sign in to continue.', 'success');
        setMode('login');
        setStep('form');
        setPassword('');
        return;
      }

      const { accessToken, refreshToken, user, roles } = data || {};
      if (accessToken) {
        saveAuth({ accessToken, refreshToken, user, roles });
        showToast(`🎉 Account verified & created successfully! Welcome, ${user?.name || name}!`, 'success');

        const userRoles = roles || (user?.roles) || [selectedRole];
        const targetRole = userRoles[0];
        const redirectPath = location.state?.from?.pathname || DEFAULT_ROLE_REDIRECTS[targetRole] || '/customer';

        navigate(redirectPath, { replace: true });
      } else {
        showToast('🎉 Account verified! Please sign in to continue.', 'success');
        setMode('login');
        setStep('form');
      }
    } catch (err) {
      console.error('OTP Verification error:', err);
      const msg = extractErrorMsg(err);
      setOtpError(msg);
      showToast(msg, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Forgot Password: Step 1 Send OTP / Token
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim().toLowerCase());
      const extractedToken = res?.token || res?.resetToken || res?.otp || res?.code || (typeof res?.data === 'string' && res.data);
      if (extractedToken) {
        setReceivedToken(extractedToken);
        setForgotOtp(extractedToken);
        showToast('Password reset token generated by server!', 'info');
      } else {
        setReceivedToken(null);
        showToast('Password reset code sent to your email (or check server console)!', 'info');
      }
      setForgotStep('reset');
    } catch (err) {
      setForgotError(extractErrorMsg(err));
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Step 2 Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('Please fill all required fields: Token/OTP and New Password.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      await authApi.resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp: forgotOtp.trim(),
        token: forgotOtp.trim(),
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword,
      });
      showToast('🎉 Password reset successfully! Please sign in with your new password.', 'success');
      setEmail(forgotEmail.trim().toLowerCase());
      setPassword('');
      setShowForgotModal(false);
      setForgotStep('email');
      setForgotEmail('');
      setForgotOtp('');
      setReceivedToken(null);
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      if (location.pathname.includes('reset-password') || location.pathname.includes('forgot-password') || location.search.includes('token')) {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setForgotError(extractErrorMsg(err));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 my-6">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 dark:bg-amber-500 text-amber-400 dark:text-slate-950 mb-3 shadow-sm">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">DriveEase Mobility</h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'otp' ? 'Security & Identity Verification' : 'Multi-Role Indian Car Rental Platform'}
          </p>
        </div>

        {/* Tab Switcher (Only visible in Form step) */}
        {step === 'form' && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                mode === 'login' 
                  ? 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                mode === 'signup' 
                  ? 'bg-slate-950 text-amber-400 dark:bg-amber-500 dark:text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* General Error Alert */}
        {generalError && step === 'form' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: LOGIN / SIGNUP FORM                               */}
        {/* ========================================================= */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Rahul Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                      touched.name && fieldErrors.name
                        ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {touched.name && fieldErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                    touched.email && fieldErrors.email
                      ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {touched.email && fieldErrors.email && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (For OTP Verification) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 flex items-center gap-1 text-xs text-slate-400 font-semibold border-r border-slate-800 pr-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="98220 11223"
                    className={`w-full pl-18 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                      touched.phone && fieldErrors.phone
                        ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {touched.phone && fieldErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                    touched.password && fieldErrors.password
                      ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
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
              {touched.password && fieldErrors.password && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}

              {mode === 'login' && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                      touched.confirmPassword && fieldErrors.confirmPassword
                        ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Register Account As
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole(ROLES.CUSTOMER);
                        setWantsToDrive(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedRole === ROLES.CUSTOMER
                          ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-extrabold text-xs block text-slate-100 mb-0.5">👤 Customer</span>
                      <span className="text-[10px] text-slate-400 block">Rent and drive vehicles directly</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole(ROLES.OWNER)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedRole === ROLES.OWNER
                          ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-extrabold text-xs block text-slate-100 mb-0.5">🚗 Vehicle Owner</span>
                      <span className="text-[10px] text-slate-400 block">List fleet and assign drivers</span>
                    </button>
                  </div>
                </div>

                {/* Owner Driving Option */}
                {selectedRole === ROLES.OWNER && (
                  <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wantsToDrive}
                        onChange={(e) => setWantsToDrive(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        I also want to drive vehicles myself (Dual Role: Owner + Driver)
                      </span>
                    </label>
                    <p className="text-[10px] text-slate-400 pl-6 leading-relaxed">
                      Enable self-driving mode to accept customer rides directly without hiring external drivers.
                    </p>
                  </div>
                )}

                {/* Driver License Fields if Driver or Owner who wants to drive */}
                {(selectedRole === ROLES.DRIVER || (selectedRole === ROLES.OWNER && wantsToDrive)) && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>Commercial Driver Verification Details</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Driving License Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => handleChange('licenseNumber', e.target.value)}
                        onBlur={() => handleBlur('licenseNumber')}
                        placeholder="e.g. MH-12-20230098234"
                        className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                          touched.licenseNumber && fieldErrors.licenseNumber
                            ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
                            : 'border-slate-800 focus:border-indigo-500'
                        }`}
                      />
                      {touched.licenseNumber && fieldErrors.licenseNumber && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.licenseNumber}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        License Expiry Date
                      </label>
                      <input
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => handleChange('licenseExpiry', e.target.value)}
                        onBlur={() => handleBlur('licenseExpiry')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      {touched.licenseExpiry && fieldErrors.licenseExpiry && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.licenseExpiry}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-slate-950 hover:bg-black text-amber-400 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-xs font-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Verify with OTP & Sign Up' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'signup' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 transition-colors hover:underline cursor-pointer"
                >
                  Already registered? <span className="text-indigo-400 font-bold">Forgot Password?</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: OTP VERIFICATION SCREEN                           */}
        {/* ========================================================= */}
        {step === 'otp' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header info with locked registration email */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 text-center">
              <div className="inline-flex p-2.5 rounded-full bg-indigo-600/20 text-indigo-400 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Verify Email Address</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A 6-digit verification code has been dispatched to your registered email address:
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-indigo-300 font-bold shadow-inner">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{email}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-sans font-bold">Registered</span>
              </div>
              {phone && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Phone: +91 {phone}
                </div>
              )}
            </div>

            {/* OTP Error display */}
            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                6-Digit Security Code
              </label>
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-11 h-12 text-center text-lg font-black bg-slate-950 border rounded-xl text-slate-100 focus:outline-none transition-all ${
                      digit
                        ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                        : otpError
                        ? 'border-rose-500/60'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Test Helper / Demo OTP Fill Badge */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Demo OTP: <strong>{demoOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleAutoFillDemoOtp}
                className="px-2.5 py-1 text-[11px] font-bold text-indigo-400 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>

            {/* Resend and Countdown Timer */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">
                {resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  "Didn't receive the code?"
                )}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40 disabled:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isVerifyingOtp ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify OTP &amp; Complete Registration</span>
                </>
              )}
            </button>

            {/* Locked Email Notice (No Edit Option) */}
            <div className="pt-2 text-center text-[11px] text-slate-500">
              Registration email <span className="font-mono text-slate-400 font-semibold">{email}</span> is permanently bound to this signup request.
            </div>
          </div>
        )}

        {/* 1-Click Instant Demo Login (Only in Form step) */}
        {step === 'form' && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Seed Account Logins</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@carrental.com')}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 hover:border-slate-700 text-left font-bold truncate flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>👤 Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('owner@carrental.com')}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 hover:border-slate-700 text-left font-bold truncate flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>🚗 Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('driver@carrental.com')}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 hover:border-slate-700 text-left font-bold truncate flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>🧭 Driver</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@carrental.com')}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 hover:border-slate-700 text-left font-bold truncate flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>🛡️ Super Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    {forgotStep === 'email' ? 'Forgot Password' : 'Reset Password'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {forgotStep === 'email' ? 'Send reset code to your registered email' : 'Enter the code and choose a new password'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'email' ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Registered Email (From Form Input)
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl">
                    <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-xs truncate">
                      <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{forgotEmail}</span>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full font-sans font-bold shrink-0">
                      Form Input
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Send Reset Code</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
                {/* Locked Email Indicator */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-xs truncate">
                    <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{forgotEmail}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                    Target Account
                  </span>
                </div>

                {/* Detected Token from Server Response */}
                {receivedToken && (
                  <div className="p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Server Reset Token
                      </span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(receivedToken)}
                        className="text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600/50 px-2 py-0.5 rounded-lg border border-indigo-500/40 transition-colors cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-indigo-100 break-all select-all bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      {receivedToken}
                    </div>
                  </div>
                )}

                {/* Console Guidance Box */}
                {!receivedToken && (
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      If your backend logs the reset token / OTP on the server console instead of sending email, paste the token directly into the field below.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Reset Code or Token from Console / Email</label>
                  <input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Paste token from server console or code from email"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">New Password (Min 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Set New Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
