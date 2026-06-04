'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useMusic } from '@/components/MusicContext';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const SILENT_AUDIO = "data:audio/mpeg;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/zCETAAACwBIAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=";

const SOUND_THUMB = "https://i.ibb.co/21Dd0zTh/sound.png";

const normalizeUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return url;
};

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const CAMEROON_COLORS = ['#009639', '#CE1126', '#FCD116'];

function useEqualizerBars(count, isPlaying) {
  const [bars, setBars] = useState(() => Array.from({ length: count }, () => 0.3));
  const animRef = useRef(null);
  useEffect(() => {
    if (!isPlaying) {
      setBars(Array.from({ length: count }, () => 0.15));
      return;
    }
    let running = true;
    const animate = () => {
      if (!running) return;
      setBars(prev => prev.map(() => 0.12 + Math.random() * 0.88));
      animRef.current = setTimeout(animate, 100 + Math.random() * 80);
    };
    animate();
    return () => { running = false; if (animRef.current) clearTimeout(animRef.current); };
  }, [isPlaying, count]);
  return bars;
}

export default function BottomPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, playNext, playPrev,
    playerRef, currentTime, duration, setDuration, setCurrentTime,
    volume, setVolume, muted, toggleMute, seekTo, isVideoMode, closePlayer, setIsPlaying
  } = useMusic();

  const pathname = usePathname();
  const isReelsPage = pathname === '/dashboard' || pathname?.includes('/reels') || pathname?.includes('/contentreels');

  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerOfflineToast = () => {
    setShowOfflineToast(true);
    setTimeout(() => setShowOfflineToast(false), 3000);
  };

  const handleTogglePlay = () => {
    if (isOffline && !isPlaying) {
      triggerOfflineToast();
      return;
    }
    togglePlay();
  };

  const handlePlayNext = () => {
    if (isOffline) {
      triggerOfflineToast();
      return;
    }
    playNext();
  };

  const handlePlayPrev = () => {
    if (isOffline) {
      triggerOfflineToast();
      return;
    }
    playPrev();
  };

  const leftBars = useEqualizerBars(7, isPlaying);
  const rightBars = useEqualizerBars(7, isPlaying);

  // Setup Media Session API and Background Play Hack
  useEffect(() => {
    // 1. Silent audio hack to keep the OS audio session alive in the background
    let silentAudio = null;
    if (isPlaying) {
      silentAudio = new Audio(SILENT_AUDIO);
      silentAudio.loop = true;
      silentAudio.volume = 0.1;
      silentAudio.play().catch(() => {}); // Ignore errors
    }

    // 2. Setup Media Session API for lock-screen controls
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title || 'Unknown Title',
        artist: currentTrack.artist || 'Unknown Artist',
        album: 'Sawa Music',
        artwork: [
          { src: currentTrack.image || SOUND_THUMB, sizes: '512x512', type: 'image/png' },
          { src: currentTrack.image || SOUND_THUMB, sizes: '256x256', type: 'image/png' },
          { src: currentTrack.image || SOUND_THUMB, sizes: '128x128', type: 'image/png' }
        ]
      });

      // Link OS media controls to our player functions
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }

    return () => {
      if (silentAudio) {
        silentAudio.pause();
        silentAudio.src = '';
      }
    };
  }, [currentTrack, isPlaying, setIsPlaying, playNext, playPrev]);

  if (!currentTrack || isReelsPage) return null;

  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const thumbImg = currentTrack.image || SOUND_THUMB;

  return (
    <>
      <style jsx>{`
        /* ===================== CONTAINER ===================== */
        .sawa-player {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          color: #fff;
          pointer-events: none;
        }
        .sawa-player * { pointer-events: auto; }

        .player-body {
          background: linear-gradient(180deg, rgba(11,14,20,0.97) 0%, rgba(6,8,12,0.99) 100%);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }

        /* ===================== CAMEROON PROGRESS (top) ===================== */
        .cmr-progress {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.06);
          cursor: pointer;
          z-index: 12;
        }
        .cmr-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #009639, #CE1126, #FCD116);
          transition: width 0.15s linear;
          position: relative;
        }
        .cmr-progress:hover .cmr-progress-fill::after {
          content: '';
          position: absolute;
          right: -5px; top: 50%; transform: translateY(-50%);
          width: 10px; height: 10px; border-radius: 50%;
          background: #FCD116;
          box-shadow: 0 0 8px rgba(252,209,22,0.6);
        }

        /* ===================== CLOSE BTN ===================== */
        .p-close {
          position: absolute;
          top: -20px; right: 14px;
          background: rgba(20,24,36,0.95);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.4);
          width: 24px; height: 20px;
          border-radius: 5px 5px 0 0;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          z-index: 15;
        }
        .p-close:hover { background: #CE1126; color: #fff; }

        /* ===================== SPINNING VINYL DISK ===================== */
        .vinyl-wrap {
          position: absolute;
          left: 50%;
          z-index: 20;
          pointer-events: none;
        }
        /* Desktop vinyl */
        .vinyl-wrap.desktop-vinyl {
          top: -32px;
          transform: translateX(-50%);
        }
        .vinyl-outer {
          border-radius: 50%;
          background: conic-gradient(from 0deg, #009639 0deg 120deg, #CE1126 120deg 240deg, #FCD116 240deg 360deg);
          padding: 3px;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(206,17,38,0.15);
        }
        .vinyl-outer.desktop-size { width: 64px; height: 64px; }
        .vinyl-outer.mobile-size { width: 54px; height: 54px; }
        .vinyl-outer.spinning { animation: vinyl-spin 3s linear infinite; }
        @keyframes vinyl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .vinyl-img-wrap {
          width: 100%; height: 100%;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
        }
        .vinyl-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .vinyl-img-wrap::after {
          content: '';
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 11px; height: 11px;
          border-radius: 50%;
          background: radial-gradient(circle, #111 40%, #333 70%, #111 100%);
          border: 1.5px solid rgba(255,255,255,0.08);
        }
        /* Vinyl grooves ring effect */
        .vinyl-img-wrap::before {
          content: '';
          position: absolute; inset: 0;
          border-radius: 50%;
          background: repeating-radial-gradient(
            circle at center,
            transparent 0px,
            transparent 4px,
            rgba(0,0,0,0.08) 4px,
            rgba(0,0,0,0.08) 5px
          );
          z-index: 1;
        }

        /* ===================== CAMEROON STRIPE (bottom) ===================== */
        .cmr-stripe { display: flex; height: 3px; }
        .cmr-stripe .sg { flex: 1; background: #009639; }
        .cmr-stripe .sr { flex: 1; background: #CE1126; }
        .cmr-stripe .sy { flex: 1; background: #FCD116; }

        /* ===================== EQUALIZER ===================== */
        .cmr-eq {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 30px;
          flex-shrink: 0;
        }
        .cmr-eq .eqb {
          width: 3.5px;
          border-radius: 2px;
          transition: height 0.08s ease-out;
          min-height: 3px;
        }

        /* =====================================================
           DESKTOP LAYOUT
           ===================================================== */
        .dt-layout {
          display: flex;
          align-items: center;
          padding: 14px 28px 10px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Left: track info */
        .dt-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
          max-width: 260px;
        }
        .dt-left .dt-thumb {
          width: 44px; height: 44px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #1a1f2e;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .dt-left .dt-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .dt-left .dt-meta { min-width: 0; flex: 1; }
        .dt-left .dt-title {
          font-size: 13px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0 0 2px 0;
        }
        .dt-left .dt-artist {
          font-size: 11px; color: rgba(255,255,255,0.4);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0;
        }

        /* Center: eq + controls + eq */
        .dt-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex: 2;
          padding-top: 4px;
        }

        /* Controls */
        .dt-ctrls {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .dt-ctrls .cb {
          background: none; border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer; padding: 8px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .dt-ctrls .cb:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .dt-ctrls .cb.pp {
          width: 46px; height: 46px;
          background: #fff; color: #0a0a0a;
          border-radius: 50%;
          margin: 0 6px;
          box-shadow: 0 2px 14px rgba(255,255,255,0.12);
        }
        .dt-ctrls .cb.pp:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 24px rgba(255,255,255,0.2);
        }

        /* Right: volume */
        .dt-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex: 1;
          max-width: 260px;
        }
        .dt-right .vb {
          background: none; border: none;
          color: rgba(255,255,255,0.45);
          cursor: pointer; padding: 4px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .dt-right .vb:hover { color: #fff; }
        .dt-right .vs {
          -webkit-appearance: none; appearance: none;
          width: 100px; height: 4px;
          background: rgba(255,255,255,0.12);
          border-radius: 3px; outline: none; cursor: pointer;
        }
        .dt-right .vs::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 13px; height: 13px;
          border-radius: 50%; background: #fff; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .dt-right .vs::-moz-range-thumb {
          width: 13px; height: 13px;
          border-radius: 50%; background: #fff; cursor: pointer; border: none;
        }

        /* =====================================================
           MOBILE LAYOUT
           ===================================================== */
        .mb-layout { display: none; }

        .mb-inner {
          padding: 32px 16px 12px;
          position: relative;
        }
        /* Mobile vinyl — centered at top */
        .vinyl-wrap.mobile-vinyl {
          top: -28px;
          transform: translateX(-50%);
        }

        /* Top: track info */
        .mb-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
          padding-top: 2px;
        }
        .mb-top .mb-thumb {
          width: 40px; height: 40px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #1a1f2e;
        }
        .mb-top .mb-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .mb-top .mb-meta { flex: 1; min-width: 0; }
        .mb-top .mb-t {
          font-size: 11px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0 0 2px 0;
        }
        .mb-top .mb-a {
          font-size: 9px; color: rgba(255,255,255,0.6); margin: 0;
        }

        /* Mobile controls */
        .mb-ctrls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
        }
        .mb-ctrls .mcb {
          background: none; border: none;
          color: rgba(255,255,255,0.65);
          cursor: pointer; padding: 6px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .mb-ctrls .mcb:hover { color: #fff; }
        .mb-ctrls .mpp {
          width: 50px; height: 50px;
          border-radius: 50%;
          background: #fff; color: #0a0a0a;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 14px rgba(255,255,255,0.12);
          transition: transform 0.2s;
        }
        .mb-ctrls .mpp:hover { transform: scale(1.06); }

        /* ===================== OFFLINE TOAST ===================== */
        .offline-toast {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(206,17,38,0.95);
          backdrop-filter: blur(8px);
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(206,17,38,0.4);
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .offline-toast.show {
          opacity: 1;
          top: -50px;
        }

        /* ===================== RESPONSIVE ===================== */
        @media (max-width: 768px) {
          .dt-layout { display: none !important; }
          .mb-layout { display: block !important; }
          .vinyl-wrap.desktop-vinyl { display: none !important; }
          .p-close { display: none; }
          .cmr-progress { top: 0px; }
        }
        @media (min-width: 769px) {
          .dt-layout { display: flex !important; }
          .mb-layout { display: none !important; }
          .vinyl-wrap.mobile-vinyl { display: none !important; }
        }
      `}</style>

      <div className="sawa-player">
        <div className={`offline-toast ${showOfflineToast ? 'show' : ''}`}>
          <span>⚠️</span> No internet connection to stream this track.
        </div>
        <div className="player-body">

          {/* Hidden ReactPlayer */}
          {!isVideoMode && (
            <div style={{ display: 'none' }}>
              <ReactPlayer
                ref={playerRef}
                url={normalizeUrl(currentTrack.src)}
                playing={isPlaying}
                volume={volume}
                muted={muted}
                onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
                onDuration={(d) => setDuration(d)}
                onEnded={playNext}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                width="0" height="0"
                config={{
                  youtube: { playerVars: { showinfo: 0, controls: 0, autoplay: 1, playsinline: 1 } },
                  file: { errorMessage: 'Error playing file' }
                }}
              />
            </div>
          )}

          {/* Cameroon progress bar (top) */}
          <div className="cmr-progress" onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            seekTo(((e.clientX - rect.left) / rect.width) * duration);
          }}>
            <div className="cmr-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Close */}
          <button className="p-close" onClick={closePlayer} title="Close Player">
            <X size={13} />
          </button>

          {/* DESKTOP spinning vinyl — centered above player */}
          <div className="vinyl-wrap desktop-vinyl">
            <div className={`vinyl-outer desktop-size ${isPlaying ? 'spinning' : ''}`}>
              <div className="vinyl-img-wrap">
                <img src={thumbImg} alt={currentTrack.title} />
              </div>
            </div>
          </div>

          {/* ===== DESKTOP LAYOUT ===== */}
          <div className="dt-layout">
            {/* Left: Track info */}
            <div className="dt-left">
              <div className="dt-thumb">
                <img src={thumbImg} alt={currentTrack.title} />
              </div>
              <div className="dt-meta">
                <p className="dt-title">{currentTrack.title}</p>
                <p className="dt-artist">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Center: EQ + Controls + EQ */}
            <div className="dt-center">
              <div className="cmr-eq">
                {leftBars.map((h, i) => (
                  <div key={`l${i}`} className="eqb" style={{ height: `${h * 100}%`, background: CAMEROON_COLORS[i % 3] }} />
                ))}
              </div>

              <div className="dt-ctrls">
                <button onClick={handlePlayPrev} className="cb" title="Previous">
                  <SkipBack size={22} fill="currentColor" />
                </button>
                <button onClick={handleTogglePlay} className="cb pp" title={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />}
                </button>
                <button onClick={handlePlayNext} className="cb" title="Next">
                  <SkipForward size={22} fill="currentColor" />
                </button>
              </div>

              <div className="cmr-eq">
                {rightBars.map((h, i) => (
                  <div key={`r${i}`} className="eqb" style={{ height: `${h * 100}%`, background: CAMEROON_COLORS[i % 3] }} />
                ))}
              </div>
            </div>

            {/* Right: Volume */}
            <div className="dt-right">
              <button onClick={toggleMute} className="vb">
                {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
              </button>
              <input type="range" min="0" max="1" step="0.01"
                value={muted ? 0 : volume} onChange={handleVolumeChange} className="vs" />
            </div>
          </div>

          {/* ===== MOBILE LAYOUT ===== */}
          <div className="mb-layout">
            {/* Mobile spinning vinyl — centered above player */}
            <div className="vinyl-wrap mobile-vinyl">
              <div className={`vinyl-outer mobile-size ${isPlaying ? 'spinning' : ''}`}>
                <div className="vinyl-img-wrap">
                  <img src={thumbImg} alt={currentTrack.title} />
                </div>
              </div>
            </div>

            <div className="mb-inner">
              {/* Track info */}
              <div className="mb-top">
                <div className="mb-thumb">
                  <img src={thumbImg} alt={currentTrack.title} />
                </div>
                <div className="mb-meta">
                  <p className="mb-t">{currentTrack.title}</p>
                  <p className="mb-a">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Centered controls with eq waves */}
              <div className="mb-ctrls">
                <div className="cmr-eq" style={{ height: '24px' }}>
                  {leftBars.slice(0, 4).map((h, i) => (
                    <div key={`ml${i}`} className="eqb" style={{ height: `${h * 100}%`, background: CAMEROON_COLORS[i % 3] }} />
                  ))}
                </div>
                
                <button onClick={handlePlayPrev} className="mcb">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button onClick={handleTogglePlay} className="mpp" style={{ width: 44, height: 44 }}>
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />}
                </button>
                <button onClick={handlePlayNext} className="mcb">
                  <SkipForward size={20} fill="currentColor" />
                </button>

                <div className="cmr-eq" style={{ height: '24px' }}>
                  {rightBars.slice(0, 4).map((h, i) => (
                    <div key={`mr${i}`} className="eqb" style={{ height: `${h * 100}%`, background: CAMEROON_COLORS[i % 3] }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cameroon flag stripe at bottom */}
          <div className="cmr-stripe">
            <div className="sg"></div>
            <div className="sr"></div>
            <div className="sy"></div>
          </div>
        </div>
      </div>
    </>
  );
}
