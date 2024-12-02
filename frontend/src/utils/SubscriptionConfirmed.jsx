import React from 'react';
import { Link } from 'react-router-dom';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const SubscriptionConfirmed = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all animate-fadeIn">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-scaleIn">
        <CheckIcon />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">You're In!</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Welcome to the PubShark community! Get ready for amazing content delivered straight to your inbox.
      </p>
      <Link 
        to="/"
        className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-full font-medium transform transition hover:-translate-y-0.5 active:translate-y-0"
      >
        Back to Home
      </Link>
    </div>
  </div>
);

export default SubscriptionConfirmed;