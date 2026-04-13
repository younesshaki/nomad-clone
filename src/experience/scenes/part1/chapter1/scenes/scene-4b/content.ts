import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

export const scene4b: NarrativeScene = {
  id: "scene-4b",
  title: "The Ritual",
  voiceOver: chapter1VoiceOvers["scene-4b"],
  mode: "2d",
  lines: [
    { text: "the way only children know," },
    { text: "that she was safe." },
    { text: "Sometimes he'd leave for a moment." },
    { text: "To get food." },
    { text: "To find the bathroom." },
    { text: "To talk to a friend." },
    { text: "And he'd always say the same thing:" },
    { text: "\"Wait for me. I'll be right back.\"" },
    { text: "And he always was." },
    { text: "Always." },
    { text: "Every single time." },
    { text: "Until the time he wasn't." },
  ],
};
