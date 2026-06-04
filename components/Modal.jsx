import React, { useState, useEffect } from 'react';
import { X, Star, Play, Plus, Loader2 } from 'lucide-react';
import { YouTubePlayer } from './YoutubePlayer';
import { playbackService, PlaybackResponse } from '@/services/playbackService';
import { PremiumPaywall } from './PremiumPaywall';

const Modal = ({ isOpen, onClose, movie, type = 'info' }) => {
  const [playbackInfo, setPlaybackInfo] = useState(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && type === 'play' && movie?.id) {
      const fetchPlayback = async () => {
        setIsLoading(true);
        try {
          // Determine fallback URL (defaulting to YouTube if no direct videoUrl is present)
          const fallback = movie.videoUrl || `https://www.youtube.com/watch?v=${movie.id}`;
          const info = await playbackService.getPlaybackSource(movie.id, fallback);
          setPlaybackInfo(info);
        } catch (err) {
          console.error('[Modal Playback] Error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlayback();
    }
  }, [isOpen, type, movie?.id, movie?.videoUrl]);

  const handleUnlock = async (method) => {
    try {
      const info = await playbackService.verifyPayment(movie.id, `sim-${Date.now()}`);
      setPlaybackInfo(info);
      setIsPaywallOpen(false);
    } catch (err) {
      console.error('Unlock failed:', err);
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F1117] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-white/10">
        <div className="relative aspect-video bg-black">
          {type === 'play' ? (
            <div className="relative w-full h-full">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                </div>
              ) : (
                <YouTubePlayer 
                  videoId={movie.id}
                  isActive={isOpen}
                  isMuted={false}
                  restriction={playbackInfo?.restriction}
                  onRestrictionReached={() => setIsPaywallOpen(true)}
                />
              )}
            </div>
          ) : (
            <img 
              src={movie.image} 
              alt={movie.title}
              className="w-full h-full object-cover opacity-80"
            />
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/20 z-20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-black mb-2">{movie.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span className="text-white font-bold">{movie.rating}</span>
                </div>
                <span>{movie.release_date}</span>
                {movie.duration_minutes && <span>{movie.duration_minutes} min</span>}
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase tracking-widest text-white">4K Ultra HD</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all font-bold active:scale-95 shadow-lg shadow-red-600/20">
                <Play size={18} fill="currentColor" />
                <span>{type === 'play' ? 'Restart' : 'Play Now'}</span>
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl transition-all border border-white/10">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed max-w-3xl">{movie.plot_summary}</p>
        </div>
      </div>

      <PremiumPaywall 
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        movie={movie}
        limitSeconds={playbackInfo?.restriction?.limitSeconds || 0}
        onUnlockSuccess={handleUnlock}
      />
    </div>
  );
};

export default Modal;