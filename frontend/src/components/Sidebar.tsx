import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const menuItems = [
    { name: 'Home', icon: '🏠', path: '/' },
    { name: 'Manual Tasks', icon: '📝', path: '/dashboard' },
    { name: 'AI Assistant', icon: '🤖', path: '/ai-assistant' },
    { name: 'Profile', icon: '👤', path: '/profile' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const handleItemClick = (path: string) => {
    if (path === '/sign-out') {
      handleSignOut();
    } else {
      router.push(path);
    }
    onClose();
  };

  const sidebarClass = `fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-lg border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } lg:translate-x-0`;

  // Determine user display name and email
  const displayName = user?.first_name || user?.last_name
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user?.email || 'User';
  const displayEmail = user?.email || 'Email not available';

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClass}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              TaskMaster
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleItemClick(item.path)}
                    className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-white/10 rounded-xl transition-all duration-200 hover:text-white group"
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}

              {/* Sign Out */}
              <li>
                <button
                  onClick={() => handleItemClick('/sign-out')}
                  className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:text-red-300 group"
                >
                  <span className="mr-3 text-lg">🚪</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {((user?.first_name || user?.last_name)
                  ? (user.first_name?.charAt(0) || user.last_name?.charAt(0))
                  : user?.email?.charAt(0)
                )?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white font-medium">{displayName}</p>
                <p className="text-gray-400 text-sm">{displayEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}