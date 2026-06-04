import { WifiOff } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline | Sawaflix',
  description: 'You are currently offline.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-[#1A202C] rounded-full flex items-center justify-center mb-6 shadow-lg">
        <WifiOff size={48} className="text-[#b80000]" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
        You are offline
      </h1>
      
      <p className="text-gray-400 max-w-md mb-8">
        It looks like you've lost your internet connection. We couldn't load this page, but your app is still running. Check your network and try again.
      </p>
      
      <button 
        className="bg-[#b80000] hover:bg-[#d10000] text-white font-medium py-3 px-8 rounded-xl transition-colors"
      >
        <Link href="/">
          Try Again
        </Link>
      </button>
    </div>
  );
}
