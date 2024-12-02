import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useSendOtpPasswordResetMutation, useVerifyOtpPasswordResetMutation, usePasswordResetMutation } from '../../redux/features/auth/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // email, verification, reset
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [sendOtp] = useSendOtpPasswordResetMutation();
  const [verifyOtp] = useVerifyOtpPasswordResetMutation();
  const [resetPassword] = usePasswordResetMutation();

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await sendOtp({ email }).unwrap();
      setSuccess('Verification code sent to your email');
      setStep('verification');
    } catch (err) {
      setError(err.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOtp({ 
        email, 
        otp: verificationCode 
      }).unwrap();
      setSuccess('Code verified successfully');
      setStep('reset');
    } catch (err) {
      setError(err.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await resetPassword({ 
        email, 
        newPassword 
      }).unwrap();
      setSuccess('Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSubmitEmail} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="mt-1 relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending Code...
          </span>
        ) : (
          'Send Reset Code'
        )}
      </button>
    </form>
  );

  const renderVerificationStep = () => (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center text-2xl"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter the 6-digit code sent to {email}
        </p>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verify Code'
        )}
      </button>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="mt-1 relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1 relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Password must contain:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>At least 8 characters</li>
          <li>Upper and lowercase letters</li>
          <li>Numbers</li>
          <li>Special characters (!@#$%^&*)</li>
        </ul>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Resetting Password...
          </span>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );

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
            {/* Icon and Title */}
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <KeyRound className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold">Password Recovery</h1>
              <p className="text-blue-200 text-center max-w-md mx-auto">
                Secure password reset process for PubShark - UNP's Online Publication System
              </p>
            </div>

            {/* Steps Explanation */}
            <div className="space-y-6 max-w-md mx-auto text-left">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Verification</h3>
                  <p className="text-blue-200 text-sm">Verify your email address to start the reset process</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Security Code</h3>
                  <p className="text-blue-200 text-sm">Enter the verification code sent to your email</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">New Password</h3>
                  <p className="text-blue-200 text-sm">Create a strong new password for your account</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-12 pt-8 border-t border-blue-700/50">
              <p className="text-sm text-blue-200">
                For your security, we use a multi-step verification process.
                Please complete all steps to reset your password.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="flex-1 flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                  step === 'email' ? 'border-blue-600 bg-blue-600 text-white' : 
                  step === 'verification' || step === 'reset' ? 'border-green-500 bg-green-500 text-white' : 
                  'border-gray-300 bg-white text-gray-500'
                }`}>
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 h-0.5 mx-2">
                  <div className={`h-full transition-all duration-500 ${
                    step === 'verification' || step === 'reset' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                  step === 'verification' ? 'border-blue-600 bg-blue-600 text-white' :
                  step === 'reset' ? 'border-green-500 bg-green-500 text-white' :
                  'border-gray-300 bg-white text-gray-500'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 h-0.5 mx-2">
                  <div className={`h-full transition-all duration-500 ${step === 'reset' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                step === 'reset' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'
              }`}>
                <Lock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 'email' && 'Reset your password'}
              {step === 'verification' && 'Verify your email'}
              {step === 'reset' && 'Create new password'}
            </h2>
            <p className="text-gray-600">
              {step === 'email' && 'Enter your email to receive a reset code'}
              {step === 'verification' && 'Enter the 6-digit code sent to your email'}
              {step === 'reset' && 'Choose a strong password for your account'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Forms */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {step === 'email' && renderEmailStep()}
            {step === 'verification' && (
              <>
                {renderVerificationStep()}
                {/* Added spam notice */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex space-x-2">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        Can't find the reset code?
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Please check your spam/junk folder. The email should arrive within a few minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {step === 'reset' && renderResetStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step !== 'email' && (
              <button
                onClick={() => setStep(step === 'reset' ? 'verification' : 'email')}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;