'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Heart, MessageCircle, UserPlus, Video, Music, AtSign, Info } from 'lucide-react';
import { Notification, NotificationType } from '@/types/notification';

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'like': return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
    case 'comment': return <MessageCircle className="w-5 h-5 text-white fill-white/20" />;
    case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
    case 'reel_interaction': return <Video className="w-5 h-5 text-purple-500" />;
    case 'music_interaction': return <Music className="w-5 h-5 text-pink-500" />;
    case 'mention': return <AtSign className="w-5 h-5 text-yellow-500" />;
    default: return <Info className="w-5 h-5 text-white" />;
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
          className="fixed top-24 right-6 z-[9999] w-full max-w-[340px]"
        >
          <div className="bg-[#12141C] border border-white/10 rounded-[22px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-4 overflow-hidden relative group select-none">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {/* Actor Image/Icon */}
            <div className="relative flex-shrink-0">
              {notification.actorImage ? (
                <img 
                  src={notification.actorImage} 
                  alt={notification.actorName} 
                  className="w-11 h-11 rounded-full object-cover border border-white/10 shadow-lg"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  {getIcon(notification.type)}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 p-1 bg-white rounded-full border border-[#12141C] shadow-lg scale-75">
                <div className="text-white">
                  {getIcon(notification.type)}
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-[13px] font-black text-white truncate tracking-tight">
                {notification.actorName || 'Alert'}
              </h4>
              <p className="text-[11px] text-gray-400 font-bold line-clamp-1 mb-0.5">
                {notification.title}
              </p>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug font-medium">
                {notification.message}
              </p>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="relative p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all active:scale-90"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Progress Bar */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-white via-gray-300 to-white bg-[length:200%_100%] animate-gradient-x origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
