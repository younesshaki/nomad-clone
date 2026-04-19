# Story Files

This folder contains everything related to the narrative — completely separate from the code.
Work here first, then translate finished writing into the scene content files.

## Folder Structure

```
story/
  README.md          ← you are here
  arc.md             ← the central theme and emotional shape of the whole story
  subject.md         ← who she is: facts, traits, key relationships, life events
  structure.md       ← the parts/chapters map (what each chapter covers)
  voice.md           ← writing style guide: tone, narrator rules, what to avoid
  scenes/            ← one script file per scene (VO narration + on-screen text)
    scene-1.md
    scene-2a.md
    scene-2b.md
    scene-3a.md
    scene-3b.md
    scene-4a.md
    scene-4b.md
    scene-5.md
```

## Workflow

1. Start in `arc.md` — agree on the emotional throughline before writing anything else
2. Fill in `subject.md` — capture everything you know about her life (raw, unfiltered)
3. Build out `structure.md` — decide what each Part/Chapter covers
4. Use `voice.md` — establish the writing rules so every scene feels consistent
5. Write scenes in `scenes/` — VO script first, then the on-screen text lines

## Scene File → Code File Mapping

| Story file           | Code file                                      |
|----------------------|------------------------------------------------|
| scenes/scene-1.md   | src/.../scenes/scene-1/content.ts             |
| scenes/scene-2a.md  | src/.../scenes/scene-2a/content.ts            |
| scenes/scene-2b.md  | src/.../scenes/scene-2b/content.ts            |
| scenes/scene-3a.md  | src/.../scenes/scene-3a/content.ts            |
| scenes/scene-3b.md  | src/.../scenes/scene-3b/content.ts            |
| scenes/scene-4a.md  | src/.../scenes/scene-4a/content.ts            |
| scenes/scene-4b.md  | src/.../scenes/scene-4b/content.ts            |
| scenes/scene-5.md   | src/.../scenes/scene-5/content.ts             |
