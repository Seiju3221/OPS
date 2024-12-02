import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const Modal = ({ 
  title = "Access Denied",
  message, 
  onClose,
  showAlert = false,
  alertMessage = "Your session has expired. Please log in again.",
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Trap focus within modal when open
  useEffect(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstFocusable?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-in fade-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 
                id="modal-title"
                className="text-xl font-semibold text-gray-800 tracking-tight"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100/80 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {showAlert && (
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-orange-50 border border-orange-100 text-orange-800">
                <div className="flex-shrink-0 pt-0.5">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-800">Authentication Required</h3>
                  <p className="mt-1 text-sm text-orange-700">{alertMessage}</p>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium shadow-sm"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;