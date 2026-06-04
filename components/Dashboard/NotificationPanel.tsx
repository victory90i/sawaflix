'use client';

import React from 'react';
import { Bell, ArrowLeft, CheckCheck, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date | string;
  thumbnail?: string;
  contentId?: string;
}

interface NotificationPanelProps {
  title: string;
  subtitle?: string;
  notifications: NotificationItemData[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onClose: () => void;
  onItemClick: (id: string, contentId?: string) => void;
  viewAllHref?: string;
  accentColor?: 'red' | 'blue' | 'white';
}

const NotificationPanel = ({
  title,
  subtitle,
  notifications,
  unreadCount,
  onMarkAllRead,
  onClose,
  onItemClick,
  viewAllHref,
  accentColor = 'red'
}: NotificationPanelProps) => {
  const accentBorderClass = accentColor === 'red' ? 'after:bg-red-500' : 'after:bg-white';
  const accentBgClass = accentColor === 'red' ? 'bg-red-500' : 'bg-white';
  const accentTextClass = accentColor === 'red' ? 'text-red-500' : 'text-white';
  const accentLightBgClass = accentColor === 'red' ? 'bg-red-500/10' : 'bg-white/10';
  const accentHoverClass = accentColor === 'red' ? 'hover:bg-red-500' : 'hover:bg-white/20';

  // Specific button styles for "Mark all read"
  const markAllReadBg = accentColor === 'red' ? 'bg-red-500/10' : 'bg-white';
  const markAllReadText = accentColor === 'red' ? 'text-red-500' : 'text-black';
  const markAllReadHover = accentColor === 'red' ? 'hover:bg-red-500 hover:text-white' : 'hover:bg-white/90';

  return (
    <div className="absolute right-0 mt-4 w-[380px] bg-[#0F1217] rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
            aria-label="Close"
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <p className="text-[10px] text-zinc-500 font-medium">{subtitle || `${unreadCount} unread messages`}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onMarkAllRead}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${markAllReadBg} ${markAllReadText} ${markAllReadHover} transition-all text-[10px] font-bold group/btn shadow-sm`}
            type="button"
          >
            <CheckCheck size={12} className="transition-transform group-hover/btn:scale-110" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[480px] overflow-y-auto scrollbar-none py-2">
        {notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Bell size={24} className="text-zinc-600" />
            </div>
            <p className="text-sm font-bold text-white mb-1">All caught up!</p>
            <p className="text-xs text-zinc-500">No new notifications at the moment.</p>
          </div>
        ) : (notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => onItemClick(n.id, n.contentId)}
              className={`flex items-start px-6 py-4 border-b border-white/5 transition-colors group cursor-pointer ${!n.read ? `relative after:content-[""] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-8 ${accentBorderClass} after:rounded-r-full` : ''}`}
            >
              <div className="flex gap-4">
                <div className="relative shrink-0">
                  {n.thumbnail ? (
                    <div className="w-14 h-14 bg-[#161B22]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all shadow-lg">
                      <Image src={n.thumbnail} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-white/5 shadow-lg ${
                      n.type === 'post' ? 'text-red-500' : 'text-white'
                    }`}>
                      <Bell size={20} />
                    </div>
                  )}
                  {!n.read && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 ${accentBgClass} rounded-full border-2 border-[#0F1219] shadow-sm animate-pulse`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-[13px] font-bold leading-tight truncate pr-2 ${!n.read ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">
                      {typeof n.timestamp === 'string' ? n.timestamp : new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed group-hover:text-zinc-400 transition-colors">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {viewAllHref && (
        <div className="p-4 border-t border-white/5 text-center">
          <Link 
            href={viewAllHref} 
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-all group/view"
          >
            View all notifications
            <ChevronDown size={14} className="-rotate-90 group-hover/view:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
