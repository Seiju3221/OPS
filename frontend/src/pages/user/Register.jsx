import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation, useSendOtpMutation, useVerifyOtpMutation } from '../../redux/features/auth/authApi';
import { Loader2, ArrowLeft, UserCircle, Mail, Lock, BookOpen } from 'lucide-react';
import PasswordStrengthBar from './PasswordStrengthBar';
import { RegisterSkeleton } from '../../utils/LoadingSkeleton';
import InputField from '../../utils/InputField';
import { toast } from 'react-toastify';

const Register = () => {
  // Page Loading
  const [isLoading, setIsLoading] = useState(true);

  // form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redux hooks
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])\S{8,}$/;

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return false;
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Send OTP to email
      const result = await sendOtp({ email: formData.email }).unwrap();
      if (result.error) {
        throw new Error(result.error);
      }
      setStep(2);
    } catch (err) {
      // Handle API errors
      if (err.data?.message) {
        // Check if the error is related to username or email
        if (err.data.message.includes('Username')) {
          setErrors({
            username: err.data.message
          });
        } else if (err.data.message.includes('email')) {
          setErrors({
            email: err.data.message
          });
        } else {
          setErrors({
            general: err.data.message
          });
        }
      } else {
        setErrors({
          general: 'Failed to send verification code. Please try again.'
        });
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!validateOtp()) {
      return;
    }

    try {
      // Verify OTP
      await verifyOtp({ email: formData.email, otp }).unwrap();

      // If OTP is valid, proceed with registration
      const result = await registerUser(formData).unwrap();
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Account Created!')
      navigate('/login');
    } catch (err) {
      // Handle registration errors
      if (err.data?.message) {
        if (err.data.message.includes('Username')) {
          setStep(1); // Go back to first step if username is taken
          setErrors({
            username: err.data.message
          });
        } else if (err.data.message.includes('email')) {
          setStep(1); // Go back to first step if email is taken
          setErrors({
            email: err.data.message
          });
        } else {
          setErrors({
            otp: err.data.message
          });
        }
      } else {
        setErrors({
          otp: 'Invalid verification code. Please try again.'
        });
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp({ email: formData.email }).unwrap();
      setErrors({ general: 'A new verification code has been sent to your email.' });
    } catch (err) {
      setErrors({
        general: err.data?.message || 'Failed to resend verification code. Please try again.'
      });
    }
  };

  if (isLoading) {
    return <RegisterSkeleton />;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding and Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
        <div className="relative w-full flex flex-col items-center justify-center p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute transform rotate-45 -left-1/4 -top-1/4 w-96 h-96 border-8 border-white rounded-full" />
            <div className="absolute transform rotate-45 -right-1/4 -bottom-1/4 w-96 h-96 border-8 border-white rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-8 text-center">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <span className="font-bold text-6xl text-white tracking-tight">
                Pub<span className="text-yellow-400">Shark</span>
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-6">University Publication System</h2>
            
            {/* Features List */}
            <div className="space-y-6 max-w-md mx-auto">
              <div className="flex items-center space-x-4">
                <BookOpen className="w-8 h-8 text-blue-300" />
                <div className="text-left">
                  <h3 className="font-semibold">Campus News Coverage</h3>
                  <p className="text-blue-200">Stay updated with the latest UNP happenings</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Mail className="w-8 h-8 text-blue-300" />
                <div className="text-left">
                  <h3 className="font-semibold">Direct Notifications</h3>
                  <p className="text-blue-200">Get instant updates on new articles</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <UserCircle className="w-8 h-8 text-blue-300" />
                <div className="text-left">
                  <h3 className="font-semibold">Student Contributors</h3>
                  <p className="text-blue-200">Platform for aspiring campus journalists</p>
                </div>
              </div>
            </div>

            {/* University Name */}
            <div className="mt-12 pt-8 border-t border-blue-700">
              <h3 className="text-xl font-semibold">University of Northern Philippines</h3>
              <p className="text-blue-200">Official Digital Publication Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button for OTP Step */}
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to registration
            </button>
          )}

          {/* Form Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <img 
                  src="/pubshark_logo.png" 
                  alt='App Logo' 
                  className='h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105' 
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 ? 'Join PubShark' : 'Verify Email'}
            </h2>
            <p className="text-gray-600">
              {step === 1 
                ? 'Be part of UNP\'s digital publication community'
                : `We've sent a verification code to ${formData.email}`}
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Forms remain the same, just updated classes for consistency */}
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleInitialSubmit}>
            <div className="space-y-6">
              <InputField
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                icon={UserCircle}
                error={errors.username}
              />
              <InputField
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                icon={Mail}
                error={errors.email}
              />
              <InputField
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                icon={Lock}
                showPasswordToggle
                onPasswordToggle={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
                error={errors.password}
              />
              <PasswordStrengthBar password={formData.password} />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSendingOtp}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-200"
              >
              {isSendingOtp ? (
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              ) : (
                'Continue'
              )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-8" onSubmit={handleVerifyOtp}>
            <div className="space-y-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                required
                className={`appearance-none rounded-lg relative block w-full px-3 py-4 border text-center tracking-widest ${
                  errors.otp ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-2xl`}
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
              )}
                <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex space-x-2">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        Can't find the verification email?
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Please check your spam/junk folder. If you still haven't received it, click "Resend" below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isVerifying || isRegistering}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-200"
              >
              {isVerifying || isRegistering ? (
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              ) : (
                'Verify and Create Account'
              )}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSendingOtp}
                className="w-full text-center text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors duration-200"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )}

            <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;