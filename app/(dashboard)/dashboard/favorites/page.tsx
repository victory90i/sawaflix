'use client';

import React, { useState } from 'react';
import { Heart, Trash2, ArrowRight, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../../../contexts/FavoriteContext';
import MoviesSection from '../../../../components/MoviesSection';
import Image from 'next/image';
import Link from 'next/link';

const getItemLink = (item: any) => {
  if (item.type === 'reel') return `/dashboard/reels?videoId=${item.contentId}`;
  if (item.type === 'music') return `/dashboard/musicpage?id=${item.contentId}`;
  return `/video/${item.contentId}`; // Default for movies
};

const FavoriteCard = ({ item, onRemove }: { item: any, onRemove: (item: any) => void }) => {
  const link = getItemLink(item);
  const image = item.thumbnail || item.image || 'https://i.ibb.co/WWhx2c0g/sawaflixmusic-cover.png';
  const title = item.title || 'Untitled';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-xl bg-[#141414] border border-transparent aspect-[2/3] transition-all duration-500 hover:scale-[1.03] hover:border-white/10"
    >
      <Image 
        src={image} 
        alt={title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        unoptimized
      />
      
      {/* Dim Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-40 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />
      
      {/* Main clickable area for the card */}
      <Link href={link} className="absolute inset-0 z-0" aria-label={`View ${title}`} />

      {/* Title at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 pointer-events-none z-10">
        <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {title}
        </h3>
        <p className="text-gray-300 text-[10px] md:text-xs mt-1 uppercase tracking-wider font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md">
          {item.type || 'Video'}
        </p>
      </div>

      {/* Quick Actions centered */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 z-10 pointer-events-none">
        <Link 
          href={link} 
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-red-600 hover:text-white hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] pointer-events-auto"
        >
          <Play className="w-5 h-5 md:w-6 md:h-6 ml-1 fill-current" />
        </Link>
        <Link 
          href={link} 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] pointer-events-auto"
        >
          <Info className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
      </div>

      {/* Remove Button top right */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item);
        }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/70 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white hover:border-white/30 hover:scale-110 transition-all z-20"
        title="Remove from Favorites"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const LoadingState = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="space-y-3">
      <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
      <div className="h-5 w-72 bg-white/5 rounded-lg animate-pulse" />
    </div>
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-9 w-20 bg-white/5 rounded-full animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-24 md:py-40 text-center"
  >
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
      <Heart className="w-8 h-8 text-white/40" />
    </div>
    <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Your collection is empty</h3>
    <p className="text-white/50 max-w-sm mb-10 text-base leading-relaxed">
      Discover the best of African cinema, music, and reels. Save your favorites to build a personalized library.
    </p>
    <Link href="/dashboard">
      <button className="px-8 py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2">
        Explore Content
        <ArrowRight className="w-4 h-4" />
      </button>
    </Link>
  </motion.div>
);

const FavoritesPage = () => {
  const { favorites, loading, toggleFavorite } = useFavorites();
  const [filterType, setFilterType] = useState('all');

  const filteredFavorites = favorites.filter(item => {
    return filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase();
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'movie', label: 'Movies' },
    { id: 'music', label: 'Music' },
    { id: 'reel', label: 'Reels' },
  ];

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="animate-in fade-in duration-700 pb-10 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-10 mt-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-baseline gap-4">
            My Favorites
            {favorites.length > 0 && (
              <span className="text-xl font-medium text-white/40 tracking-normal">
                {favorites.length}
              </span>
            )}
          </h1>
          <p className="text-white/50 text-base max-w-2xl">
            Your personal collection of saved movies, music, and reels.
          </p>
        </div>

        {/* Filter Chips */}
        {favorites.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  filterType === cat.id
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="popLayout">
        {filteredFavorites.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 relative z-10"
          >
            {filteredFavorites.map((item) => (
              <FavoriteCard 
                key={item.id} 
                item={item} 
                onRemove={toggleFavorite} 
              />
            ))}
          </motion.div>
        ) : (
          favorites.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center text-gray-400"
            >
              No {filterType} found in your favorites.
            </motion.div>
          ) : (
            <EmptyState />
          )
        )}
      </AnimatePresence>

      {/* Recommendations Section */}
      <div className="relative -mt-10 pb-10">
        <div className="w-full h-px bg-white/5 mb-4" />
        <MoviesSection />
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default FavoritesPage;
