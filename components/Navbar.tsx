"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import SawaflixLogo from "./SawaflixLogo";
import SearchBar from "./searchBar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });


  // Updated hrefs to match section IDs for scrolling
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Music", href: "#music" },
    { name: "Movies", href: "#movies" },
    { name: "Traditions", href: "#traditions" },
    { name: "Area Tory", href: "/dashboard/blogs" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isScrolled
        ? "bg-[#0B0E14]/90 backdrop-blur-md shadow-lg"
        : "bg-transparent"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <SawaflixLogo />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const isActive = link.href === "#home" 
                  ? pathname === "/" || pathname === "/home"
                  : pathname?.startsWith(link.href);
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    scroll={true}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "text-red-600 font-bold" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Buttons - Netflix Style */}
          <div className="hidden md:flex items-center gap-4">
<<<<<<< HEAD
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white cursor-pointer transition-colors p-1.5 hover:bg-white/10 rounded-full"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Language Selector Styled Button */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-1 bg-black/30 border border-white/40 rounded text-white text-sm font-medium hover:bg-black/50 transition-all cursor-pointer">
                <span className="text-xs">文A</span>
                English
                <motion.span animate={{ rotate: 0 }} className="inline-block">▼</motion.span>
              </button>
            </div>

=======
>>>>>>> origin/refactored-code
            {/* Red Sign In Button Feel */}
            <Link 
              href="/login" 
              className="bg-[#E50914] hover:bg-[#C11119] text-white px-5 py-1.5 rounded font-bold transition-all text-sm shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="-mr-2 flex md:hidden items-center">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white cursor-pointer transition-colors p-1.5 hover:bg-white/10 rounded-full mr-2"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-[#0B0E14] border-b border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <Link
                  href="/login"
                  className="w-full text-center bg-[#E50914] text-white px-4 py-2.5 rounded font-bold transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Overlay Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsSearchOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all active:scale-95"
            >
              <X size={24} />
            </button>

            {/* Search Content Container */}
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-gray-900/90 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-white tracking-tight">Search SawaFlix</h2>
                <p className="text-xs text-gray-400 mt-1">Discover cultural movies, music hits, and living traditions</p>
              </div>

              <SearchBar
                onSearch={(q) => {
                  router.push(`/dashboard?q=${encodeURIComponent(q)}`);
                  setIsSearchOpen(false);
                }}
                loading={false}
                results={[]}
                error={null}
                placeholder="Search movies, music, stories..."
                minQueryLength={2}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
