import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  return (
    <dialog open={isOpen}>
      <button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={onClose}>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.707 3.307a1 1 0 00-1.414 0L0 6.014l4.293 4.293a1 1 0 001.414-1.414L2.307 7.707l2.393-2.393a1 1 0 000-1.414z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M11.314 5.307a1 1 0 00-1.414 0L7 8.614l4.293 4.293a1 1 0 001.414-1.414L9.607 10.014l2.393-2.393a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="p-4 bg-white max-w-md rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-4">You need to be logged in</h2>
        <p className="text-base mb-6">Please log in to access this content.</p>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;