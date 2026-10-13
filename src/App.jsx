
import { useEffect, useRef, useState } from "react";

import Intro from "./components/intro/Intro";
import ParticlePortrait from "./components/intro/ParticlePortrait";
import FirstSelfie from "./components/memories/FirstSelfie";
import OctoberSeventeen from "./components/memories/Octoberseventeen";
import JourneyTimeline from "./components/memories/JourneyTimeline";

const MUSIC_VOLUME = 0.12;

export default function App() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Try autoplay when the website opens.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = MUSIC_VOLUME;

    audio.play().catch(() => {
      // Autoplay might be blocked by the browser.
      setIsPlaying(false);
    });
  }, []);

  // Start or resume background music.
  async function startMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = MUSIC_VOLUME;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      console.error("Music could not start:", error);
    }
  }

  // Toggle music ON/OFF.
  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
    } else {
      startMusic();
    }
  }

  return (
    <>
      {/* One audio player for the entire website */}
      <audio
        ref={audioRef}
        src="/assets/audio/they-call-this-love.mp3"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      

      <main>
        <Intro onStartMusic={startMusic} />
        <ParticlePortrait />
        <FirstSelfie />
        <OctoberSeventeen />
        <JourneyTimeline />
      </main>

      {/* Persistent music ON/OFF button */}
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? "Turn music off" : "Turn music on"}
        aria-pressed={isPlaying}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-[#C99BB5]/40 bg-[#17131B]/90 px-4 py-3 text-xs tracking-wider text-[#E8BDD0] shadow-lg backdrop-blur-md transition hover:border-[#C99BB5] hover:bg-[#241824] sm:bottom-7 sm:right-7"
      >
        <span className={isPlaying ? "animate-pulse" : ""}>
          {isPlaying ? "♫" : "♪"}
        </span>

        {isPlaying ? "MUSIC ON" : "MUSIC OFF"}
      </button>
    </>
  );
}
