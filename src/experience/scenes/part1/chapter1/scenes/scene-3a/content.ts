import type { NarrativeScene } from "../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

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
