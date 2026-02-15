import { useRef } from "react";
import { Chapter1Narrative } from "./Chapter1Narrative";
import { useCinematicTimeline } from "../../shared/useCinematicTimeline";
import { useAmbientMusic } from "./useAmbientMusic";

// Ambient background music
import ambientMusicUrl from "./audio/Hans Zimmer - Time.mp3?url";

type Chapter1Props = {
  isActive?: boolean;
};

export default function Chapter1({ isActive = true }: Chapter1Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Ambient background music that plays behind VOs
  useAmbientMusic({
    musicUrl: ambientMusicUrl,
    isActive,
    baseVolume: 0.20,    // 20% volume when no VO
    duckedVolume: 0.06,  // 6% volume when VO is playing (ducked)
    fadeInDuration: 3,   // 3 second fade in
    fadeOutDuration: 2,  // 2 second fade out
    startDelay: 0.5,     // Start 0.5s after chapter begins
  });
  
  // Use the new cinematic timeline that auto-plays scenes and waits for scroll between them
  useCinematicTimeline({ 
    overlayRef, 
    isActive,
    sceneDuration: 25, // 25 seconds per scene, will extend based on VO duration
    introDelay: 3, // 3 second delay before first scene content appears
  });

  return (
    <>
      <Chapter1Narrative isActive={isActive} overlayRef={overlayRef} />
    </>
  );
}
