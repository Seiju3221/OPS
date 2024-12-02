import React from 'react';

const LoadingButton = ({ 
  isLoading, 
  children, 
  className = "", 
  type = "button",
  onClick,
  disabled = false 
}) => {
  const baseClasses = "relative flex items-center justify-center transition-colors duration-200";
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={combinedClasses}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;