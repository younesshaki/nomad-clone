import type { NarrativeScene } from "../../../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "../../audio";

// Background images for scene-3b slideshow (in order)
import bg1 from "./media/Stunning_dynamic_freeze-frame_action_photograph_of-1770299635887.png";
import bg2 from "./media/Beautiful_cinematic_wide_shot_of_7-year-old_Morocc-1770299900367.png";
import bg3 from "./media/Beautiful_cinematic_still_life_composition_featuri-1770300460864.png";
import bg4 from "./media/Stunning_wide_cinematic_establishing_shot_of_beaut-1770301836927.png";
import bg5 from "./media/Beautiful_intimate_close-up_still_life_featuring_b-1770309344726.png";
import bg6 from "./media/Beautiful_cinematic_overhead_birds_eye_view_direc-1770309693964.png";

export const scene3bBackgroundImages = [bg1, bg2, bg3, bg4, bg5, bg6];

// Time-based image cues synced to voiceover
export type ImageCue = {
  image: string;
  startTime: number;
  endTime: number;
  description?: string;
};

// Adjust these timestamps after listening to the VO
// Scene 3b has 14 lines - approximately 35-40 seconds
export const scene3bImageCues: ImageCue[] = [
  {
    image: bg1,
    startTime: 0,
    endTime: 6,
    description: "They made sure she had everything. Taekwondo."
  },
  {
    image: bg2,
    startTime: 6,
    endTime: 12,
    description: "Football. Bikes that appeared like magic."
  },
  {
    image: bg3,
    startTime: 12,
    endTime: 18,
    description: "Summers at Sidi Rahal where the whole family gathered"
  },
  {
    image: bg4,
    startTime: 18,
    endTime: 26,
    description: "and the world felt... complete. She was spoiled."
  },
  {
    image: bg5,
    startTime: 26,
    endTime: 34,
    description: "But not with things. With the belief that this was how life would always be."
  },
  {
    image: bg6,
    startTime: 34,
    endTime: 45,
    description: "Protected. Provided for. Permanent."
  },
];

export const scene3b: NarrativeScene = {
  id: "scene-3b",
  title: "The Empire",
  voiceOver: chapter1VoiceOvers["scene-3b"],
  mode: "2d",
  lines: [
    { text: "They made sure she had everything." },
    { text: "Taekwondo." },
    { text: "Football." },
    { text: "Bikes that appeared like magic." },
    { text: "Summers at Sidi Rahal" },
    { text: "where the whole family gathered" },
    { text: "and the world felt... complete." },
    { text: "She was spoiled." },
    { text: "But not with things." },
    { text: "With the belief" },
    { text: "that this was how life would always be." },
    { text: "Protected." },
    { text: "Provided for." },
    { text: "Permanent." },
  ],
};
