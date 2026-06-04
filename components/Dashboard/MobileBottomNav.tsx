'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Film, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Home, route: '/dashboard' },
    { name: 'Explore', icon: Search, route: '/dashboard/movie' },
    { name: 'Reels', icon: Film, route: '/dashboard/reels' },
    { name: 'Saved', icon: Heart, route: '/dashboard/favorites' },
    { name: 'Profile', icon: User, route: '/dashboard/profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0E14]/80 backdrop-blur-2xl border-t border-white/5 px-4 pb-6 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.route === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname?.startsWith(item.route);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.route} className="relative flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-red-500/10 text-red-500' : 'text-gray-500 group-hover:text-white'
              }`}>
                <Icon size={20} className={isActive ? 'fill-red-500/20' : ''} />
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-0 right-0 h-0.5 bg-red-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                isActive ? 'text-red-500' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
