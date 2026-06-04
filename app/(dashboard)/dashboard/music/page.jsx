// @ts-check
'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, RotateCcw, Volume2, Download, Shuffle, Repeat, Video, Headphones, Loader2 } from 'lucide-react';
import { useMusic } from '@/components/MusicContext';
import dynamic from 'next/dynamic';
import { BACKEND_URL } from '@/lib/apiConfig';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const normalizeUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url;
};

export default function MusicPage() {
  const {
    currentTrack: globalTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    playTrack,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    muted,
    playerRef,
    setCurrentTime,
    setDuration,
    isVideoMode,
    setIsVideoMode
  } = useMusic();

  const [musicCategories, setMusicCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local UI state
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/videos/external/youtube/music-categories`);
        if (res.ok) {
          const data = await res.json();
          setMusicCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch music categories:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fallback data if nothing is playing
  const defaultTrack = {
    id: 0,
    title: "Select a Song",
    artist: "Sawaflix Music",
    image: "/music4.jpg",
    src: "",
  };

  const currentTrack = globalTrack || defaultTrack;

  const handleSeek = (e) => {
    if (!duration) return;
    const progressContainer = e.currentTarget;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  const handleReplay = () => {
    seekTo(0);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    setRepeatMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length]);
  };

  const handleDownload = () => {
    if (!currentTrack.src) return;
    window.open(currentTrack.src, '_blank');
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="h-64 bg-gray-800 rounded-2xl w-full"></div>
      <div>
        <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-36 sm:w-48 space-y-3">
              <div className="w-full aspect-square bg-gray-800 rounded-lg"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-900 text-white p-2 xs:p-3 sm:p-6 lg:p-8 pb-32">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-1 truncate">Sawa Music</h1>
          <p className="text-xs xs:text-sm sm:text-base text-gray-400 truncate">Listen or Watch Cameroonian hits</p>
        </div>
        
        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsVideoMode(false)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              !isVideoMode ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Headphones size={16} /> <span className="hidden sm:inline">Audio</span>
          </button>
          <button
            onClick={() => setIsVideoMode(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isVideoMode ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Video size={16} /> <span className="hidden sm:inline">Video</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <div className="space-y-8">
          
          {/* Now Playing Hero Section */}
          <div className="bg-gradient-to-br from-gray-800/50 to-[#0f1729] rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 border border-gray-700/50 relative overflow-hidden">
            {/* Background blur effect based on cover image */}
            <div 
              className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none transition-all duration-1000"
              style={{ backgroundImage: `url(${currentTrack.image})`, backgroundSize: 'cover' }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10">
              
              {/* Media Thumbnail or Video Player */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-black">
                {isVideoMode && currentTrack.src ? (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <ReactPlayer
                      ref={playerRef}
                      url={normalizeUrl(currentTrack.src)}
                      playing={isPlaying}
                      volume={volume}
                      muted={muted}
                      onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
                      onDuration={(d) => setDuration(d)}
                      onEnded={playNext}
                      width="100%"
                      height="100%"
                      controls={false}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 0, controls: 0, autoplay: 1, modestbranding: 1 }
                        }
                      }}
                      style={{ transform: 'scale(1.2)' }} // Slightly scale up to hide black bars on some videos
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center transition-all duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${currentTrack.image})` }}
                  />
                )}
                
                {isVideoMode && (
                  <div className="absolute top-2 right-2 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                    LIVE VIDEO
                  </div>
                )}
              </div>

              {/* Track Info & In-Page Controls */}
              <div className="flex-1 text-center md:text-left w-full min-w-0 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-orange-400 text-xs font-medium mb-3 w-max mx-auto md:mx-0 border border-white/5">
                  Now Playing
                </span>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 truncate text-white drop-shadow-md">
                  {currentTrack.title}
                </h2>
                <p className="text-sm sm:text-lg text-gray-300 mb-6 truncate max-w-xl">
                  {currentTrack.artist}
                </p>

                {/* Primary Controls */}
                <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-6 mb-6">
                  <button onClick={toggleShuffle} className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-orange-500' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                    <Shuffle size={18} />
                  </button>
                  <button onClick={playPrev} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="bg-orange-500 text-white rounded-full p-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
                  >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                  </button>
                  <button onClick={playNext} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110">
                    <SkipForward size={24} fill="currentColor" />
                  </button>
                  <button onClick={toggleRepeat} className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-orange-500' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                    <Repeat size={18} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="max-w-2xl w-full mx-auto md:mx-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-gray-400 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                    <div
                      className="flex-1 bg-gray-700/50 rounded-full h-1.5 cursor-pointer group relative"
                      onClick={handleSeek}
                    >
                      <div
                        className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full relative transition-all duration-100 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 w-10 text-left tabular-nums">{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* Visualizer (Only show if playing) */}
                <div className={`flex items-end justify-center md:justify-start gap-1 h-8 mt-6 overflow-hidden transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                  {Array.from({ length: 15 }, (_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-orange-500 rounded-t-sm"
                      style={{
                        height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '10%',
                        animation: isPlaying ? `bounce ${0.5 + Math.random()}s infinite alternate` : 'none'
                      }}
                    />
                  ))}
                </div>
                <style jsx>{`
                  @keyframes bounce {
                    from { height: 20%; }
                    to { height: 100%; }
                  }
                `}</style>
              </div>
            </div>
          </div>

          {/* Dynamic Categories Rows */}
          <div className="space-y-10">
            {musicCategories.map((categoryData, categoryIdx) => {
              if (!categoryData.videos || categoryData.videos.length === 0) return null;
              
              return (
                <div key={categoryIdx} className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{categoryData.category}</h3>
                    <button className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">See All</button>
                  </div>
                  
                  {/* Horizontal Scroll Container */}
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-2 -mx-2 px-2 sm:-mx-0 sm:px-0 scroll-smooth snap-x">
                    {categoryData.videos.map((video, videoIdx) => {
                      const trackObj = {
                        id: video.id,
                        title: video.title,
                        artist: video.channelTitle,
                        image: video.thumbnail,
                        src: video.videoUrl,
                        duration: "3:00" // Fallback since snippet API doesn't provide duration
                      };
                      
                      const isTrackPlaying = isPlaying && globalTrack?.id === trackObj.id;

                      return (
                        <div 
                          key={videoIdx} 
                          className="flex-shrink-0 w-36 sm:w-48 group cursor-pointer snap-start"
                          onClick={() => {
                            // If we click the currently playing track, just toggle pause/play
                            if (globalTrack?.id === trackObj.id) {
                              togglePlay();
                            } else {
                              // Provide the whole category as the playlist context
                              const playlist = categoryData.videos.map(v => ({
                                id: v.id,
                                title: v.title,
                                artist: v.channelTitle,
                                image: v.thumbnail,
                                src: v.videoUrl
                              }));
                              playTrack(trackObj, playlist);
                            }
                          }}
                        >
                          {/* Card Image */}
                          <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-800 shadow-md group-hover:shadow-xl transition-all duration-300">
                            <img 
                              src={trackObj.image} 
                              alt={trackObj.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              loading="lazy"
                            />
                            
                            {/* Hover / Playing Overlay */}
                            <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button className="bg-orange-500 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                {isTrackPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                              </button>
                            </div>
                            
                            {/* Playing Indicator */}
                            {isTrackPlaying && (
                              <div className="absolute bottom-2 right-2 flex gap-0.5 h-3 items-end">
                                <div className="w-1 bg-orange-500 h-full animate-pulse"></div>
                                <div className="w-1 bg-orange-500 h-2/3 animate-pulse delay-75"></div>
                                <div className="w-1 bg-orange-500 h-full animate-pulse delay-150"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Card Info */}
                          <h4 className="font-semibold text-sm sm:text-base text-gray-100 truncate group-hover:text-orange-400 transition-colors">
                            {trackObj.title}
                          </h4>
                          <p className="text-gray-400 text-xs sm:text-sm truncate mt-0.5">
                            {trackObj.artist}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
