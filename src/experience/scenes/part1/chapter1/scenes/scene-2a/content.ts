import type { NarrativeScene } from "../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

export const scene2a: NarrativeScene = {
  id: "scene-2a",
  title: "The Rebellion",
  voiceOver: chapter1VoiceOvers["scene-2"],
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
