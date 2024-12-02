import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, BookOpen } from 'lucide-react';
import { useClearNotificationsMutation, useGetNotificationsQuery, useMarkNotificationReadMutation } from '../redux/features/articles/articlesApi';
import { useNavigate } from 'react-router-dom';

const NotificationCard = ({ notification, onRead }) => {
  const navigate = useNavigate();

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval > 1) {
        return `${interval} ${unit}s ago`;
      }
      if (interval === 1) {
        return `${interval} ${unit} ago`;
      }
    }
    return 'just now';
  };

  const handleClick = () => {
    onRead(notification.id);
    // Add navigation logic here
    navigate(`/articles/${notification.article.id}`);
  };

  return (
    <div 
      className={`p-3 bg-white hover:bg-blue-50 cursor-pointer transition-colors rounded-lg border border-gray-100 ${
        !notification.read ? 'bg-blue-50/40' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 relative flex-shrink-0">
          <img 
            src={notification.article.coverImg} 
            alt={notification.article.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-500">New Article</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {notification.article.title}
          </h4>
          <p className="text-xs text-gray-600 mb-1">
            By {notification.article.author.username}
          </p>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {notification.article.college}
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">{timeSince(notification.time)}</span>
        <span className="text-xs text-blue-600 hover:underline">Read Article →</span>
      </div>
    </div>
  );
};

const NotificationsDropdown = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000 // Poll every 30 seconds for new notifications
  });
  
  const [markAsRead] = useMarkNotificationReadMutation();
  const [clearAll] = useClearNotificationsMutation();

  const handleNotificationRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      setIsNotificationsOpen(false);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 relative group"
      >
        {isNotificationsOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Bell className="w-5 h-5 text-white" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isNotificationsOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-blue-100 transform opacity-0 animate-slideIn">
          <div className="p-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-700" />
                <h3 className="text-md font-semibold text-gray-800">Notifications</h3>
              </div>
              {notifications.length > 0 && (
                <button 
                  className="text-sm text-blue-600 hover:underline"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              )}
            </div>
            {isLoading ? (
              <p className="text-center text-gray-500 py-4">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No notifications</p>
            ) : (
              <div className="overflow-y-auto max-h-[400px] pr-2">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification}
                      onRead={handleNotificationRead}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;