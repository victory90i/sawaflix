'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellRing } from 'lucide-react';

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and currently in 'default' state (not granted or denied yet)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Wait a few seconds before asking for notifications
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-[9998] w-[340px] max-w-[calc(100vw-3rem)] rounded-xl bg-[#111111] border border-[#222222] shadow-2xl p-5 flex flex-col gap-4 overflow-hidden"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#666666] hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 bg-[#222222] border border-[#333333] rounded-lg flex items-center justify-center shrink-0">
              <BellRing size={22} className="text-white" />
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-white font-medium text-base tracking-tight">Stay Updated</h3>
              <p className="text-[#888888] text-sm mt-1 leading-snug">Turn on notifications to get alerts for new movies and episodes.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleEnable}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell size={16} />
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-[#222222] hover:bg-[#333333] text-[#aaaaaa] hover:text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
