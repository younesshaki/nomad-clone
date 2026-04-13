import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

// Background images for scene-3a slideshow
import bg1 from "./media/ChatGPT Image 5 févr. 2026, 03_42_05.png";
import bg2 from "./media/ChatGPT Image 5 févr. 2026, 03_53_19.png";
import bg3 from "./media/ChatGPT Image 5 févr. 2026, 04_02_40.png";

export const scene3aBackgroundImages = [bg1, bg2, bg3];

// Time-based image cues synced to voiceover
export type ImageCue = {
  image: string;
  startTime: number;
  endTime: number;
  description?: string;
};

// Adjust these timestamps after listening to the VO
export const scene3aImageCues: ImageCue[] = [
  {
    image: bg1,
    startTime: 0,
    endTime: 10,
    description: "Her mother didn't build a business. She built an empire."
  },
  {
    image: bg2,
    startTime: 10,
    endTime: 20,
    description: "Sharp mind. Sharper hands. The kind of woman who sacrificed..."
  },
  {
    image: bg3,
    startTime: 20,
    endTime: 35,
    description: "Her father was the sun. They worked. They provided."
  },
];

export const scene3a: NarrativeScene = {
  id: "scene-3a",
  title: "The Empire",
  voiceOver: chapter1VoiceOvers["scene-3"],
  mode: "2d",
  lines: [
    { text: "Her mother didn't build a business." },
    { text: "She built an empire." },
    { text: "One dress at a time." },
    { text: "One customer at a time." },
    { text: "Sharp mind." },
    { text: "Sharper hands." },
    { text: "The kind of woman who sacrificed the world" },
    { text: "to make a different world." },
    { text: "Her father was the sun." },
    { text: "That's how she saw him." },
    { text: "The center of everything." },
    { text: "The reason things grew." },
    { text: "They worked." },
    { text: "They provided." },
  ],
};
