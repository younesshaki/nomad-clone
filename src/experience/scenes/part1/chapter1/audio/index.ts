import scene1Url from "./first VO.mp3?url";

export type Chapter1VoiceOverKey =
  | "scene-1"
  | "scene-2"
  | "scene-3"
  | "scene-4"
  | "scene-5";

// Drop your voice-over files in this folder and wire them here.
export const chapter1VoiceOvers: Record<Chapter1VoiceOverKey, string | null> = {
  "scene-1": scene1Url,
  "scene-2": null,
  "scene-3": null,
  "scene-4": null,
  "scene-5": null,
};
