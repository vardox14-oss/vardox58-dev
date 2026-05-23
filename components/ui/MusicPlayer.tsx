"use client";
import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MusicPlayer = () => {
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Prevent scrolling while on enter screen
  useEffect(() => {
    if (!entered) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  const handleEnter = () => {
    setEntered(true);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!entered && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            onClick={handleEnter}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050505] cursor-pointer"
          >
            <motion.p
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-white text-xl md:text-3xl font-mono tracking-widest uppercase text-center px-4"
            >
              Click to enter to the vardox58
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`fixed top-6 right-6 z-[100] flex items-center bg-[#050505]/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl gap-4 hover:bg-[#050505]/90 transition-all duration-700 ${
          entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <audio ref={audioRef} src="/music.mp3" loop />

        {/* Cover */}
        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-white/20">
          <img src="/cover.jpg" alt="Cover" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-black/20 ${isPlaying ? "animate-pulse" : ""}`}></div>
        </div>

        {/* Info */}
        <div className="flex flex-col w-[120px] sm:w-[150px] overflow-hidden">
          <p className="text-sm font-bold text-white truncate" title="Booska-Pluie de balles">
            Booska-Pluie de balles
          </p>
          <p className="text-xs text-gray-400 truncate" title="Saïf, Booska-P">
            Saïf, Booska-P
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-3">
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3 ml-1" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
