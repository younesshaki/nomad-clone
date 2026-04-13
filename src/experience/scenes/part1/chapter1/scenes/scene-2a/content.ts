import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

// Background images for scene-2a slideshow
import bg1 from "./media/Stunning_exterior_of_elegant_private_school_buildi-1770031945844.png";
import bg2 from "./media/Magnificent_exterior_view_of_prestigious_private_s-1770031955455.png";

export const scene2aBackgroundImages = [bg1, bg2];

// Time-based image cues synced to voiceover
// Each cue specifies which image to show at what point in the VO
export type ImageCue = {
  image: string;
  startTime: number; // seconds into the VO
  endTime: number;   // seconds - when to start fading to next
  description?: string; // optional note about what's being said
};

// Adjust these timestamps after listening to the VO
export const scene2aImageCues: ImageCue[] = [
  {
    image: bg1,
    startTime: 0,
    endTime: 8,
    description: "She didn't argue... She just refused."
  },
  {
    image: bg2,
    startTime: 8,
    endTime: 20,
    description: "One week became two... The principal called."
  },
];

export const scene2a: NarrativeScene = {
  id: "scene-2a",
  title: "The Rebellion",
  voiceOver: chapter1VoiceOvers["scene-2a"],
  mode: "2d",
  lines: [
    // Lines 0-3: appear during bg1 window (VO 0-8s). Adjust startTime to match your VO pacing.
    { text: "She didn't argue.",    startTime: 0.5,  endTime: 20 },
    { text: "She didn't cry.",      startTime: 1.4,  endTime: 20 },
    { text: "She didn't explain.",  startTime: 3,    endTime: 20 },
    { text: "She just... refused.", startTime: 4.8,  endTime: 20 },
    // Lines 4-9: appear during bg2 window (VO 8-20s)
    { text: "One week became two.",                  startTime: 7,    endTime: 20 },
    { text: "Two became three.",                     startTime: 8.7,  endTime: 20 },
    { text: "The principal called her parents.",     startTime: 10.8, endTime: 20 },
    { text: "Her parents said: \"Talk to her.\"",   startTime: 13,   endTime: 20 },
    { text: "No one could talk to her.",             startTime: 14.8, endTime: 20 },
    { text: "But the other girls were watching.",    startTime: 16.8, endTime: 20 },
  ],
};
