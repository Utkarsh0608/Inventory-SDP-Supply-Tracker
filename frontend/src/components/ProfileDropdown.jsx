import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        type="button"
      >
        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
          {user?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{user?.name || 'Unknown User'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.role || 'SDP'}</p>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            type="button"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
