import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

// Background images for scene-4a slideshow (in order)
import bg1 from "./media/ChatGPT Image 6 févr. 2026, 05_25_38.png";
import bg2 from "./media/ChatGPT Image 6 févr. 2026, 05_26_47.png";
import bg3 from "./media/Beautiful_exterior_shot_of_Mohammed_V_Stadium_Casa-1770032770479.png";
import bg4 from "./media/Beautiful_intimate_close-up_portrait_of_father_and-1770104989987.png";
// Background video for final segment
import scene4aVideoUrl from "./media/video-1770105521126.mp4?url";

export const scene4aBackgroundImages = [bg1, bg2, bg3, bg4];
export { scene4aVideoUrl };

// Time-based media cues synced to voiceover
export type ImageCue = {
  image: string;
  startTime: number;
  endTime: number;
  description?: string;
};

export type VideoCue = {
  video: string;
  startTime: number;
  endTime: number;
  description?: string;
};

// Scene 4a VO is ~26 seconds
// Images play first (0-20s), then video takes over (20-26s)
export const scene4aImageCues: ImageCue[] = [
  {
    image: bg1,
    startTime: 0,
    endTime: 5,
    description: "Saturdays were sacred. Not church. Not mosque. The stadium."
  },
  {
    image: bg2,
    startTime: 5,
    endTime: 10,
    description: "Where 60,000 people believed in the same thing."
  },
  {
    image: bg3,
    startTime: 10,
    endTime: 15,
    description: "Where her father became a child again. Where she became infinite."
  },
  {
    image: bg4,
    startTime: 15,
    endTime: 20,
    description: "He'd lift her up."
  },
];

// Video plays after images (last ~6 seconds of VO)
export const scene4aVideoCue: VideoCue = {
  video: scene4aVideoUrl,
  startTime: 20,
  endTime: 30,
  description: "And from up there, on his shoulders, she could see everything..."
};

export const scene4a: NarrativeScene = {
  id: "scene-4a",
  title: "The Ritual",
  voiceOver: chapter1VoiceOvers["scene-4"],
  mode: "2d",
  lines: [
    { text: "Saturdays were sacred." },
    { text: "Not church." },
    { text: "Not mosque." },
    { text: "The stadium." },
    { text: "Where 60,000 people believed in the same thing." },
    { text: "Where her father became a child again." },
    { text: "Where she became infinite." },
    { text: "He'd lift her up." },
    { text: "And from up there," },
    { text: "on his shoulders," },
    { text: "she could see everything." },
    { text: "The field." },
    { text: "The flags." },
    { text: "The whole world below." },
    { text: "And she knew," },
  ],
};
