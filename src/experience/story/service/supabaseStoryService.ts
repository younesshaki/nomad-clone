import { supabase } from "../../../lib/supabase";
import {
  CONTENT_VERSION,
  STORAGE_KEY,
  STORY_STATE_VERSION,
  getDefaultState,
  normalizeState,
  now,
  readLocalStateIfPresent,
} from "./storyDefaults";
import type {
  StoryCheckpoint,
  StoryChoice,
  StoryPreferences,
  StoryProgressPayload,
  StoryService,
  StoryState,
} from "../types";

/* ─── DB row <-> StoryState mapping ─── */

type DbRow = Record<string, unknown>;

function toDbRow(state: StoryState, userId: string): DbRow {
  return {
    user_id: userId,
    version: STORY_STATE_VERSION,
    content_version: CONTENT_VERSION,
    current_part_id: state.currentPartId,
    current_chapter_id: state.currentChapterId,
    current_scene_id: state.currentSceneId,
    visited_scene_ids: state.visitedSceneIds,
    completed_scene_ids: state.completedSceneIds,
    completed_chapter_ids: state.completedChapterIds,
    flags: state.flags,
    choices: state.choices,
    achievements: state.achievements,
    preferences: state.preferences,
    resume_checkpoint: state.resumeCheckpoint,
    updated_at: state.updatedAt,
  };
}

function fromDbRow(row: DbRow): StoryState {
  return normalizeState({
    version: (row.version as number) ?? STORY_STATE_VERSION,
    currentPartId: (row.current_part_id as string) ?? undefined,
    currentChapterId: (row.current_chapter_id as string) ?? undefined,
    currentSceneId: (row.current_scene_id as string | null) ?? null,
    visitedSceneIds: (row.visited_scene_ids as string[]) ?? [],
    completedSceneIds: (row.completed_scene_ids as string[]) ?? [],
    completedChapterIds: (row.completed_chapter_ids as string[]) ?? [],
    flags: (row.flags as StoryState["flags"]) ?? {},
    choices: (row.choices as StoryState["choices"]) ?? [],
    achievements: (row.achievements as StoryState["achievements"]) ?? {},
    preferences: (row.preferences as StoryState["preferences"]) ?? undefined,
    resumeCheckpoint:
      (row.resume_checkpoint as StoryState["resumeCheckpoint"]) ?? null,
    updatedAt: (row.updated_at as string) ?? undefined,
  });
}

/**
 * Choose the newer of two states by updatedAt.
 * If one is null, returns the other.
 * If both null, returns null.
 */
function chooseNewestState(
  a: StoryState | null,
  b: StoryState | null
): StoryState | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;

  const aTime = new Date(a.updatedAt).getTime();
  const bTime = new Date(b.updatedAt).getTime();
  return bTime > aTime ? b : a;
}

/* ─── Service implementation ─── */

class SupabaseStoryService implements StoryService {
  private state: StoryState = getDefaultState();
  private listeners = new Set<(state: StoryState) => void>();
  private userId: string | null = null;

  getState(): StoryState {
    return this.state;
  }

  async loadState(): Promise<StoryState> {
    // 1. Ensure session
    await this.ensureSession();

    if (!this.userId) {
      // Auth failed — return default state. Provider will handle fallback.
      this.state = getDefaultState();
      return this.state;
    }

    // 2. Fetch backend state
    let dbState: StoryState | null = null;
    try {
      const { data, error } = await supabase
        .from("story_states")
        .select("*")
        .eq("user_id", this.userId)
        .maybeSingle();

      if (error) {
        console.warn("[supabase-story] Failed to fetch state:", error.message);
      } else if (data) {
        dbState = fromDbRow(data as DbRow);
      }
    } catch (err) {
      console.warn("[supabase-story] Fetch error:", err);
    }

    // 3. Read local state for migration
    const localState = readLocalStateIfPresent();

    // 4. Choose newest
    const chosenState =
      chooseNewestState(dbState, localState) ?? getDefaultState();

    // 5. Persist chosen state to backend
    try {
      await supabase
        .from("story_states")
        .upsert(toDbRow(chosenState, this.userId), {
          onConflict: "user_id",
        });
    } catch (err) {
      console.warn("[supabase-story] Upsert after migration failed:", err);
    }

    this.state = chosenState;
    this.notify();
    return this.state;
  }

