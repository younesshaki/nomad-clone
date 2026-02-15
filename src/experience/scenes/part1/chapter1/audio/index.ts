import scene1Url from "../scenes/scene-1/voiceover/scene 1 v1.mp3?url";
import scene2aUrl from "../scenes/scene-2a/voiceover/ElevenLabs_2026-02-04T15_54_59_Bill - Wise, Mature, Balanced_pre_sp92_s50_sb81_v3.mp3?url";
import scene2bUrl from "../scenes/scene-2b/voiceover/scene 2b VO V1.mp3?url";
import scene3aUrl from "../scenes/scene-3a/voiceover/ElevenLabs_2026-02-05T16_42_39_Bill - Wise, Mature, Balanced_pre_sp92_s50_sb81_v3.mp3?url";
import scene3bUrl from "../scenes/scene-3b/voiceover/ElevenLabs_2026-02-05T20_23_19_Bill - Wise, Mature, Balanced_pre_sp92_s50_sb81_v3.mp3?url";
import scene4aUrl from "../scenes/scene-4a/voiceover/ElevenLabs_2026-02-05T22_24_20_Bill - Wise, Mature, Balanced_pre_sp92_s50_sb81_v3.mp3?url";
import scene4bUrl from "../scenes/scene-4b/voiceover/ElevenLabs_2026-02-06T13_10_29_Bill - Wise, Mature, Balanced_pre_sp92_s50_sb81_v3.mp3?url";

export type Chapter1VoiceOverKey =
  | "scene-1"
  | "scene-2a"
  | "scene-2b"
  | "scene-3"
  | "scene-3a"
  | "scene-3b"
  | "scene-4"
  | "scene-4a"
  | "scene-4b"
  | "scene-5";

// Drop your voice-over files in this folder and wire them here.
export const chapter1VoiceOvers: Record<Chapter1VoiceOverKey, string | null> = {
  "scene-1": scene1Url,
  "scene-2a": scene2aUrl,
  "scene-2b": scene2bUrl,
  "scene-3": scene3aUrl,
  "scene-3a": scene3aUrl,
  "scene-3b": scene3bUrl,
  "scene-4": scene4aUrl,
  "scene-4a": scene4aUrl,
  "scene-4b": scene4bUrl,
  "scene-5": null,
};
