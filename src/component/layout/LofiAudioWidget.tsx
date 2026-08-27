// src/components/LofiAudioWidget.tsx
import React, { useState, useRef } from 'react';
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const LofiAudioWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // High quality royalty-free lo-fi stream link
  const LOFI_STREAM_URL = 'https://stream.zeno.fm/f3wvbbqmdg8uv';

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200">
      <audio ref={audioRef} src={LOFI_STREAM_URL} preload="none" />
      
      <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
        <Music className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden md:inline text-[11px]">Lo-Fi Study Radio</span>
      </div>

      <button
        onClick={togglePlay}
        className="p-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer ml-1"
        title={isPlaying ? 'Pause Lo-Fi Beats' : 'Play Lo-Fi Beats'}
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </button>

      <button
        onClick={toggleMute}
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
      </button>
    </div>
  );
};