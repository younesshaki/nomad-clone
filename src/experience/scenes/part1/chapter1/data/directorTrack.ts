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
      duration: 38, // 0:00-0:30 script + extended last line hold
      lineStart: 3, // 3 second black screen before text starts
      tailHold: 30, // Extended hold on last line before scene fades
      pauses: [{ afterLine: 9, duration: 3 }], // 3-second pause after "he would always come back."
      audioUrl: chapter1VoiceOvers["scene-1"],
      audioGroup: "act-1",
    },
    {
      sceneId: "scene-2a",
      duration: 65, // 10 lines × ~5s + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 17,
      audioUrl: chapter1VoiceOvers["scene-2a"],
      audioGroup: "act-2a",
    },
    {
      sceneId: "scene-2b",
      duration: 65, // 10 lines × ~5s + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 1,
      audioUrl: chapter1VoiceOvers["scene-2b"],
      audioGroup: "act-2b",
    },
    {
      sceneId: "scene-3a",
      duration: 85, // 14 lines × ~5s + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 1.5,
      audioUrl: chapter1VoiceOvers["scene-3"],
      audioGroup: "act-3",
    },
    {
      sceneId: "scene-3b",
      duration: 88, // 14 lines × ~5s + pause + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 2,
      pauses: [{ afterLine: 10, duration: 2.5 }],
      audioGroup: "act-3",
    },
    {
      sceneId: "scene-4a",
      duration: 90, // 15 lines × ~5s + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 1.5,
      audioUrl: chapter1VoiceOvers["scene-4"],
      audioGroup: "act-4",
    },
    {
      sceneId: "scene-4b",
      duration: 80, // 12 lines × ~5s + pause + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 2,
      pauses: [{ afterLine: 8, duration: 5 }],
      audioGroup: "act-4",
    },
    {
      sceneId: "scene-5",
      duration: 60, // 8 lines × ~5s + pause + 2 extra for last line hold
      lineStart: 0.6,
      tailHold: 2,
      pauses: [{ afterLine: 3, duration: 5 }],
      audioUrl: chapter1VoiceOvers["scene-5"],
      audioGroup: "act-5",
    },
  ],
};
