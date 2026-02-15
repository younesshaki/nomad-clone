import type { NarrativeScene } from "../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

// Background images for scene-2b slideshow
import bg1 from "./media/Birds_eye_view_overhead_shot_of_traditional_princ-1770032214446.png";
import bg2 from "./media/Professional_birds_eye_overhead_view_of_tradition-1770032221159.png";
import bg3 from "./media/Detailed_close-up_of_open_school_rulebook_page_dis-1770032331435.png";
import bg4 from "./media/Detailed_close-up_of_open_school_rulebook_page_dis-1770032336749.png";

export const scene2bBackgroundImages = [bg1, bg2, bg3, bg4];

// Time-based image cues synced to voiceover
export type ImageCue = {
  image: string;
  startTime: number;
  endTime: number;
  description?: string;
};

// Adjust these timestamps after listening to the VO
// Scene 2b VO is approximately 18-20 seconds
export const scene2bImageCues: ImageCue[] = [
  {
    image: bg1,
    startTime: 0,
    endTime: 4,
    description: "And children, more than adults, understand power..."
  },
  {
    image: bg2,
    startTime: 4,
    endTime: 8,
    description: "...when they see it."
  },
  {
    image: bg3,
    startTime: 8,
    endTime: 13,
    description: "The rule changed. Not with fanfare."
  },
  {
    image: bg4,
    startTime: 13,
    endTime: 22,
    description: "Just... changed. The way the world changes..."
  },
];

export const scene2b: NarrativeScene = {
  id: "scene-2b",
  title: "The Rebellion",
  voiceOver: chapter1VoiceOvers["scene-2b"],
  mode: "2d",
  lines: [
    { text: "And children," },
    { text: "more than adults," },
    { text: "understand power" },
    { text: "when they see it." },
    { text: "The rule changed." },
    { text: "Not with fanfare." },
    { text: "Not with apology." },
    { text: "Just... changed." },
    { text: "The way the world changes" },
    { text: "when a child refuses to accept it." },
  ],
};
