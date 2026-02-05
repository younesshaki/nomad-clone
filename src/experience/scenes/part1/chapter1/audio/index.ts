import scene1Url from "../scenes/scene-1/voiceover/scene 1 v1.mp3?url";
import scene2aUrl from "../scenes/scene-2a/voiceover/ElevenLabs_2026-02-04T15_54_59_Bill - Wise, Mature, Balanced_pre_sp92_s50_sb81_v3.mp3?url";
import scene2bUrl from "../scenes/scene-2b/voiceover/scene 2b VO V1.mp3?url";

export type Chapter1VoiceOverKey =
  | "scene-1"
  | "scene-2a"
  | "scene-2b"
  | "scene-3"
  | "scene-4"
  | "scene-5";

// Drop your voice-over files in this folder and wire them here.
export const chapter1VoiceOvers: Record<Chapter1VoiceOverKey, string | null> = {
  "scene-1": scene1Url,
  "scene-2a": scene2aUrl,
  "scene-2b": scene2bUrl,
  "scene-3": null,
  "scene-4": null,
  "scene-5": null,
};
