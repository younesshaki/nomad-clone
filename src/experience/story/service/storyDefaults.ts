import { getFirstSceneId, storyManifest } from "../manifest";
import type {
  StoryAchievement,
  StoryCheckpoint,
  StoryChoice,
  StoryFlag,
  StoryPreferences,
  StoryState,
} from "../types";

export const STORAGE_KEY = "nomad.story-state.v1";
export const STORY_STATE_VERSION = 1;
export const CONTENT_VERSION = "v1";

export const now = () => new Date().toISOString();

export const getDefaultState = (): StoryState => {
  const firstPart = storyManifest[0];
  const firstChapter = firstPart.chapters[0];

  return {
    version: STORY_STATE_VERSION,
    currentPartId: firstPart.id,
    currentChapterId: firstChapter.id,
    currentSceneId: getFirstSceneId(firstChapter),
    visitedSceneIds: [],
    completedSceneIds: [],
    completedChapterIds: [],
    flags: {},
    choices: [],
    achievements: {},
    preferences: {
      soundEnabled: true,
    },
    resumeCheckpoint: null,
    updatedAt: now(),
  };
};

const sanitizePreferences = (
  preferences: Partial<StoryPreferences> | undefined
): StoryPreferences => ({
  soundEnabled: preferences?.soundEnabled ?? true,
});

const sanitizeFlags = (flags: Record<string, StoryFlag> | undefined) =>
  flags ?? {};

const sanitizeChoices = (choices: StoryChoice[] | undefined) => choices ?? [];

const sanitizeAchievements = (
  achievements: Record<string, StoryAchievement> | undefined
) => achievements ?? {};

const sanitizeCheckpoint = (
  checkpoint: StoryCheckpoint | null | undefined
) => {
  if (!checkpoint) {
    return null;
  }

  return {
    partId: checkpoint.partId,
    chapterId: checkpoint.chapterId,
    sceneId: checkpoint.sceneId ?? null,
    progress: checkpoint.progress ?? 0,
    payload: checkpoint.payload,
    savedAt: checkpoint.savedAt ?? now(),
  };
};

export const normalizeState = (
  state: Partial<StoryState> | null | undefined
): StoryState => {
  const base = getDefaultState();
  const nextState = state ?? {};

  return {
    ...base,
    ...nextState,
    version: STORY_STATE_VERSION,
    currentSceneId:
      nextState.currentSceneId ??
      nextState.resumeCheckpoint?.sceneId ??
      base.currentSceneId,
    visitedSceneIds: nextState.visitedSceneIds ?? base.visitedSceneIds,
    completedSceneIds: nextState.completedSceneIds ?? base.completedSceneIds,
    completedChapterIds:
      nextState.completedChapterIds ?? base.completedChapterIds,
    flags: sanitizeFlags(nextState.flags),
    choices: sanitizeChoices(nextState.choices),
    achievements: sanitizeAchievements(nextState.achievements),
    preferences: sanitizePreferences(nextState.preferences),
    resumeCheckpoint: sanitizeCheckpoint(nextState.resumeCheckpoint),
    updatedAt: nextState.updatedAt ?? now(),
  };
};

/**
 * Read local storage state if present.
 * Returns null if not available or parse fails.
 */
export const readLocalStateIfPresent = (): StoryState | null => {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return normalizeState(JSON.parse(raw) as Partial<StoryState>);
  } catch {
    return null;
  }
};
