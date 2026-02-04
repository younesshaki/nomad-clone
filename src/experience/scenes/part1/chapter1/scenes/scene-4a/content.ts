import type { NarrativeScene } from "../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

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
