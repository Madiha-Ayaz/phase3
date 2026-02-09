import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const currentTime = new Date();
  const hour = currentTime.getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else if (hour >= 17 || hour < 6) {
    greeting = 'Good Evening';
  }

  // Determine user display name and email
  const displayName = user?.first_name || user?.last_name
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user?.email || 'User';
  const displayEmail = user?.email || 'Email not available';

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-2xl z-[100]">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white hover:text-gray-300 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Greeting */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-semibold text-white">
            {greeting}, {displayName}!
          </h2>
          <p className="text-gray-400 text-sm">{displayEmail}</p>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {((user?.first_name || user?.last_name)
                ? (user.first_name?.charAt(0) || user.last_name?.charAt(0))
                : user?.email?.charAt(0)
              )?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:inline text-white">{displayName}</span>
            <svg
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-2xl border border-white/20 py-1 z-[9999]">
              <button
                onClick={() => {
                  router.push('/profile');
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  router.push('/settings');
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Settings
              </button>
              <hr className="border-white/10 my-1" />
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}