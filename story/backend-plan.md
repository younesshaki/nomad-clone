# Backend Plan - Story Progress and User State

**Project:** Nomad (working title: *Life of Majdoline*)  
**Author:** Youness  
**Purpose:** Technical specification for adding a backend to the story homepage and experience. Another developer should be able to read this and implement it without prior context.

---

## 0. Revision Notes

This revised version keeps the same backend direction as the original plan, but corrects a few assumptions so the implementation better matches the current repo:

- Backend integration should not be described as a literal "one-line swap." The component layer should remain unchanged, but the provider and service boot path still need real work.
- Supabase failure must not block the story. If backend initialization fails, the app should fall back to the local story service and remain usable.
- Migration from localStorage to Supabase should compare timestamps, not just "empty vs non-empty" backend state.
- Story/content versioning should be explicit so stale checkpoints can be handled safely as the narrative evolves.
- Anonymous auth is still the recommended V1 default, but true cross-device continuity only exists when the viewer uses the same Supabase identity on both devices.

These revisions are reflected throughout the plan below.

---

## 1. What We Are Building

A persistent, cross-device backend for viewer progress through the cinematic story experience. The homepage already reads chapter unlock states, resume position, and completion progress, but currently from localStorage only, meaning progress is lost when the browser is cleared and does not carry across devices.

The backend will:

- persist story progress per viewer
- enable the homepage to show real, durable progress state
- lay the foundation for unlockables: memories, letters, achievements
- avoid requiring homepage or experience component rewrites

---

## 2. Architecture Principle

The frontend is already shaped correctly for this approach.

There is a `StoryService` interface in:

```txt
src/experience/story/types.ts
```

The current implementation is:

```txt
src/experience/story/service/localStoryService.ts
```

The provider that wires the service into React is:

```txt
src/experience/story/StoryProvider.tsx
```

`StoryProvider` consumes a `StoryService` by interface, not by concrete implementation. That means backend integration can happen at the service/provider layer without changing homepage or experience components.

Important clarification:

- This is **not** literally a one-line change.
- It **is** a contained refactor limited to the service/provider layer.

What should remain unchanged:

- homepage components
- experience components
- selectors
- CSS

What will change:

- a new backend service file
- a new Supabase client file
- a small provider update so readiness reflects auth + data load
- migration logic
- fallback logic

---

## 3. Recommended Stack

**Supabase** - PostgreSQL database + Auth + Realtime in one hosted platform.

Why it fits this project:

- free tier is enough for V1
- Auth supports anonymous sessions
- Row-Level Security (RLS) ensures each viewer only reads and writes their own state
- the JS client (`@supabase/supabase-js`) is straightforward
- Realtime could support cross-tab or cross-device sync later

---

## 4. Auth Strategy

### Recommendation: Anonymous-First, Optional Upgrade

The viewer should not hit a sign-up wall before experiencing the story.

Flow:

```txt
1. Viewer lands on PreloadGate
2. Clicks Play -> Homepage loads
3. App silently creates an anonymous Supabase session
4. All progress is saved under that anonymous user ID
5. Optional later upgrade:
   - viewer can claim the account with email or Google
   - progress continues under that identity
```

This means:

- first-time visitors get persistence immediately
- returning visitors on the same browser auto-resume
- same-browser continuity works without friction

Important clarification:

- anonymous auth alone is not full cross-device continuity
- true multi-device continuity requires the same Supabase identity on both devices
- that means account claiming or sign-in comes later if multi-device sync becomes important

### Auth State in the App

`StoryProvider.tsx` should wait for the Supabase session to resolve before loading story state.

The existing `isReady` flag should mean:

- auth resolved
- active service chosen
- initial state loaded

If backend auth or fetch fails, the app should:

1. fall back to `localStoryService`
2. still resolve `isReady`
3. remain usable

Backend should enhance persistence, not become a single point of failure.

---

## 5. Database Schema

### Table: `story_states`

One row per user. This is the source of truth for viewer progress.

