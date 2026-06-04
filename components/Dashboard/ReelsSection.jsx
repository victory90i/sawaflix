'use client';

import React, { useState, useEffect } from 'react';
import { Play, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SawaflixLogo from '../SawaflixLogo';
import YouTubePlayer from '../YoutubePlayer';

const REELS_FALLBACK = [
  { id: 'kJQP7kiw5Fk', title: 'Viral Music Moment', creator: 'Music Vibe', views: '2.4M', category: 'music', image: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk Vibes', creator: 'Dance Studio', views: '1.2M', category: 'music', image: 'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg' },
  { id: '8jUJivE9xIY', title: 'Breaking News Short', creator: 'Sawa News', views: '800K', category: 'news', image: 'https://i.ytimg.com/vi/8jUJivE9xIY/maxresdefault.jpg' },
  { id: 'ppnaU3oezZU', title: 'African Comedy Gold', creator: 'Laugh Factory', views: '3.1M', category: 'blog', image: 'https://i.ytimg.com/vi/ppnaU3oezZU/maxresdefault.jpg' },
  { id: '-L8hLkg21MQ', title: 'Jerusalema Challenge', creator: 'Global Hits', views: '5.6M', category: 'music', image: 'https://i.ytimg.com/vi/-L8hLkg21MQ/maxresdefault.jpg' },
  { id: '3MA0xds_Dk-qPCWN', title: 'Funny Moments', creator: 'Comedy Central', views: '1.5M', category: 'blog', image: 'https://i.ytimg.com/vi/3MA0xds_Dk-qPCWN/maxresdefault.jpg' }
];

const ReelCard = ({ reel, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[9/16] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Poster Image */}
        <Image
          src={reel.image}
          alt={reel.title}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-110 ${isHovered ? 'opacity-0' : 'opacity-60'}`}
          unoptimized
        />

        {/* Video Player (Plays on Hover) */}
        {isHovered && (
          <div className="absolute inset-0 z-0 scale-[3.2] origin-center">
            <YouTubePlayer
              videoId={reel.id}
              isActive={true}
              isMuted={true}
            />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/20 backdrop-blur-[1px] ${isHovered ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* SawaFlix Watermark */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
          <p className="text-[7px] font-black text-white/90 uppercase tracking-[0.4em] leading-none">
            Sawa<span className="text-red-600">Flix</span>
          </p>
        </div>

      {/* Trending Badge */}
      {index < 2 && (
        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg z-10">
          <TrendingUp className="w-3 h-3" />
          HOT
        </div>
      )}

      {/* Duration Badge */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold">
        0:30
      </div>
    </div>

    {/* Content */}
    <div className="p-4 space-y-2">
      <div>
        <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-red-500 transition-colors">
          {reel.title}
        </h3>
        <p className="text-gray-400 text-[10px] mt-1 font-medium">{reel.creator} • {reel.views} views</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-gray-400 text-[10px] border-t border-white/5 pt-3">
        <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors group/btn font-bold">
          <Heart className="w-3.5 h-3.5 group-hover/btn:fill-red-500" />
          <span>1.2K</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group/btn font-bold">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>234</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors group/btn">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
  );
};

}

export default function ReelsSection() {
  const [reels, setReels] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setReels(REELS_FALLBACK);
  }, []);

  const categories = [
    { id: 'all', label: 'All Reels' },
    { id: 'music', label: '🎵 Music' },
    { id: 'news', label: '📰 News' },
    { id: 'blog', label: '📖 Blogs' },
  ];

  const filteredReels = activeCategory === 'all' 
    ? reels 
    : reels.filter(reel => reel.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image src="/sawaplay.png" alt="Sawa" fill className="object-contain" />
          </div>
          <h2 className="text-white font-black text-lg sm:text-[26px] tracking-tight leading-none opacity-90">Sawas</h2>
        </div>
        <p className="text-gray-400/60 font-medium text-sm ml-1">Trending short-form entertainment</p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-5 py-2 rounded-lg border text-[11px] font-bold transition-all duration-300 cursor-pointer tracking-widest ${
              activeCategory === category.id
                ? "border-white text-white bg-white/10"
                : "border-white/10 text-gray-400 hover:border-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredReels.map((reel, index) => (
          <ReelCard key={reel.id} reel={reel} index={index} />
        ))}
      </div>

      {/* View More */}
      <div className="flex justify-center pt-6">
        <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all hover:border-red-600/50 hover:text-red-500">
          Load More Reels
        </button>
      </div>
    </div>
  );
}
