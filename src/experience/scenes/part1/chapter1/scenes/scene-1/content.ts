import type { NarrativeScene } from "../../../shared/narrativeTypes";
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
    { text: "She doesn't remember the exact day." },
    { text: "Memory is like that." },
    { text: "It smooths the edges." },
    { text: "Paints everything gold." },
    { text: "But she remembers this:" },
    { text: "There was a time when the world felt... safe." },
    { text: "When rules were just puzzles to solve." },
    { text: "When love was louder than fear." },
    { text: "When her father's voice meant" },
    { text: "he would always come back." },
    { text: "This is that time." },
    { text: "Before the fall." },
  ],
};