```sql
create table story_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Backend schema version
  version integer not null default 1,

  -- Story/content compatibility version
  content_version text not null default 'v1',

  -- Current location
  current_part_id text not null default 'part-1',
  current_chapter_id text not null default 'part-1-chapter-1',
  current_scene_id text,

  -- Progress arrays
  visited_scene_ids text[] not null default '{}',
  completed_scene_ids text[] not null default '{}',
  completed_chapter_ids text[] not null default '{}',

  -- Flexible story state
  flags jsonb not null default '{}',
  choices jsonb not null default '[]',
  achievements jsonb not null default '{}',
  preferences jsonb not null default '{"soundEnabled": true}',

  -- Resume pointer
  resume_checkpoint jsonb,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id)
);
```

### Notes on `version` and `content_version`

- `version` tracks backend schema evolution
- `content_version` tracks story/runtime compatibility

This matters because checkpoint payloads and resume behavior may change as the story evolves. Future code can use `content_version` to normalize or invalidate stale checkpoints safely.

### Row-Level Security (RLS)

```sql
alter table story_states enable row level security;

create policy "viewer reads own state"
  on story_states for select
  using (auth.uid() = user_id);

create policy "viewer writes own state"
  on story_states for insert
  with check (auth.uid() = user_id);

create policy "viewer updates own state"
  on story_states for update
  using (auth.uid() = user_id);
```

This keeps authorization enforced at the database layer.

### Optional Future Table: `story_events`

For analytics or audit-style event tracking later:

```sql
create table story_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  recorded_at timestamptz not null default now()
);
```

This is not required for the homepage backend in V1.

---

## 6. New Service File

Create:

```txt
src/experience/story/service/supabaseStoryService.ts
```

This file should implement the existing `StoryService` interface from `types.ts`.

Current interface:

```ts
interface StoryService {
  getState(): StoryState;
  loadState(): Promise<StoryState>;
  subscribe(listener: (state: StoryState) => void): () => void;
  setCurrentLocation(partId, chapterId, sceneId?): Promise<StoryState>;
  saveCheckpoint(partId, chapterId, sceneId, progress, payload?): Promise<StoryState>;
  recordChoice(sceneId, choiceId, payload?): Promise<StoryState>;
  unlockFlag(flagKey, sourceId?): Promise<StoryState>;
  completeScene(sceneId): Promise<StoryState>;
  completeChapter(chapterId): Promise<StoryState>;
  updatePreferences(preferences): Promise<StoryState>;
  resetState(): Promise<StoryState>;
}
```

### Implementation Pattern

```ts
class SupabaseStoryService implements StoryService {
  private state: StoryState = getDefaultState();
  private listeners = new Set<(state: StoryState) => void>();

  async loadState(): Promise<StoryState> {
    await ensureSession();

    const dbRow = await fetchStateRow();
    const localState = readLocalStateIfPresent();

    const chosenState = chooseState(dbRow, localState);

    this.state = chosenState;
    this.notify();
    return this.state;
  }

  private async commit(updater: (state: StoryState) => StoryState): Promise<StoryState> {
    this.state = {
      ...updater(this.state),
      updatedAt: now(),
    };

    this.notify();

    try {
      await persistToSupabase(this.state);
    } catch (error) {
      // log in development, keep app usable
    }

    return this.state;
  }
}
```

### Required Helpers

- `toDbRow(state: StoryState)` - camelCase to snake_case
- `fromDbRow(row)` - snake_case to camelCase
- `getDefaultState()`
- `normalizeState()`
- `readLocalStateIfPresent()`
- `chooseState(dbState, localState)` using `updatedAt`

Important:

- `normalizeState()` should be shared with the local service path, not reimplemented differently
- backend and local services must produce the same `StoryState` shape

### Error Handling Requirement

The backend service must tolerate failure.

Minimum expected behavior:

- optimistic local state update is acceptable
- failed persistence is caught
- errors are logged clearly in development
- the story remains usable

Preferred V1 behavior:

- keep in-memory state even if persistence fails
- try again on later commits naturally
- do not block viewer progress on transient backend failure

---

## 7. StoryProvider Change

`StoryProvider.tsx` should no longer assume that one concrete service always succeeds.

Recommended behavior:

1. choose backend service if `VITE_USE_BACKEND === "true"`
2. attempt backend `loadState()`
3. if backend init fails, switch to `localStoryService`
4. subscribe to the active service
5. set `isReady = true` after the active service resolves

