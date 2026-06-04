'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';

// Define the BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has already dismissed the prompt recently
    const hasDismissed = localStorage.getItem('sawaflix_pwa_dismissed');
    if (hasDismissed) {
      const dismissDate = new Date(hasDismissed);
      const now = new Date();
      const daysSinceDismissal = (now.getTime() - dismissDate.getTime()) / (1000 * 3600 * 24);
      if (daysSinceDismissal < 14) return;
    }

    // Listen for the native install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: if beforeinstallprompt never fires (dev mode, or already
    // eligible but event consumed), show the prompt after a short delay
    // so users can still see the install experience.
    const fallbackTimer = setTimeout(() => {
      setShowPrompt((current) => {
        // Only show if not already shown by beforeinstallprompt
        if (!current) return true;
        return current;
      });
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // We have the native prompt — trigger it
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
      if (outcome === 'accepted') {
        localStorage.setItem('sawaflix_pwa_installed', 'true');
      }
    } else {
      // If we don't have the prompt, show a sleeker in-app instruction instead of an alert
      // or simply focus the user on the browser's install icon
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      
      if (isIOS) {
        alert('To install: tap the Share icon at the bottom, then "Add to Home Screen"');
      } else {
        // Just hide the prompt if we can't programmatically install and it's desktop
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('sawaflix_pwa_dismissed', new Date().toISOString());
  };

  // Don't render anything if the app is already installed
  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[9999] w-[340px] max-w-[calc(100vw-3rem)] rounded-xl bg-[#111111] border border-[#222222] shadow-2xl p-5 flex flex-col gap-4 overflow-hidden"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#666666] hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 bg-[#b80000] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone size={22} className="text-white" />
            </div>
            <div className="flex flex-col pt-0.5">
              <h3 className="text-white font-medium text-base tracking-tight">Get the Sawaflix App</h3>
              <p className="text-[#888888] text-sm mt-1 leading-snug">Install for zero load times and an offline experience.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-[#b80000] hover:bg-[#a00000] text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-[#222222] hover:bg-[#333333] text-[#aaaaaa] hover:text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
