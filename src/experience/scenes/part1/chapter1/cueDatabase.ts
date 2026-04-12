/**
 * cueDatabase.ts
 *
 * Central registry of all cue data for Chapter 1 scenes.
 * Used by SyncPreviewPanel to render and edit the visual sync timeline.
 *
 * To add timing to a scene: add startTime/endTime to lines in its content.ts.
 * To add a new scene's media cues: import them below and add an entry.
 */

import type { NarrativeLine } from "../../shared/narrativeTypes";
import { chapter1Scenes } from "./data";
import { scene2aImageCues } from "./scenes/scene-2a/content";
import { scene2bImageCues } from "./scenes/scene-2b/content";
import { scene3aImageCues } from "./scenes/scene-3a/content";
import { scene3bImageCues } from "./scenes/scene-3b/content";
import { scene4aImageCues, scene4aVideoCue } from "./scenes/scene-4a/content";

// ─── Shared cue types ─────────────────────────────────────────────────────────

export type TextCue = {
  lineIndex: number;
  text: string;
  startTime: number;
  endTime: number;
};

export type GenericImageCue = {
  image: string;
  startTime: number;
  endTime: number;
  description?: string;
};

export type GenericVideoCue = {
  video: string;
  startTime: number;
  endTime: number;
  description?: string;
};

export type SceneCueData = {
  sceneId: string;
  /** Expected VO duration in seconds */
  voDuration: number;
  /** Every text line in the scene (timed or not) */
  allLines: NarrativeLine[];
  /** Only lines that have startTime defined */
  textCues: TextCue[];
  imageCues: GenericImageCue[];
  videoCues: GenericVideoCue[];
};

// ─── Helper: build a sceneId → allLines lookup from chapter1Scenes ────────────

const linesByScene: Record<string, NarrativeLine[]> = {};
for (const scene of chapter1Scenes) {
  if ("lines" in scene && scene.lines) {
    linesByScene[scene.id] = scene.lines;
  } else if ("columns" in scene) {
    linesByScene[scene.id] = [
      ...scene.columns.left,
      ...scene.columns.right,
      ...(scene.mergeLines ?? []),
    ];
  }
}

// ─── Helper: derive TextCues from a NarrativeLine array ───────────────────────

function textCuesFromLines(lines: NarrativeLine[]): TextCue[] {
  return lines
    .map((line, i): TextCue | null => {
      if (line.startTime === undefined) return null;
      return {
        lineIndex: i,
        text: line.text,
        startTime: line.startTime,
        endTime: line.endTime ?? line.startTime + 3,
      };
    })
    .filter((c): c is TextCue => c !== null);
}

// ─── Per-scene cue data ────────────────────────────────────────────────────────

function makeEntry(
  sceneId: string,
  voDuration: number,
  imageCues: GenericImageCue[] = [],
  videoCues: GenericVideoCue[] = [],
): SceneCueData {
  const allLines = linesByScene[sceneId] ?? [];
  return {
    sceneId,
    voDuration,
    allLines,
    textCues: textCuesFromLines(allLines),
    imageCues,
    videoCues,
  };
}

// ─── Exported lookup map ──────────────────────────────────────────────────────

export const CHAPTER1_CUES: Record<string, SceneCueData> = {
  "scene-1":  makeEntry("scene-1",  29),
  "scene-2a": makeEntry("scene-2a", 20, scene2aImageCues),
  "scene-2b": makeEntry("scene-2b", 22, scene2bImageCues),
  "scene-3a": makeEntry("scene-3a", 35, scene3aImageCues),
  "scene-3b": makeEntry("scene-3b", 45, scene3bImageCues),
  "scene-4a": makeEntry("scene-4a", 30, scene4aImageCues, [scene4aVideoCue]),
  "scene-4b": makeEntry("scene-4b", 80),
  "scene-5":  makeEntry("scene-5",  60),
};
