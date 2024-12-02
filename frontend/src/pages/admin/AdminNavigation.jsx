import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLogoutUserMutation } from '../../redux/features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/features/auth/authSlice';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  Settings,
  X,
  UserCog
} from 'lucide-react';
import Toast from '../../components/Toast/Toast';
import avatarImg from "../../assets/commenter.png";

const AdminNavigation = ({ onClose }) => {
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('success');

  const navItems = [
    { 
      path: "/dashboard", 
      label: "Overview", 
      icon: <LayoutDashboard className="h-5 w-5" />,
      end: true 
    },
    { 
      path: "/dashboard/manage-items", 
      label: "Manage Posts", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      path: "/dashboard/users", 
      label: "Users", 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      path: "/dashboard/settings", 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];

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

      <div className="flex h-full flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <UserCog />
              <div>
                <h2 className="font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-500">Manage your platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:hidden"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="relative">
                <img 
                  src={user?.avatar || avatarImg}
                  alt="Admin avatar" 
                  className="h-10 w-10 rounded-full object-cover border border-gray-200"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-900">{user?.username || 'Admin User'}</h3>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminNavigation;