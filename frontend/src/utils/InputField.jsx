import { Eye, EyeOff } from 'lucide-react';
import React from 'react'

const InputField = ({ 
  name, 
  type, 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  showPasswordToggle,
  onPasswordToggle,
  showPassword,
  error
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {placeholder}
      </label>
      <div className="relative flex items-center">
        <Icon className="absolute left-3 h-5 w-5 text-gray-500 pointer-events-none" />
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={name === 'password' ? 'current-password' : name}
          required
          className={`
            appearance-none rounded-lg block w-full
            pl-10 pr-${showPasswordToggle ? '10' : '3'} py-3
            border ${error ? 'border-red-300' : 'border-gray-300'}
            placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:border-indigo-500 
            text-lg transition-colors duration-200
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute right-3 h-5 w-5 text-gray-400"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InputField;
