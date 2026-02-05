import type { NarrativeScene } from "../../../shared/narrativeTypes";
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
    { text: "She didn't argue." },
    { text: "She didn't cry." },
    { text: "She didn't explain." },
    { text: "She just... refused." },
    { text: "One week became two." },
    { text: "Two became three." },
    { text: "The principal called her parents." },
    { text: "Her parents said: \"Talk to her.\"" },
    { text: "No one could talk to her." },
    { text: "But the other girls were watching." },
  ],
};
