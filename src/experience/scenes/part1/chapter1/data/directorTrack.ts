import { chapter1VoiceOvers } from "../audio";

export type Chapter1DirectorAct = {
  sceneId: string;
  duration: number;
  lineStart?: number;
  tailHold?: number;
  pauses?: Array<{ afterLine: number; duration: number }>;
  audioUrl?: string | null;
  audioGroup?: string;
};

export type Chapter1DirectorTrack = {
  autoAdvanceSeconds: number;
  fadeDuration: number;
  acts: Chapter1DirectorAct[];
};

export const chapter1DirectorTrack: Chapter1DirectorTrack = {
  autoAdvanceSeconds: 6,
  fadeDuration: 1.1,
  acts: [
    {
      sceneId: "scene-1",
      duration: 30,
      lineStart: 3,
      tailHold: 2,
      pauses: [{ afterLine: 9, duration: 3 }],
      audioUrl: chapter1VoiceOvers["scene-1"],
      audioGroup: "act-1",
    },
    {
      sceneId: "scene-2a",
      duration: 38,
      lineStart: 0.6,
      tailHold: 1.5,
      audioUrl: chapter1VoiceOvers["scene-2"],
      audioGroup: "act-2",
    },
    {
      sceneId: "scene-2b",
      duration: 37,
      lineStart: 0.6,
      tailHold: 2,
      audioGroup: "act-2",
    },
    {
      sceneId: "scene-3a",
      duration: 30,
      lineStart: 0.6,
      tailHold: 1.5,
      audioUrl: chapter1VoiceOvers["scene-3"],
      audioGroup: "act-3",
    },
    {
      sceneId: "scene-3b",
      duration: 30,
      lineStart: 0.6,
      tailHold: 2,
      pauses: [{ afterLine: 10, duration: 2.5 }],
      audioGroup: "act-3",
    },
    {
      sceneId: "scene-4a",
      duration: 38,
      lineStart: 0.6,
      tailHold: 1.5,
      audioUrl: chapter1VoiceOvers["scene-4"],
      audioGroup: "act-4",
    },
    {
      sceneId: "scene-4b",
      duration: 37,
      lineStart: 0.6,
      tailHold: 2,
      pauses: [{ afterLine: 8, duration: 5 }],
      audioGroup: "act-4",
    },
    {
      sceneId: "scene-5",
      duration: 30,
      lineStart: 0.6,
      tailHold: 2,
      pauses: [{ afterLine: 3, duration: 5 }],
      audioUrl: chapter1VoiceOvers["scene-5"],
      audioGroup: "act-5",
    },
  ],
};
