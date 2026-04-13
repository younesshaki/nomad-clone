import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

export const scene5: NarrativeScene = {
  id: "scene-5",
  title: "The Crack",
  voiceOver: chapter1VoiceOvers["scene-5"],
  mode: "2d",
  lines: [
    { text: "Memory is a liar." },
    { text: "It tells you the good times lasted forever." },
    { text: "It hides the cracks" },
    { text: "until you're ready to see them." },
    { text: "She wasn't ready." },
    { text: "But the fall doesn't wait for you to be ready." },
    { text: "CHAPTER 1", className: "final-line" },
    { text: "BEFORE THE FALL", className: "final-line" },
  ],
};
