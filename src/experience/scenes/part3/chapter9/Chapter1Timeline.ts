import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { chapter1BgmUrl } from "./audio";
import { useSoundSettings } from "../../../soundContext";

type Chapter1TimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
};

export function useChapter1Timeline(options: Chapter1TimelineOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { soundEnabled, soundBlocked } = useSoundSettings();

  useEffect(() => {
    const canPlay = soundEnabled && !soundBlocked;
    if (!options.isActive || !canPlay) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(chapter1BgmUrl);
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 0.7;
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    const playPromise = audio?.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }

    return () => {
      audio?.pause();
      if (audio) {
        audio.currentTime = 0;
      }
    };
  }, [options.isActive, soundEnabled, soundBlocked]);
}
