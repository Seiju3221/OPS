import React, { useState, useEffect } from 'react';
import { useLoginUserMutation } from '../../redux/features/auth/authApi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/auth/authSlice';
import { Loader2, Mail, Lock, BookOpen, Users, Bell, Globe } from 'lucide-react';
import Toast from '../../components/Toast/Toast';
import { LoginSkeleton } from '../../utils/LoadingSkeleton';
import InputField from '../../utils/InputField';
import { toast } from 'react-toastify';

const INITIAL_FORM_STATE = {
  email: '',
  password: ''
};

const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const PASSWORD_MIN_LENGTH = 8;

const Login = () => {
  // Move all hooks to the top level - they should never be inside conditions
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(
    parseInt(localStorage.getItem('loginAttempts') || '0')
  );
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Redux hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsPageLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  // useEffect hooks
  useEffect(() => {
    checkLockStatus();
  }, []);

  useEffect(() => {
    const timer = handleLockoutTimer();
    return () => clearInterval(timer);
  }, [isLocked, lockoutEndTime]);

  const checkLockStatus = () => {
    const locked = localStorage.getItem('accountLocked');
    const lockoutEnd = localStorage.getItem('lockoutEndTime');

    if (locked && lockoutEnd) {
      const now = new Date().getTime();
      if (now < parseInt(lockoutEnd)) {
        setIsLocked(true);
        setLockoutEndTime(parseInt(lockoutEnd));
      } else {
        resetLockout();
      }
    }
  };

  const handleLockoutTimer = () => {
    if (!isLocked || !lockoutEndTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      if (now >= lockoutEndTime) {
        resetLockout();
      }
    }, 1000);

    return timer;
  };

  const resetLockout = () => {
    setIsLocked(false);
    setLockoutEndTime(null);
    setLoginAttempts(0);
    localStorage.removeItem('accountLocked');
    localStorage.removeItem('lockoutEndTime');
    localStorage.removeItem('loginAttempts');
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLockout = () => {
    const lockoutEnd = new Date().getTime() + LOCKOUT_DURATION;
    setIsLocked(true);
    setLockoutEndTime(lockoutEnd);
    localStorage.setItem('accountLocked', 'true');
    localStorage.setItem('lockoutEndTime', lockoutEnd.toString());
    showToastMessage('Account temporarily locked due to too many failed attempts', 'error');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      showToastMessage('Account is locked. Please try again later.', 'error');
      return;
    }

    if (!validateForm()) {
      showToastMessage('Please fix the errors in the form', 'error');
      return;
    }

    try {
      const result = await loginUser(formData).unwrap();
      console.log('Login response:', result);
      
      // Check if the response contains both token and user
      if (!result.token || !result.user) {
        console.error('Missing token or user in response:', result);
        throw new Error('Invalid response from server');
      }

      // Reset lockout state
      resetLockout();
      
      // Dispatch user data to Redux store
      dispatch(setUser({ user: result.user }));
      
      // Show success message
      showToastMessage('Login successful! Redirecting...', 'success');

      toast.success('Login successful! Redirecting...');
      
      // Use a shorter timeout for better UX
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 3000);
      
    } catch (err) {
      console.error('Login error:', err);
      
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        handleLockout();
      } else {
        showToastMessage(
          err.data?.message || 'Invalid email or password. Please try again.',
          'error'
        );
      }
    }
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutEndTime) return '';
    const remaining = Math.max(0, lockoutEndTime - new Date().getTime());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isPageLoading) {
    return <LoginSkeleton />;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - PubShark Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-800 to-blue-900 flex-col items-center justify-center px-12">
        <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] mix-blend-overlay opacity-10 bg-cover bg-center" />
        
        {/* Main Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <span className="font-bold text-6xl text-white tracking-tight">
              Pub<span className="text-yellow-400">Shark</span>
            </span>
            <div className="h-1 w-24 bg-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-blue-100">
              University of Northern Philippines
            </h2>
            <p className="text-xl text-blue-200 mt-4 mb-8">
              Your Gateway to Campus Stories and Academic Excellence
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            {/* Feature highlights */}
            {[
              { 
                icon: BookOpen, 
                title: 'Campus News', 
                desc: 'Stay updated with the latest UNP happenings' 
              },
              { 
                icon: Users, 
                title: 'Student Voices', 
                desc: 'Platform for student journalists and writers' 
              },
              { 
                icon: Bell, 
                title: 'Real-time Updates', 
                desc: 'Instant notifications on breaking campus news' 
              },
              { 
                icon: Globe, 
                title: 'Digital Archive', 
                desc: 'Access to UNP publication history' 
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left transform hover:scale-105 transition-transform duration-200">
                <feature.icon className="h-8 w-8 text-yellow-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {showToast && (
            <Toast
              message={toastMessage}
              type={toastType}
              onClose={() => setShowToast(false)}
            />
          )}

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <img 
                  src="/pubshark_logo.png" 
                  alt='App Logo' 
                  className='h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105' 
                />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to PubShark</h2>
            <p className="mt-2 text-gray-600">Sign in to access UNP's publication platform</p>
          </div>

          {isLocked && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">
                Account temporarily locked. Please try again in {getRemainingLockoutTime()}
              </p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <InputField
                name="email"
                type="email"
                placeholder="University Email"
                value={formData.email}
                onChange={handleInputChange}
                icon={Mail}
                error={errors.email}
                className="bg-white"
              />
              <InputField
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                icon={Lock}
                showPasswordToggle
                onPasswordToggle={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
                error={errors.password}
                className="bg-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoginLoading || isLocked}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoginLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Request access
              </Link>
            </p>
          </form>

          <div className="text-center text-xs text-gray-500 mt-8">
            <p>University of Northern Philippines</p>
            <p>Official Publication System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;