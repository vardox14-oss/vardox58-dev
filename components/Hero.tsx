/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { FaLocationArrow } from "react-icons/fa6";
import useSWR from "swr";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SpotifyProgress = ({ start, end }: { start: number; end: number }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const total = end - start;
  const current = Math.min(Math.max(0, now - start), total);
  const progress = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 mt-3 w-full">
      <span className="text-[11px] text-gray-200 font-bold font-mono tracking-wider">{formatTime(current)}</span>
      <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-white rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <span className="text-[11px] text-gray-200 font-bold font-mono tracking-wider">{formatTime(total)}</span>
    </div>
  );
};

const DiscordProfile = () => {
  const { data, error } = useSWR(
    "https://api.lanyard.rest/v1/users/1373318082461962333",
    fetcher,
    { refreshInterval: 1000 }
  );

  const discordUser = data?.data?.discord_user;
  const discordStatus = data?.data?.discord_status; // "online", "idle", "dnd", "offline"
  const activities = data?.data?.activities || [];
  const playingActivities = activities.filter((a: any) => a.type === 0);
  const listeningToSpotify = data?.data?.listening_to_spotify;
  const spotify = data?.data?.spotify;

const StatusIcon = ({ status, className = "w-4 h-4" }: { status: string, className?: string }) => {
  if (status === "dnd") {
    return (
      <div className={`${className} rounded-full bg-[#f23f42] flex items-center justify-center`}>
        <div className="w-[60%] h-[20%] bg-[#000319] rounded-sm" />
      </div>
    );
  }
  if (status === "idle") {
    return (
      <div className={`${className} rounded-full bg-[#f0b132] relative overflow-hidden`}>
        <div className="absolute -top-[15%] -left-[15%] w-[70%] h-[70%] rounded-full bg-[#000319]" />
      </div>
    );
  }
  if (status === "online") {
    return <div className={`${className} rounded-full bg-[#23a559]`} />;
  }
  // offline
  return (
    <div className={`${className} rounded-full bg-[#80848e] flex items-center justify-center`}>
      <div className="w-[50%] h-[50%] rounded-full bg-[#000319]" />
    </div>
  );
};

  const statusText =
    discordStatus === "online"
      ? "En ligne"
      : discordStatus === "idle"
      ? "Inactif"
      : discordStatus === "dnd"
      ? "Ne pas déranger"
      : "Hors ligne";

  return (
    <div className="flex flex-col items-center my-6 z-50 w-full">
      <div className="flex flex-col gap-4 border border-white/10 bg-black/20 backdrop-blur-md rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        {/* Sleek Horizontal Header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={
                discordUser
                  ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
                  : "/profile.jpg"
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full border border-white/10 object-cover"
              onError={(e) => {
                 e.currentTarget.src = "/profile.jpg";
              }}
            />
            {discordUser?.avatar_decoration_data?.asset && (
              <img
                src={`https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png?size=256`}
                alt="Avatar Decoration"
                className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] max-w-none object-cover pointer-events-none z-10"
              />
            )}
            {/* Status Indicator */}
            {discordStatus && (
              <div className="absolute bottom-0 right-0 p-1 bg-[#000319] rounded-full z-20">
                <StatusIcon status={discordStatus} className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex flex-col text-left">
            <a 
              href="https://discord.com/users/1373318082461962333" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer block"
            >
              <h2 className="text-2xl font-bold text-white tracking-wide hover:underline">
                {discordUser ? discordUser.global_name || discordUser.username : "vardox58"}
              </h2>
              <p className="text-gray-400 font-mono text-sm mt-1">
                @{discordUser ? discordUser.username : "vardox58"}
              </p>
            </a>
            <div className="flex items-center gap-2 mt-2">
              <StatusIcon status={discordStatus} className="w-3 h-3" />
              <span className="text-sm text-gray-300 font-medium">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        {(playingActivities.length > 0 || listeningToSpotify) && (
          <div className="w-full h-[1px] bg-white/10 my-2" />
        )}

        <div className="flex flex-col gap-3">
          {/* Playing Games */}
          {playingActivities.map((activity: any, i: number) => {
            const largeImage = activity.assets?.large_image;
            const smallImage = activity.assets?.small_image;
            const getImageUrl = (img: string, appId: string) => {
              if (!img) return null;
              if (img.startsWith("mp:external")) {
                return img.replace(/mp:external\/([^\/]+)\/(http[s]?\/.*)/, "https://$2");
              }
              return `https://cdn.discordapp.com/app-assets/${appId}/${img}.png`;
            };

            return (
              <div key={i} className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/5 text-left">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Joue à
                </p>
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 shrink-0">
                    {largeImage ? (
                      <img
                        src={getImageUrl(largeImage, activity.application_id) || ""}
                        className="w-full h-full rounded-xl object-cover"
                        alt="Activity Large"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gray-800 flex items-center justify-center">
                        🎮
                      </div>
                    )}
                    {smallImage && (
                      <img
                        src={getImageUrl(smallImage, activity.application_id) || ""}
                        className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-[#000319] bg-[#000319] object-cover"
                        alt="Activity Small"
                      />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">
                      {activity.name}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-300 truncate mt-0.5">
                        {activity.details}
                      </p>
                    )}
                    {activity.state && (
                      <p className="text-xs text-gray-300 truncate mt-0.5">
                        {activity.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Spotify */}
          {listeningToSpotify && spotify && (
            <div className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/5 text-left">
              <div className="flex items-center gap-1.5 mb-2">
                <p className="text-xs font-bold text-white tracking-wide">
                  Écoute Spotify
                </p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 shrink-0">
                  <img
                    src={spotify.album_art_url}
                    className="w-full h-full rounded-xl object-cover"
                    alt="Album Art"
                  />
                </div>
                <div className="flex flex-col overflow-hidden w-full">
                  <p className="text-sm font-bold text-white truncate">
                    {spotify.song}
                  </p>
                  <p className="text-xs text-gray-300 truncate mt-0.5">
                    {spotify.artist}
                  </p>
                  {spotify.timestamps && (
                    <SpotifyProgress start={spotify.timestamps.start} end={spotify.timestamps.end} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <div className="pb-20 pt-36">
      {/**
       *  UI: Spotlights
       */}
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="white"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="white" />
      </div>

      {/**
       *  UI: grid
       */}
      <div
        className="h-screen w-full dark:bg-[#050505] bg-white dark:bg-grid-white/[0.04] bg-grid-black/[0.2]
       absolute top-0 left-0 flex items-center justify-center"
      >
        {/* Radial gradient for the container to give a faded look */}
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-[#050505]
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>

      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <p className="uppercase tracking-widest text-xs text-center text-gray-400 max-w-80">
            Into The Abyss
          </p>

          <DiscordProfile />

          <TextGenerateEffect
            words="Transforming Concepts into Seamless User Experiences"
            className="text-center text-[40px] md:text-5xl lg:text-6xl mt-6"
          />

          <p className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-xl text-gray-400 mt-4">
            Creative Developer & Design Enthusiast.
          </p>

          <a href="#about" className="mt-8">
            <MagicButton
              title="Show my work"
              icon={<FaLocationArrow />}
              position="right"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
