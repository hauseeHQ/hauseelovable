import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, HelpCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = userProfile?.firstName
    ? `${userProfile.firstName}${userProfile.lastName ? ' ' + userProfile.lastName : ''}`
    : user?.email?.split('@')[0] || 'Guest';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleMenuClick = async (action: string) => {
    setShowDropdown(false);
    if (action === 'settings') {
      onOpenSettings();
    } else if (action === 'signout') {
      await signOut();
      navigate('/plan');
    } else if (action === 'signin') {
      navigate('/signin', { state: { returnTo: window.location.pathname } });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {}}
          className="hover:opacity-80 transition-opacity"
          aria-label="Go to dashboard"
        >
          <img
            src="/hausee-logo.png"
            alt="Hausee Navigator"
            className="w-10 h-10 object-contain"
          />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Hausee Navigator</h1>
          <p className="text-sm text-gray-500">
            {user ? `Welcome back, ${displayName}` : 'Welcome, Guest'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg transition-colors p-1"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-400" />
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {user ? (
                <>
                  <button
                    onClick={() => handleMenuClick('settings')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('help')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => handleMenuClick('signout')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleMenuClick('signin')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('help')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
