import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import audioAsset from "@/assets/magic-flute-overture.mp3.asset.json";

const STORAGE_KEY = "bg-music-muted";
const DEFAULT_VOLUME = 0.35;

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initialMuted = stored === null ? true : stored === "1";
    setMuted(initialMuted);
    const el = audioRef.current;
    if (el) {
      el.volume = DEFAULT_VOLUME;
      el.muted = initialMuted;
      // Attempt autoplay (muted so browsers allow it); actual sound waits for unmute.
      el.play().catch(() => {});
    }
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    const next = !muted;
    setMuted(next);
    el.muted = next;
    if (!next) {
      el.play().catch(() => {});
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioAsset.url}
        loop
        preload="auto"
        autoPlay
        muted
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Activar música de fondo" : "Silenciar música de fondo"}
        title={muted ? "Activar música — La Flauta Mágica (Mozart)" : "Silenciar música"}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-obsidian/80 text-gold shadow-gold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-obsidian/95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background ${
          hydrated && !muted ? "animate-pulse" : ""
        }`}
      >
        {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
        <span className="sr-only">
          {muted ? "Activar música" : "Silenciar música"}
        </span>
      </button>
    </>
  );
}
