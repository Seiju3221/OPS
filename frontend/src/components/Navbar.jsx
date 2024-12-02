import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Bell, 
  Home, 
  Info, 
  PhoneCall, 
  Layout, 
  LogOut, 
  LogIn, 
  PenSquare,
  Menu,
  User,
  X,
  Newspaper
} from 'lucide-react';
import avatarImg from "../assets/commenter.png";
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast/Toast';
import NotificationsDropdown from './NotificationsDropdown';

const navLists = [
  { name: "Home", path: "/", icon: Home },
  { name: "Articles", path: "/articles", icon: Newspaper },
  { name: "About Us", path: "/about-us", icon: Info },
  { name: "Contact Us", path: "/contact-us", icon: PhoneCall }
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutUserMutation();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('success');

  const isAdmin = user?.role === "admin";
  const isWriter = user?.role === "writer";

  console.log(user);

  // Close menu on location change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      setToastMessage('Logged out successfully');
      setToastType('success');
      setShowToast(true);
      navigate('/login');
    } catch (error) {
      setToastMessage(error?.message || 'Failed to log out');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <>
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-gradient-to-r from-blue-800 to-sky-600 shadow-lg backdrop-blur-lg' 
            : 'bg-gradient-to-r from-blue-700 to-sky-600'
        }`}
      >
        <nav className='container mx-auto flex items-center justify-between h-20 px-4 lg:px-8'>
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex-shrink-0 group flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/unp_logo.png" 
                  alt='UNP Logo' 
                  className='h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105' 
                />
                <img 
                  src="/pubshark_logo.png" 
                  alt='App Logo' 
                  className='h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105' 
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-2xl text-white tracking-tight">
                  Pub<span className="text-yellow-400">Shark</span>
                </span>
                <span className="text-xs text-blue-100">University of Northern Philippines</span>
              </div>
            </Link>
          </div>

          {/* Center Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-center flex-1 ml-8">
            <div className="flex items-center space-x-1">
              {navLists.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                        isActive 
                          ? 'bg-white/20 text-white shadow-lg shadow-blue-900/20 scale-105' 
                          : 'text-blue-100 hover:bg-white/10 hover:text-white hover:scale-105'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Right side menu */}
          <div className="flex items-center gap-4">
            {/* Search Section */}
            <div ref={searchRef} className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 group"
              >
                {isSearchOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Search className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-blue-100 p-3 transform opacity-0 animate-slideIn">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            {user && <NotificationsDropdown />}

            {/* User Avatar */}
            {user && (
              <div className="flex items-center">
                <Link 
                  to='/profile'
                  className="transform transition-all duration-300 hover:scale-110"
                >
                  <img 
                    src={user.avatar || avatarImg} 
                    alt="User avatar" 
                    className='w-10 h-10 rounded-full object-cover border-2 border-white/30 hover:border-white shadow-lg'
                  />
                </Link>
              </div>
            )}
            
            {/* Menu Button and Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 group'
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Enhanced Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-blue-100 transform opacity-0 animate-slideIn">
                  <div className="p-4">
                    {user && (
                      <div className="border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar || avatarImg} 
                            alt="User avatar" 
                            className='w-12 h-12 rounded-full object-cover border-2 border-blue-100'
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                      <ul className="space-y-1 mb-4 border-b border-gray-100 pb-4">
                        {navLists.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <li key={index}>
                              <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                      ? 'bg-blue-50 text-blue-600' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`
                                }
                              >
                                <Icon className="w-4 h-4" />
                                {item.name}
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      {user ? (
                        <>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          >
                            <User className="w-4 h-4 text-gray-500" />
                            Manage Profile
                          </Link>
                          {isAdmin && (
                            <Link 
                              to="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            >
                              <Layout className="w-4 h-4 text-gray-500" />
                              Dashboard
                            </Link>
                          )}
                          {isWriter && (
                            <>
                              <Link 
                                to="/write-post"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                              >
                                <PenSquare className="w-4 h-4 text-gray-500" />
                                Write Post
                              </Link>
                              <Link 
                                to="/writer-dashboard"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                              >
                                <Layout className="w-4 h-4 text-gray-500" />
                                Writer Dashboard
                              </Link>
                            </>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                        >
                          <LogIn className="w-4 h-4 text-gray-500" />
                          Log In
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Spacer div to prevent content overlap */}
      <div className="h-20" />

      {/* Add these keyframes to your global CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;