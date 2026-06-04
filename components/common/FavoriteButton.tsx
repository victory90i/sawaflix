'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../contexts/FavoriteContext';

interface FavoriteButtonProps {
  content: any;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
}

const FavoriteButton = ({ content, className = '', iconSize = 20, showLabel = false }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const contentId = content.id || content.contentId || content.videoId || content.title;
  const active = isFavorite(contentId);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(content);
  };

  return (
    <button
      onClick={handleToggle}
      className={`group flex flex-col items-center gap-1 transition-all duration-300 ${className}`}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <div className={`relative p-2 rounded-full backdrop-blur-xl border border-white/10 transition-all duration-500 ${
        active 
          ? 'bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
          : 'bg-white/10 hover:bg-white/20 group-hover:scale-110'
      }`}>
        <motion.div
          animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Heart
            size={iconSize}
            className={`transition-all duration-300 ${
              active ? 'text-white fill-white' : 'text-white group-hover:text-red-400'
            }`}
          />
        </motion.div>

        {/* Animated particles on active */}
        <AnimatePresence>
          {active && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    opacity: 0,
                    x: Math.cos(i * 60 * Math.PI / 180) * 20,
                    y: Math.sin(i * 60 * Math.PI / 180) * 20
                  }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 m-auto w-1 h-1 bg-red-400 rounded-full pointer-events-none"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
      
      {showLabel && (
        <span className={`text-[10px] font-bold drop-shadow-lg mt-1 leading-none transition-colors ${
          active ? 'text-red-400' : 'text-white'
        }`}>
          {active ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
