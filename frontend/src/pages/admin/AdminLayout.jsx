import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminNavigation from './AdminNavigation'
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Close mobile nav when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close mobile nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('#mobile-nav') && !event.target.closest('#menu-button')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <div className="lg:hidden top-0 z-0 flex items-center justify-between px-4 py-4 border-b bg-white">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <button
          id="menu-button"
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav"
        className={`lg:hidden fixed top-0 left-0 w-64 h-full bg-white transform transition-transform duration-200 ease-in-out z-50 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${!open ? 'hidden' : ''}`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          <AdminNavigation />
        </div>
      </div>

      <div className="container mx-auto flex">
        {/* Desktop Navigation */}
        <aside className="hidden lg:block sticky top-4 h-[calc(100vh-2rem)] w-64 flex-shrink-0">
          <div className="h-full overflow-y-auto rounded-lg border bg-white shadow-sm">
            <AdminNavigation />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="h-full overflow-y-auto p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;