This keeps the UI layer unchanged while making the app resilient.

### Feature Flag Approach

```ts
const preferredService =
  import.meta.env.VITE_USE_BACKEND === "true"
    ? supabaseStoryService
    : localStoryService;
```

Then wrap backend load in fallback logic instead of assuming it succeeds.

---

## 8. Environment Variables

Add to `.env.local`:

```txt
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_BACKEND=true
```

The anon key is safe in the browser as long as RLS is enforced correctly.

---

## 9. LocalStorage Migration

Users who already have localStorage progress should not lose it.

Migration logic should be:

1. load backend state if it exists
2. load local state if it exists
3. if only one exists, use it
4. if both exist, choose the newer state using `updatedAt`
5. upsert the chosen state to Supabase
6. optionally clear local storage, or keep it as a fallback cache

Recommended precedence:

- backend missing + local exists -> migrate local
- local missing + backend exists -> use backend
- both exist -> newer `updatedAt` wins
- both missing -> default state

Example:

```ts
async loadState(): Promise<StoryState> {
  await ensureSession();

  const dbRow = await supabase.from("story_states").select("*").maybeSingle();
  const dbState = dbRow ? fromDbRow(dbRow) : null;
  const localState = readLocalStateIfPresent();

  const chosenState = chooseNewestState(dbState, localState) ?? getDefaultState();

  await supabase
    .from("story_states")
    .upsert(toDbRow(chosenState), { onConflict: "user_id" });

  this.state = chosenState;
  return this.state;
}
```

If you want stronger offline resilience, keeping localStorage after migration is acceptable for V1.

---

## 10. What the Homepage Gets Automatically

If the backend service preserves the current `StoryState` contract, the homepage and selectors should require no structural changes.

That means these features continue working, now with durable storage:

| Homepage feature | Works after backend? |
|---|---|
| Resume position | Yes |
| Completed chapter badges | Yes |
| In-progress indicator | Yes |
| Chapter lock/unlock states | Yes |
| Progress counters per part | Yes |
| Memories / Letters / Achievements slots | Ready once state is written into `flags` / `achievements` |

---

## 11. Out of Scope for This Pass

- admin dashboard
- author tooling beyond current local/dev needs
- email notifications
- social features
- full realtime sync
- account-claiming UI
- conflict-resolution UI

### Explicitly In Scope

Even though offline UI is out of scope, **service-level fallback is in scope**:

- if Supabase is unavailable, the story should still run through local state
- the viewer should still be able to progress
- backend should not become a hard blocker

---

## 12. File Checklist

| File | Action |
|---|---|
| `src/lib/supabase.ts` | Create - Supabase client singleton |
| `src/experience/story/service/supabaseStoryService.ts` | Create - backend implementation of `StoryService` |
| `src/experience/story/StoryProvider.tsx` | Edit - choose backend vs local and handle fallback |
| `.env.local` | Create - Supabase env vars |
| `supabase/migrations/001_story_states.sql` | Create - schema and RLS policies |
| `src/experience/story/service/localStoryService.ts` | Optional minor util extraction for shared normalization/defaults |
| homepage / experience components | No change expected |

---

## 13. Verification Steps

1. open the app fresh with no localStorage and no existing backend row
2. confirm default story state loads
3. progress through a chapter and confirm backend row updates
4. refresh the browser and confirm progress persists
5. if using the same identity on another device/browser, confirm progress matches
6. inspect `story_states` in Supabase and verify row shape
7. simulate backend failure or bad env vars and confirm the app still works through local fallback
8. test migration when both local and backend state exist and confirm newer `updatedAt` wins

---

## 14. Final Recommendation

This backend should be implemented now only because the frontend is already correctly shaped around a `StoryService` boundary.

The correct execution path is:

1. keep the current `StoryState` shape stable
2. implement `supabaseStoryService` against the same interface
3. preserve homepage and experience components unchanged
4. add graceful fallback to local storage
5. treat migration and versioning as first-class concerns

If those rules are followed, the homepage and story runtime remain decoupled from persistence, which is exactly what this architecture is supposed to achieve.
