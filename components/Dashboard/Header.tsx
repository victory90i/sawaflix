'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, User, Settings, ChevronDown, ArrowLeft, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client'; 
import { User as SupabaseUser } from '@supabase/supabase-js'; 
import { handleSignOut } from '../../app/(auth)/actions'; 
import SawaflixLogo from '../SawaflixLogo';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import NotificationPanel from './NotificationPanel';

type UserProfileData = {
  username: string | null;
  email: string | null;
  profile_image_url: string | null;
};

const Header = ({ sidebarOpen, toggleSidebar, hideSearch }: { sidebarOpen: boolean; toggleSidebar: () => void; hideSearch?: boolean }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications logic
  const adminNotificationContext = useAdminNotifications();
  const userNotificationContext = useNotifications();
  
  const { notifications, unreadCount, markRead, markAllRead, handleNotificationClick } = hideSearch 
    ? { ...adminNotificationContext, handleNotificationClick: () => {} } 
    : userNotificationContext;


  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setCurrentUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('users')
          .select('username, email, profile_image_url')
          .eq('id', user.id)
          .single<UserProfileData>();

        if (error) {
          console.error('Error fetching user profile:', error.message);
        } else if (profileData) {
          setUserProfile(profileData);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to dashboard with search query
      router.push(`/dashboard?q=${encodeURIComponent(searchValue.trim())}`);
      setShowMobileSearchBar(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0B0E14]/40 backdrop-blur-md border-b border-white/5 shadow-2xl">
      <div className="flex items-center justify-between h-full pl-4 pr-4 sm:pr-6 lg:pr-8">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 mr-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center space-x-3 group">
            <div className="hidden sm:block"></div>
            <Link href="/dashboard" className="flex items-center gap-3">
              <SawaflixLogo />
            </Link>
          </div>
        </div>

        {!hideSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => {
                  document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 bg-black border border-white/40 rounded-sm
                           text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 
                           focus:ring-white focus:border-white transition-all duration-300
                           hover:border-white/60"
              />
            </form>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {!hideSearch && (
            <button
              onClick={() => setShowMobileSearchBar(!showMobileSearchBar)}
              className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Toggle search bar"
            >
              <Search size={18} />
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group"
              aria-label="Notifications"
            >
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-red-600/20 animate-in zoom-in duration-300">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel 
                title={hideSearch ? "Admin Alerts" : "Notifications"}
                subtitle={hideSearch ? `${unreadCount} pending actions` : `${unreadCount} new updates`}
                notifications={notifications.slice(0, 15).map(n => ({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  message: n.message,
                  read: n.read,
                  timestamp: (n as any).createdAt || (n as any).timestamp,
                  thumbnail: (n as any).thumbnail,
                  contentId: (n as any).contentId,
                  category: (n as any).category
                }))}
                unreadCount={unreadCount}
                onMarkAllRead={markAllRead}
                onClose={() => setShowNotifications(false)}
                onItemClick={(id) => {
                  const notification = notifications.find(n => n.id === id);
                  if (notification) {
                    handleNotificationClick(notification as any);
                  }
                  setShowNotifications(false);
                }}
                accentColor={hideSearch ? "red" : "white"}
                viewAllHref={hideSearch ? undefined : "/dashboard/notification"}
              />
            )}
          </div>

          <Link href="/dashboard/settings" className="hidden sm:block p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            <Settings size={18} />
          </Link>


          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="User profile menu"
            >
              {userProfile?.profile_image_url ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-sm flex-shrink-0">
                  <Image
                    src={userProfile.profile_image_url}
                    alt="User Avatar"
                    fill
                    className="object-cover aspect-square"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-sm flex-shrink-0">
                  <User size={14} className="text-gray-400" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium">
                {userProfile?.username || currentUser?.email || 'Guest'}
              </span>
              <ChevronDown size={14} className={`hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{userProfile?.username || 'Guest'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email || 'N/A'}</p>
                </div>
                <Link href="/dashboard/edit-profile" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-gray-700 hover:text-white transition-colors">
                  Update Profile
                </Link>
                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  Help & Support
                </a>
                <hr className="my-2 border-gray-700" />
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileSearchBar && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg animate-fade-in-down">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => {
                document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              placeholder="Search titles, people, genres..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-white/60 rounded-sm
                         text-white placeholder-gray-500 focus:outline-none focus:ring-1 
                         focus:ring-white transition-all duration-200"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowMobileSearchBar(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Close search bar"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;