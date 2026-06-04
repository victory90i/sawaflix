'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import SawaflixLogo from '@/components/SawaflixLogo';

export default function WaitingListPage() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Clear Supabase session
            await supabase.auth.signOut();

            // Clear local storage / session storage just to be sure
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }

            // Redirect to login
            router.push('/login?message=signed_out');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <SawaflixLogo className="!p-0 scale-75 sm:scale-100 origin-left" />
                </div>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 bg-transparent border border-white/20 rounded-md text-sm font-semibold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="max-w-xl w-full bg-[#111111] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider">
                            Status: Launching Soon
                        </span>
                    </div>

                    <div className="space-y-4 text-center">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            Account Created Successfully
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-400 font-medium leading-relaxed">
                            Thank you for joining Sawaflix. We are currently rolling out dashboard access in stages to ensure optimal streaming performance for all members.
                        </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-gray-500 text-sm sm:text-base leading-relaxed text-center italic">
                            "Our administration team reviews new account requests daily. You will receive an automated email notification the moment your dashboard access is approved and activated. Thank you for your patience."
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col items-center gap-4">
                        <div className="w-12 h-1 bg-[#E50914] rounded-full"></div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Sawaflix Global Access Control</p>
                    </div>
                </div>
            </main>

            {/* Footer / Contact */}
            <footer className="w-full py-6 px-4 text-center border-t border-white/5">
                <p className="text-gray-600 text-xs">
                    &copy; {new Date().getFullYear()} Sawaflix. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