  subscribe(listener: (state: StoryState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async setCurrentLocation(
    partId: string,
    chapterId: string,
    sceneId: string | null = null
  ): Promise<StoryState> {
    return this.commit((state) => ({
      ...state,
      currentPartId: partId,
      currentChapterId: chapterId,
      currentSceneId: sceneId,
    }));
  }

  async saveCheckpoint(
    partId: string,
    chapterId: string,
    sceneId: string | null,
    progress: number,
    payload?: StoryProgressPayload
  ): Promise<StoryState> {
    const checkpoint: StoryCheckpoint = {
      partId,
      chapterId,
      sceneId,
      progress,
      payload,
      savedAt: now(),
    };

    return this.commit((state) => ({
      ...state,
      currentPartId: partId,
      currentChapterId: chapterId,
      currentSceneId: sceneId,
      resumeCheckpoint: checkpoint,
    }));
  }

  async recordChoice(
    sceneId: string,
    choiceId: string,
    payload?: StoryProgressPayload
  ): Promise<StoryState> {
    const nextChoice: StoryChoice = {
      sceneId,
      choiceId,
      payload,
      recordedAt: now(),
    };

    return this.commit((state) => ({
      ...state,
      choices: [
        ...state.choices.filter(
          (existing) =>
            !(existing.sceneId === sceneId && existing.choiceId === choiceId)
        ),
        nextChoice,
      ],
    }));
  }

  async unlockFlag(flagKey: string, sourceId?: string): Promise<StoryState> {
    return this.commit((state) => ({
      ...state,
      flags: {
        ...state.flags,
        [flagKey]: {
          key: flagKey,
          value: true,
          sourceId,
          updatedAt: now(),
        },
      },
    }));
  }

  async completeScene(sceneId: string): Promise<StoryState> {
    return this.commit((state) => ({
      ...state,
      visitedSceneIds: Array.from(
        new Set([...state.visitedSceneIds, sceneId])
      ),
      completedSceneIds: Array.from(
        new Set([...state.completedSceneIds, sceneId])
      ),
      currentSceneId: sceneId,
    }));
  }

  async completeChapter(chapterId: string): Promise<StoryState> {
    return this.commit((state) => ({
      ...state,
      completedChapterIds: Array.from(
        new Set([...state.completedChapterIds, chapterId])
      ),
    }));
  }

  async updatePreferences(
    preferences: Partial<StoryPreferences>
  ): Promise<StoryState> {
    return this.commit((state) => ({
      ...state,
      preferences: {
        ...state.preferences,
        ...preferences,
      },
    }));
  }

  async resetState(): Promise<StoryState> {
    this.state = getDefaultState();
    this.notify();
    await this.persistToSupabase();
    return this.state;
  }

  /* ─── Private ─── */

  private async ensureSession(): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        this.userId = session.user.id;
        return;
      }

      // Create anonymous session
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn("[supabase-story] Anonymous sign-in failed:", error.message);
        this.userId = null;
        return;
      }

      this.userId = data.user?.id ?? null;
    } catch (err) {
      console.warn("[supabase-story] Auth error:", err);
      this.userId = null;
    }
  }

  private async commit(
    updater: (state: StoryState) => StoryState
  ): Promise<StoryState> {
    this.state = {
      ...updater(this.state),
      updatedAt: now(),
    };

    // Optimistic: notify listeners immediately
    this.notify();

    // Persist to backend (fire-and-forget, non-blocking)
    this.persistToSupabase();

    // Also persist to localStorage as a resilient cache
    this.persistToLocal();

    return this.state;
  }

  private async persistToSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from("story_states")
        .upsert(toDbRow(this.state, this.userId), {
          onConflict: "user_id",
        });

      if (error) {
        console.warn("[supabase-story] Persist failed:", error.message);
      }
    } catch (err) {
      console.warn("[supabase-story] Persist error:", err);
    }
  }

  private persistToLocal(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // localStorage full or unavailable — acceptable
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const supabaseStoryService = new SupabaseStoryService();
