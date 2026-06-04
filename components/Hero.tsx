"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Hero() {

  return (
    <section
      id="home"
      className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-center items-center bg-[#0B0E14]"
    >
      {/* High-Performance Optimized Background Image */}
      <div className="absolute inset-0 z-0 bg-[#0B0E14]">
        <img
          src="https://i.ibb.co/pBFfWnZP/Chat-GPT-Image-Apr-25-2026-04-40-19-AM.png"
          alt=""
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.55] saturate-[1.2] transition-opacity duration-700"
        />
        {/* Minimal gradients — just enough for text readability */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent hidden md:block" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 md:space-y-8"
          >
          {/* Subtitle / Brand Tag */}
          {/* <div className="flex justify-center">
            <span className="text-red-600 font-bold text-[9px] md:text-[11px] tracking-[0.5em] uppercase opacity-90">
              Sawaflix Original
            </span>
          </div> */}

          {/* Main Headline - Further Refined Scaling */}
          <h1 className="text-[clamp(2rem,7vw,3.5rem)] leading-[1.1] font-black tracking-wide text-white" style={{ wordSpacing: '0.15em' }}>
            Discover the Heart of<br className="hidden md:block" />
            African Entertainment
          </h1>

          {/* Description text - Compact & Elegant */}
          <p className="max-w-xl mx-auto text-[clamp(0.9rem,1.5vw,1.05rem)] text-gray-300 font-medium leading-relaxed px-4 md:px-0 opacity-75">
            Stream authentic African music, traditions, and cultural content from across the continent.
          </p>

          {/* Call to Action - Compact & Professional */}
          <div className="flex flex-col items-center pt-4 md:pt-6">
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 w-full md:w-auto md:px-10 py-3 md:py-3.5 bg-red-600 text-white rounded-lg font-black text-sm md:text-base transition-all active:scale-[0.97] shadow-xl shadow-red-600/20 hover:bg-red-700"
            >
              Get Started
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="mt-6 text-gray-500 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em]">
              Watch anywhere. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Fade for mobile app look */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0B0E14] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
