import React from 'react';

const LoginSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl">
        {/* Avatar and Header */}
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        {/* Submit Button */}
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />

        {/* Sign Up Link */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const RegisterSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 lg:p-12 rounded-xl shadow-lg">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            {/* Password Strength Bar */}
            <div className="h-2 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />

        {/* Sign In Link */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Export both components
export { LoginSkeleton, RegisterSkeleton };