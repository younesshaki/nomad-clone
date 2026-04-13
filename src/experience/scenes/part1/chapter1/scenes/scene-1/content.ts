import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

// Background images for scene-1 slideshow
import bg1 from "./media/Stunning_aerial_perspective_overlooking_modern_Cas-1770031478160.png";
import bg2 from "./media/Magnificent_high_aerial_view_overlooking_the_entir-1770031501576.png";
import bg3 from "./media/Magnificent_high_aerial_view_overlooking_the_entir-1770031529907.png";

export const scene1BackgroundImages = [bg1, bg2, bg3];

export const scene1: NarrativeScene = {
  id: "scene-1",
  title: "The Memory",
  voiceOver: chapter1VoiceOvers["scene-1"],
  mode: "2d",
  lines: [
    { text: "She doesn't remember the exact day.", startTime: 0 },
    { text: "Memory is like that.", startTime: 3.5 },
    { text: "It smooths the edges.", startTime: 6.1 },
    { text: "Paints everything gold.", startTime: 8.4 },
    { text: "But she remembers this:", startTime: 10.9 },
    { text: "There was a time when the world felt... safe.", startTime: 12.6 },
    { text: "When rules were just puzzles to solve.", startTime: 16.4 },
    { text: "When love was louder than fear.", startTime: 19 },
    { text: "When her father's voice meant", startTime: 22.1 },
    { text: "he would always come back.", startTime: 24.2 },
    { text: "This is that time.", startTime: 25.8 },
    { text: "Before the fall.", startTime: 27.6 },
  ],
};
