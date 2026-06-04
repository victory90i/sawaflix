// components/ReelsFeed.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, ChevronUp, Maximize, Minimize } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Video {
  id: string;
  title: string;
  description: string;
  release_date: string | null;
  producer_id: string | null;
  producer_name?: string | null;
  producers: {
    name: string;
  } | null;
  is_featured: boolean;
  featured_actors: string | null;
  video_url: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploaded_by: string;
}

interface ReelsFeedProps {
  videos: Video[];
  initialVideoId?: string;
}

interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  hasBeenViewed: boolean;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  avatar: string;
  timestamp: string;
  likes: number;
}

export default function ReelsFeed({ videos, initialVideoId }: ReelsFeedProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() => {
    if (initialVideoId) {
      const index = videos.findIndex(v => v.id === initialVideoId);
      return index !== -1 ? index : 0;
    }
    return 0;
  });
  const [videoStates, setVideoStates] = useState<Map<number, VideoState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const muteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pushedStateRef = useRef(false);

  // Check if desktop for responsive layout
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Generate some dummy comments for demonstration
  useEffect(() => {
    setComments([
      { id: '1', author: 'Alex King', text: 'This content is fire! 🔥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', timestamp: '2h', likes: 24 },
      { id: '2', author: 'Sarah J', text: 'Love the cinematography here.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', timestamp: '1h', likes: 12 },
      { id: '3', author: 'Mike Ross', text: 'Where was this filmed?', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', timestamp: '30m', likes: 5 },
      { id: '4', author: 'Elena P', text: 'Sawaflix is getting better and better!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', timestamp: '10m', likes: 8 },
    ]);
  }, []);

  // Initialize video states
  useEffect(() => {
    const newVideoStates = new Map<number, VideoState>();
    videos.forEach((_, index) => {
      newVideoStates.set(index, {
        isPlaying: false,
        isMuted: false, // Sound ON by default for each video
        hasBeenViewed: false
      });
    });
    // Set current video to play
    if (videos.length > 0) {
      newVideoStates.set(currentVideoIndex, {
        isPlaying: true,
        isMuted: false,
        hasBeenViewed: true
      });
    }
    setVideoStates(newVideoStates);
  }, [videos, currentVideoIndex]);

  // Helper function to get producer name
  const getProducerName = (video: Video) => {
    return video.producers?.name || video.producer_name || null;
  };

  // Initialize video refs array
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videos.length);
  }, [videos]);

  // Safe video play function
  const safePlay = async (video: HTMLVideoElement, index: number) => {
    try {
      // Clear any existing play promise
      if (playPromiseRef.current) {
        playPromiseRef.current = null;
      }

      // Set mute state for this specific video
      const videoState = videoStates.get(index);
      video.muted = videoState?.isMuted || false;

      // Create new play promise
      playPromiseRef.current = video.play();

      await playPromiseRef.current;
      setIsLoading(false);

      // Update video state
      setVideoStates(prev => {
        const newStates = new Map(prev);
        newStates.set(index, {
          ...(newStates.get(index) || { isMuted: false, hasBeenViewed: false }),
          isPlaying: true,
          hasBeenViewed: true
        });
        return newStates;
      });

    } catch (error) {
      console.log('Video play interrupted or failed:', error);
      setIsLoading(false);
    }
  };

  // Safe video pause function - IMMEDIATE
  const safePause = (video: HTMLVideoElement, index: number) => {
    try {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {
          video.pause();
        }).catch(() => {
          video.pause();
        });
        playPromiseRef.current = null;
      } else {
        video.pause();
      }

      // Update video state immediately
      setVideoStates(prev => {
        const newStates = new Map(prev);
        const currentState = newStates.get(index);
        if (currentState) {
          newStates.set(index, {
            ...currentState,
            isPlaying: false
          });
        }
        return newStates;
      });
    } catch (error) {
      console.log('Video pause failed:', error);
    }
  };

  // Play/pause videos based on intersection - IMMEDIATE
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = videoRefs.current.findIndex(ref => ref === entry.target);
          if (index === -1) return;

          const video = videoRefs.current[index];
          if (!video) return;

          const videoState = videoStates.get(index);
          const isIntersecting = entry.isIntersecting;
          const intersectionRatio = entry.intersectionRatio;

          if (isIntersecting && intersectionRatio >= 0.4) {
            // Video is 40% in view - play it immediately
            if (!videoState?.isPlaying) {
              setIsLoading(true);
              safePlay(video, index);
              setCurrentVideoIndex(index);

              // Pause all other videos immediately
              videoRefs.current.forEach((otherVideo, otherIndex) => {
                if (otherVideo && otherIndex !== index && videoStates.get(otherIndex)?.isPlaying) {
                  safePause(otherVideo, otherIndex);
                }
              });
            }
          } else if (!isIntersecting || intersectionRatio < 0.4) {
            // Video is less than 40% in view - pause it immediately
            if (videoState?.isPlaying) {
              safePause(video, index);
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: '0px 0px 0px 0px'
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos.length, videoStates]);

  // Handle scroll to switch videos
  const handleScroll = useCallback((event: React.WheelEvent) => {
    event.preventDefault();

    if (event.deltaY > 0) {
      // Scroll down - next video
      setCurrentVideoIndex(prev => Math.min(prev + 1, videos.length - 1));
    } else {
      // Scroll up - previous video
      setCurrentVideoIndex(prev => Math.max(prev - 1, 0));
    }

    // Show mute button temporarily when scrolling
    setShowMuteButton(true);
    if (muteTimeoutRef.current) {
      clearTimeout(muteTimeoutRef.current);
    }
    muteTimeoutRef.current = setTimeout(() => {
      setShowMuteButton(false);
    }, 3000);
  }, [videos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setCurrentVideoIndex(prev => Math.min(prev + 1, videos.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setCurrentVideoIndex(prev => Math.max(prev - 1, 0));
          break;
        case ' ':
          event.preventDefault();
          // Toggle play/pause for current video
          const currentVideo = videoRefs.current[currentVideoIndex];
          const currentState = videoStates.get(currentVideoIndex);
          if (currentVideo && currentState) {
            if (currentState.isPlaying) {
              safePause(currentVideo, currentVideoIndex);
            } else {
              setIsLoading(true);
              safePlay(currentVideo, currentVideoIndex);
            }
          }
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          handleToggleMute(currentVideoIndex);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [videos.length, currentVideoIndex, videoStates]);

  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe up - next video
      setCurrentVideoIndex(prev => Math.min(prev + 1, videos.length - 1));
    } else if (touchEnd - touchStart > 50) {
      // Swipe down - previous video
      setCurrentVideoIndex(prev => Math.max(prev - 1, 0));
    }
  };

  // Handle video ended event - loop current video
  const handleVideoEnd = useCallback((index: number) => {
    if (index === currentVideoIndex) {
      const video = videoRefs.current[index];
      if (video) {
        video.currentTime = 0;
        safePlay(video, index);
      }
    }
  }, [currentVideoIndex]);

  // Toggle mute for specific video
  const handleToggleMute = (index: number) => {
    setVideoStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(index);
      if (currentState) {
        newStates.set(index, {
          ...currentState,
          isMuted: !currentState.isMuted
        });

        // Update the actual video element
        const video = videoRefs.current[index];
        if (video) {
          video.muted = !currentState.isMuted;
        }
      }
      return newStates;
    });

    // Show mute button temporarily when toggling
    setShowMuteButton(true);
    if (muteTimeoutRef.current) {
      clearTimeout(muteTimeoutRef.current);
    }
    muteTimeoutRef.current = setTimeout(() => {
      setShowMuteButton(false);
    }, 3000);
  };

  // Show mute button on mouse move
  const handleMouseMove = () => {
    setShowMuteButton(true);
    if (muteTimeoutRef.current) {
      clearTimeout(muteTimeoutRef.current);
    }
    muteTimeoutRef.current = setTimeout(() => {
      setShowMuteButton(false);
    }, 3000);
  };

  // Modal toggle handler – opens/closes custom overlay and updates history state
  const handleToggleModal = useCallback(() => {
    if (!isModalOpen) {
      setIsModalOpen(true);
      if (typeof window !== 'undefined') {
        window.history.pushState({ reelModal: true }, '');
      }
      pushedStateRef.current = true;
    } else {
      setIsModalOpen(false);
      // Pop the history state if we added one
      if (typeof window !== 'undefined' && window.history.state && window.history.state.reelModal) {
        window.history.back();
      }
    }
  }, [isModalOpen]);

  // Listen for browser back navigation & Escape key to close modal if open
  useEffect(() => {
    const handlePopState = () => {
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      pushedStateRef.current = false;
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleToggleModal();
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, handleToggleModal]);

  // Fixed ref callback function
  const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;

    if (el) {
      // Set initial mute state from videoStates
      const videoState = videoStates.get(index);
      if (videoState) {
        el.muted = videoState.isMuted;
      }

      // Add event listeners for each video
      el.addEventListener('ended', () => handleVideoEnd(index));
      el.addEventListener('canplay', () => {
        const currentState = videoStates.get(index);
        if (index === currentVideoIndex && currentState?.isPlaying) {
          safePlay(el, index);
        }
      });
    }
  };

  // Clean up event listeners and timeouts
  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.removeEventListener('ended', () => { });
          video.removeEventListener('canplay', () => { });
        }
      });

      if (muteTimeoutRef.current) {
        clearTimeout(muteTimeoutRef.current);
      }
    };
  }, []);

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No videos yet</p>
          <p className="text-gray-400">Upload the first video to get started!</p>
        </div>
      </div>
    );
  }

  const currentVideoState = videoStates.get(currentVideoIndex);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      text: commentText,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      timestamp: 'Just now',
      likes: 0
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  return (
    <div
      ref={containerRef}
      className={`h-screen bg-black overflow-hidden flex flex-col lg:flex-row ${
        isModalOpen
          ? 'fixed inset-0 z-[100] w-screen h-screen bg-[#0B0E14]/95 backdrop-blur-md'
          : 'relative'
      }`}
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
    >
      {/* Video Content Section */}
      <motion.div
        animate={{
          width: showComments && isDesktop ? 'calc(100% - 400px)' : '100%',
          y: showComments && !isDesktop ? '-20%' : '0%',
          scale: showComments && !isDesktop ? 0.85 : 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full relative overflow-hidden"
      >
        <div className="h-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="h-full snap-start relative flex items-center justify-center bg-black"
            >
              {/* Video Player Wrapper */}
              <motion.div
                animate={{
                  scale: showComments && isDesktop ? 0.9 : 1,
                  x: showComments && isDesktop ? '-2%' : '0%'
                }}
                className="relative h-full w-full flex items-center justify-center"
              >
                <video
                  ref={setVideoRef(index)}
                  className="h-full w-full object-contain lg:object-cover max-h-screen"
                  loop={false}
                  playsInline
                  preload="auto"
                  onClick={() => {
                    const videoState = videoStates.get(index);
                    if (videoState?.isPlaying) {
                      safePause(videoRefs.current[index]!, index);
                    } else {
                      setIsLoading(true);
                      safePlay(videoRefs.current[index]!, index);
                    }
                  }}
                >
                  <source src={video.video_url} type={video.mime_type} />
                  Your browser does not support the video tag.
                </video>
              </motion.div>

              {/* Action Buttons & Info - Only visible when comments are closed on mobile */}
              <AnimatePresence>
                {(!showComments || isDesktop) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"
                  >
                    {/* Bottom Info */}
                    <div className="absolute bottom-24 left-4 right-16 text-white">
                      <h3 className="text-lg font-bold mb-1 drop-shadow-md">{video.title}</h3>
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2 max-w-[80%] drop-shadow-sm">{video.description}</p>

                      <div className="flex items-center space-x-3 text-sm text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/10 overflow-hidden">
                          <Image
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${getProducerName(video) || 'S'}`}
                            alt="Producer"
                            width={32}
                            height={32}
                          />
                        </div>
                        <span className="font-medium text-white">{getProducerName(video) || 'Anonymous'}</span>
                      </div>
                    </div>

                    {/* Right Side Actions — TikTok-style: compact, bottom-pinned */}
                    <div className="absolute right-3 bottom-20 flex flex-col items-center gap-0 pointer-events-auto">
                      <button className="flex flex-col items-center text-white group py-1">
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
                          <Heart size={20} className="hover:text-red-500 transition-colors" />
                        </div>
                        <span className="text-[9px] font-bold leading-none mt-0.5 text-white/80">24.5K</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowComments(true);
                        }}
                        className="flex flex-col items-center text-white group py-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
                          <MessageCircle size={20} />
                        </div>
                        <span className="text-[9px] font-bold leading-none mt-0.5 text-white/80">{comments.length}</span>
                      </button>

                      <button className="flex flex-col items-center text-white group py-1">
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
                          <Share2 size={20} />
                        </div>
                        <span className="text-[9px] font-bold leading-none mt-0.5 text-white/80">Share</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMute(index);
                        }}
                        className="flex flex-col items-center text-white group py-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
                          {videoStates.get(index)?.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </div>
                        <span className="text-[9px] font-bold leading-none mt-0.5 text-white/80">{videoStates.get(index)?.isMuted ? 'Unmute' : 'Mute'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleModal();
                        }}
                        className="flex flex-col items-center text-white group py-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5">
                          {isModalOpen ? <Minimize size={20} /> : <Maximize size={20} />}

                        </div>
                        <span className="text-[9px] font-bold leading-none mt-0.5 text-white/80">{isModalOpen ? 'Close' : 'Open'}
</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vertical Progress Bar */}
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/5 pointer-events-none">
                <div
                  className="w-full bg-white transition-all duration-300"
                  style={{
                    height: `${((currentVideoIndex + 1) / videos.length) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Top Controls Overlay (Fixed) */}
        <div className="absolute top-6 left-6 flex items-center space-x-3 pointer-events-none z-40">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Play size={18} fill="white" className="ml-0.5" />
          </div>
          <span className="text-white font-black tracking-tighter text-xl uppercase">Reels</span>
        </div>
      </motion.div>

      {/* Comment Section */}
      <AnimatePresence>
        {showComments && (
          <>
            {/* Backdrop for Mobile */}
            {!isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowComments(false)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
            )}

            {/* Comment Box */}
            <motion.div
              initial={isDesktop ? { x: '100%' } : { y: '100%' }}
              animate={isDesktop ? { x: 0 } : { y: 0 }}
              exit={isDesktop ? { x: '100%' } : { y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag={isDesktop ? false : "y"}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) setShowComments(false);
              }}
              className={`fixed lg:relative z-50 bg-[#0F1117] border-white/10 flex flex-col shadow-2xl ${isDesktop
                ? 'h-screen w-[400px] border-l'
                : 'bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t h-[75vh]'
                }`}
            >
              {/* Drag Handle (Mobile) */}
              {!isDesktop && (
                <div className="w-full flex justify-center py-3">
                  <div className="w-10 h-1.5 bg-white/20 rounded-full" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-white/5">
                <h3 className="text-white font-bold text-lg">Comments ({comments.length})</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={comment.avatar}
                        alt={comment.author}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-white/5"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm">{comment.author}</span>
                        <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart size={14} />
                          <span className="text-xs">{comment.likes}</span>
                        </button>
                        <button className="text-gray-500 hover:text-white text-xs font-medium">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendComment} className="p-6 bg-[#161922] border-t border-white/5 pb-10 lg:pb-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-700 transition-all hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes ping-once {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-ping-once { animation: ping-once 0.8s cubic-bezier(0, 0, 0.2, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}