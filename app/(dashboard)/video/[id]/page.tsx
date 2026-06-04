'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import SawaFlix from '@/components/Dashboard/SawaFlix';

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-full">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
            <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full animate-pulse" />
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Video...</p>
        </div>
      }>
        <SawaFlix videoId={id} />
      </Suspense>
    </div>
  );
}
