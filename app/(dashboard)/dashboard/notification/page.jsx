'use client';

import React, { useMemo } from 'react';
import { Play, MoreHorizontal, BellOff, ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPage = () => {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, loading, handleNotificationClick } = useNotifications();

  const { recentNotifications, olderNotifications } = useMemo(() => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    return {
      recentNotifications: notifications.filter(n => now - n.createdAt <= dayInMs),
      olderNotifications: notifications.filter(n => now - n.createdAt > dayInMs)
    };
  }, [notifications]);

  const NotificationItem = ({ notification }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative flex items-center px-6 py-5 border-b border-white/[0.03] transition-all group cursor-pointer hover:bg-white/[0.02] ${!notification.read ? 'bg-white/[0.02]' : ''}`}
      onClick={() => handleNotificationClick(notification)}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
      )}

      {/* Thumbnail / Avatar (Left Side) */}
      <div className="flex-shrink-0 mr-5">
        <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-500 shadow-2xl group-hover:scale-105">
          {notification.thumbnail ? (
            <Image
              src={notification.thumbnail}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-white/20 font-black text-4xl italic tracking-tighter">
                {notification.actorName?.charAt(0) || 'S'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
              <Play className="w-5 h-5 fill-black text-black ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Content (Right Side) */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className={`font-black text-base sm:text-lg leading-tight tracking-tight line-clamp-1 ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="flex h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            )}
          </div>
          <p className="text-gray-500 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            {notification.actorName || 'Sawaflix'}
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </p>
          <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 transition-colors ${!notification.read ? 'text-gray-300' : 'text-gray-600'}`}>
            {notification.message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
          className="p-3 hover:bg-red-500/10 rounded-2xl transition-all text-gray-500 hover:text-red-500 border border-transparent hover:border-red-500/20"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
        <div className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/10">
          <MoreHorizontal size={20} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#0B0E14] text-white min-h-screen font-sans selection:bg-white/30">
      {/* Header */}
      <div className="sticky top-0 bg-[#0B0E14]/80 backdrop-blur-2xl z-50 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white border border-white/5 shadow-xl active:scale-90"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl">Notifications</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Activity Feed</p>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => markAllAsRead()}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-sm font-bold active:scale-95 group"
          >
            <CheckCircle2 size={18} className="group-hover:text-white transition-colors" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-8 px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-0 blur-2xl bg-white/10 rounded-full animate-pulse" />
            </div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Syncing Stream</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800/20 to-transparent rounded-[40px] flex items-center justify-center mb-8 ring-1 ring-white/5 shadow-2xl relative group">
              <BellOff size={48} className="text-gray-700 group-hover:text-white transition-colors duration-500" />
              <div className="absolute -inset-8 bg-white/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">Zero Alerts</h2>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed font-medium">
              Your activity feed is empty. We'll notify you the moment your favorite artists drop new fire.
            </p>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            <AnimatePresence initial={false}>
              {recentNotifications.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">New & Recent</h2>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
                  </div>
                  <div className="bg-[#12141C]/40 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                    {recentNotifications.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))}
                  </div>
                </div>
              )}

              {olderNotifications.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.3em]">Earlier</h2>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-gray-800/20 to-transparent" />
                  </div>
                  <div className="bg-[#12141C]/20 backdrop-blur-md rounded-[32px] overflow-hidden border border-white/[0.03]">
                    {olderNotifications.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => markAllAsRead()}
          className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-sm shadow-[0_20px_40px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
        >
          <CheckCircle2 size={18} />
          CLEAR ALL
        </button>
      </div>
    </div>
  );
};

export default NotificationPage;
