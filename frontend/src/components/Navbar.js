import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import CreatePropertyModal from './CreatePropertyModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/Logo.png" alt="ديــاري" className="h-10 w-10" />
              <span className="text-2xl font-bold text-diyari-primary font-arabic">ديــاري</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-6 space-x-reverse">
              {/* Home */}
              <Link 
                to="/" 
                className={`p-2 rounded-lg transition-colors ${isActive('/') ? 'text-diyari-primary bg-blue-50' : 'hover:text-diyari-primary hover:bg-gray-50'}`}
                title="الرئيسية"
              >
                <svg className="w-6 h-6" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>

              {/* Reels */}
              <Link 
                to="/reels" 
                className={`p-2 rounded-lg transition-colors ${isActive('/reels') ? 'text-diyari-primary bg-blue-50' : 'hover:text-diyari-primary hover:bg-gray-50'}`}
                title="الريلز"
              >
                <svg className="w-6 h-6" fill={isActive('/reels') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Link>

              {/* Search */}
              <Link 
                to="/search" 
                className={`p-2 rounded-lg transition-colors ${isActive('/search') ? 'text-diyari-primary bg-blue-50' : 'hover:text-diyari-primary hover:bg-gray-50'}`}
                title="البحث"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Property Requests */}
              <Link 
                to="/property-requests" 
                className={`p-2 rounded-lg transition-colors ${isActive('/property-requests') ? 'text-diyari-primary bg-blue-50' : 'hover:text-diyari-primary hover:bg-gray-50'}`}
                title="طلبات العقارات"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Link>

              {/* Messages */}
              <Link 
                to="/messages" 
                className={`p-2 rounded-lg transition-colors ${isActive('/messages') ? 'text-diyari-primary bg-blue-50' : 'hover:text-diyari-primary hover:bg-gray-50'}`}
                title="الرسائل"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>

              {/* Notifications */}
              <Link 
                to="/notifications" 
                className={`p-2 rounded-lg transition-colors relative ${isActive('/notifications') ? 'text-diyari-primary bg-blue-50' : 'hover:text-diyari-primary hover:bg-gray-50'}`}
                title="الإشعارات"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Create Property */}
              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-2 rounded-lg hover:text-diyari-primary hover:bg-gray-50 transition-colors"
                title="إضافة عقار"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Profile */}
              <Link 
                to={`/profile/${user?.username}`} 
                className="hover:opacity-80 transition-opacity"
                title="الملف الشخصي"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-diyari-primary to-diyari-secondary flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Settings & Logout */}
              <div className="relative group">
                <button className="p-2 rounded-lg hover:text-diyari-primary hover:bg-gray-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg">
                    الإعدادات
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Create Property Modal */}
      {showCreateModal && (
        <CreatePropertyModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </>
  );
};

export default Navbar;
