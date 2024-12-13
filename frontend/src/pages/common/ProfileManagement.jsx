import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Key, Upload, Eye, EyeOff, Trash2, ChevronRight } from 'lucide-react';
import avatarImg from "../../assets/commenter.png";
import { useUpdateProfileMutation, useSendOtpMutation, useVerifyOtpMutation, useResendOtpMutation, useGetCurrentUserQuery } from '../../redux/features/auth/authApi';
import Toast from '../../components/Toast/Toast';
import LoadingButton from '../../utils/LoadingButton';

const ProfileManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    user?.profileImg || avatarImg
  );
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isUploading, setIsUploading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isOtpVerifyLoading, setIsOtpVerifyLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [isProfileUpdateLoading, setIsProfileUpdateLoading] = useState(false);

  useEffect(() => {
    setPreviewImage(user?.profileImg || avatarImg);
  }, [user?.profileImg]);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailData, setEmailData] = useState({
    email: user?.email || '',
    otp: '',
  });

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // State for password visibility
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create file preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setSelectedFile(file);
      };
    }
  };

  const compressImage = async (file, maxSizeKB = 500) => {
    const reader = new FileReader();
    const image = await createImageBitmap(file);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Start with original dimensions
    let width = image.width;
    let height = image.height;
    let quality = 0.9;
    
    // Compress while maintaining aspect ratio
    while (true) {
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(image, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Check size in KB
      const sizeKB = compressedBase64.length * 0.75 / 1024;
      
      if (sizeKB <= maxSizeKB) {
        return compressedBase64;
      }
      
      // Reduce dimensions and quality
      width = Math.round(width * 0.9);
      height = Math.round(height * 0.9);
      quality -= 0.1;
      
      if (quality < 0.1) break;
    }
    
    throw new Error('Could not compress image to desired size');
  };
  
  // In your handleImageUpload function
  const handleImageUpload = async () => {
    if (!selectedFile) return;
  
    try {
      setIsUploading(true);
      
      // Compress the image
      const compressedImage = await compressImage(selectedFile);
      
      try {
        const response = await updateProfile({
          avatar: compressedImage
        }).unwrap();
  
        setPreviewImage(response.user.profileImg);
        setSelectedFile(null);
        showToastMessage('Profile image updated successfully');
      } catch (error) {
        showToastMessage(error?.data?.message || 'Failed to upload avatar', 'error');
      } finally {
        setIsUploading(false);
      }
    } catch (compressionError) {
      showToastMessage('Image compression failed', 'error');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await updateProfile({ avatar: null }).unwrap();
      setPreviewImage(avatarImg);
      setSelectedFile(null);
      showToastMessage('Profile image removed successfully');
    } catch (error) {
      showToastMessage(error?.data?.message || 'Failed to remove avatar', 'error');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (profileData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (showPasswordFields) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (profileData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters long';
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailForm = () => {
    const newErrors = {};

    if (!emailData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (emailData.email === user?.email) {
      newErrors.email = 'New email must be different from current email';
    }

    if (isEmailSent && !emailData.otp) {
      newErrors.otp = 'OTP is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleResendOtp = async () => {
    try {
      setIsResendLoading(true);
      await resendOtp({ email: emailData.email }).unwrap();
      showToastMessage('OTP resent successfully');
    } catch (error) {
      showToastMessage(error?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();

    if (!validateEmailForm()) {
      return;
    }

    // Early return if email is unchanged
    if (emailData.email === user?.email) {
      showToastMessage('Please enter a different email address', 'error');
      return;
    }

    try {
      if (!isEmailSent) {
        setIsEmailLoading(true);
        await sendOtp({ email: emailData.email }).unwrap();
        setIsEmailSent(true);
        showToastMessage('OTP sent to your email');
      } else {
        setIsOtpVerifyLoading(true);
        await verifyOtp({
          email: emailData.email,
          otp: emailData.otp,
        }).unwrap();

        try {
          await updateProfile({ email: emailData.email }).unwrap();
          showToastMessage('Email updated successfully');
          setIsEmailSent(false);
          setShowEmailVerification(false);
          setEmailData((prev) => ({ ...prev, otp: '' }));
        } catch (error) {
          if (error?.data?.message?.includes('already exists')) {
            showToastMessage(
              'This email is already registered with another account',
              'error'
            );
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      showToastMessage(error?.data?.message || 'Failed to update email', 'error');
    } finally {
      setIsEmailLoading(false);
      setIsOtpVerifyLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    try {
        setIsProfileUpdateLoading(true);
        const updateData = {
            username: profileData.username,
        };

        if (showPasswordFields) {
            updateData.currentPassword = profileData.currentPassword;
            updateData.newPassword = profileData.newPassword;
        }

        await updateProfile(updateData).unwrap();

        showToastMessage('Profile updated successfully');

        if (showPasswordFields) {
            setProfileData((prev) => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
            setShowPasswordFields(false);
        }
    } catch (error) {
        showToastMessage(error?.data?.message || 'Failed to update profile', 'error');
    } finally {
        setIsProfileUpdateLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <ChevronRight className="w-6 h-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 p-8">
            {/* Left Sidebar - Profile Image */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="relative group mb-6">
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg transition-transform transform group-hover:scale-105"
                />
                
                <div className="absolute bottom-0 right-0 flex space-x-2">
                  <label 
                    htmlFor="avatar-upload" 
                    className="bg-blue-500 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition duration-300 ease-in-out"
                  >
                    <Upload className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>

                  {previewImage !== avatarImg && (
                    <button 
                      onClick={handleRemoveImage} 
                      className="bg-red-500 hover:bg-red-700 text-white rounded-full p-2 transition duration-300 ease-in-out"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="flex flex-col space-y-2 w-full">
                  <button
                    onClick={handleImageUpload}
                    disabled={isUploading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewImage(user?.profileImg || avatarImg);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Right Content - Forms */}
            <div className="md:col-span-2 space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="username">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        value={profileData.username} 
                        onChange={handleInputChange} 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 ${errors.username ? 'border-red-500' : 'border-gray-300'}`} 
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                  </div>
                </div>

                {/* Email Section */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Email Address</h2>
                    <button
                      type="button"
                      onClick={() => setShowEmailVerification(!showEmailVerification)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      {showEmailVerification ? 'Cancel' : 'Change Email'}
                    </button>
                  </div>

                  {!showEmailVerification ? (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{user?.email}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <Mail className="w-4 h-4" />
                          New Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={emailData.email}
                          onChange={handleEmailInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {isEmailSent && (
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <Key className="w-4 h-4" />
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            name="otp"
                            value={emailData.otp}
                            onChange={handleEmailInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.otp ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter the OTP sent to your email"
                          />
                          {errors.otp && (
                            <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
                          )}
                          <LoadingButton
                            type="button"
                            onClick={handleResendOtp}
                            isLoading={isResendLoading}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Resend OTP
                          </LoadingButton>
                        </div>
                      )}
                      <LoadingButton
                        type="submit"
                        isLoading={isEmailLoading || isOtpVerifyLoading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors duration-200"
                      >
                        {isEmailSent ? 'Verify OTP' : 'Send OTP'}
                      </LoadingButton>
                    </form>
                  )}
                </div>

                {/* Password Section */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Password</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordFields(!showPasswordFields);
                        if (!showPasswordFields) {
                          setProfileData(prev => ({
                            ...prev,
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          }));
                          setErrors({});
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      {showPasswordFields ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <Key className="w-4 h-4" />
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.currentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={profileData.currentPassword}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('currentPassword')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.currentPassword ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <Key className="w-4 h-4" />
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.newPassword ? "text" : "password"}
                            name="newPassword"
                            value={profileData.newPassword}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.newPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('newPassword')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.newPassword ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <Key className="w-4 h-4" />
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={profileData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirmPassword ?
                              <EyeOff className="w-4 h-4" /> :
                              <Eye className="w-4 h-4" />
                            }
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <LoadingButton
                  type="submit"
                  isLoading={isProfileUpdateLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors duration-200 text-lg font-semibold"
                >
                  Save Changes
                </LoadingButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;