import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

const App = () => {
  const { isAuthenticated, isLoading, authError, user } = useAuth();
  const location = useLocation();

  // Show loading state during authentication initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-green-700 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Redirect Check:', {
    isAuthenticated, 
    isLoading, 
    authError, 
    currentPath: location.pathname
  });

  // Handle authentication errors
  if (authError) {
    return (
      <>
        {toast.error('You have to be logged in to access this page!')}
        <Navigate to="/login" state={{ from: location.pathname }} replace />;
      </>
    )
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  console.log('Redirect Check:', {
    isAuthenticated, 
    isLoading, 
    authError, 
    currentPath: location.pathname
  });

  // Redirect logic based on authentication and route
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('Redirect Check:', {
    isAuthenticated, 
    isLoading, 
    authError, 
    currentPath: location.pathname
  });

  if (isAuthenticated && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-white to-blue-50">
      <ToastContainer />
      {isAuthenticated && (
        <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
          <Navbar />
        </header>
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md border border-yellow-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <Outlet />
        </div>
      </main>
      
      {isAuthenticated && (
        <Footer className="bg-yellow-100 text-blue-800 p-4" />
      )}
    </div>
);
};

export default App;
