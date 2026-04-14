import { useMemo } from "react";
import { useUiSounds } from "../audio/useUiSounds";
import { useStory } from "../story/StoryProvider";
import {
  getPartDisplayList,
  getResumeTarget,
  hasProgress,
  type ChapterDisplayInfo,
  type ChapterStatus,
  type PartDisplayInfo,
} from "../story/selectors";
import CinematicShell from "./CinematicShell";
import "./StoryHomePage.css";

type StoryHomePageProps = {
  onEnter: (partIndex: number, chapterIndex: number) => void;
};

/* ─── Status label helpers ─── */

const STATUS_LABELS: Record<ChapterStatus, string> = {
  locked: "Locked",
  available: "Ready",
  "in-progress": "In Progress",
  completed: "Complete",
};

/* ─── Subcomponents ─── */

function ChapterCard({
  chapter,
  globalNumber,
  onSelect,
}: {
  chapter: ChapterDisplayInfo;
  globalNumber: number;
  onSelect: () => void;
}) {
  const { playHover, playNavClick } = useUiSounds();
  const canSelect = chapter.status !== "locked";

  const handleSelect = () => {
    if (!canSelect) {
      return;
    }

    playNavClick();
    onSelect();
  };

  return (
    <div
      className={`storyHome__chapterCard storyHome__chapterCard--${chapter.status}`}
      onMouseEnter={canSelect ? playHover : undefined}
      onFocus={canSelect ? playHover : undefined}
      onClick={canSelect ? handleSelect : undefined}
      role={canSelect ? "button" : undefined}
      tabIndex={canSelect ? 0 : undefined}
      onKeyDown={
        canSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect();
              }
            }
          : undefined
      }
    >
      <div className="storyHome__chapterMeta">
        <span className="storyHome__chapterNumber">
          Chapter {globalNumber}
        </span>
        <span
          className={`storyHome__chapterStatus storyHome__chapterStatus--${chapter.status}`}
        >
          <span
            className={`storyHome__statusDot storyHome__statusDot--${chapter.status}`}
          />
          {STATUS_LABELS[chapter.status]}
        </span>
      </div>
      <h4 className="storyHome__chapterTitle">
        {chapter.definition.title}
      </h4>
      {chapter.sceneCount > 0 && (
        <div className="storyHome__chapterScenes">
          {chapter.completedSceneCount} / {chapter.sceneCount} scenes
        </div>
      )}
    </div>
  );
}

function PartGroup({
  part,
  globalOffset,
  onChapterSelect,
}: {
  part: PartDisplayInfo;
  globalOffset: number;
  onChapterSelect: (partIndex: number, chapterIndex: number) => void;
}) {
  return (
    <div className="storyHome__partGroup">
      <div className="storyHome__partHeader">
        <span className="storyHome__partNumber">
          Part {part.partIndex + 1}
        </span>
        <h3 className="storyHome__partTitle">{part.definition.title}</h3>
        <div className="storyHome__partLine" />
        <span className="storyHome__partProgress">
          {part.completedChapterCount} / {part.totalChapterCount}
        </span>
      </div>
      <div className="storyHome__chapterList">
        {part.chapters.map((chapter, ci) => (
          <ChapterCard
            key={chapter.definition.id}
            chapter={chapter}
            globalNumber={globalOffset + ci + 1}
            onSelect={() =>
              onChapterSelect(chapter.partIndex, chapter.chapterIndex)
            }
          />
        ))}
      </div>
    </div>
  );
}

function UnlockablesPlaceholder() {
  return (
    <div className="storyHome__unlockables">
      <p className="storyHome__sectionLabel">Unlockables</p>
      <div className="storyHome__unlockGrid">
        <div className="storyHome__unlockSlot">
          <div className="storyHome__unlockIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="storyHome__unlockLabel">Memories</span>
        </div>
        <div className="storyHome__unlockSlot">
          <div className="storyHome__unlockIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <span className="storyHome__unlockLabel">Letters</span>
        </div>
        <div className="storyHome__unlockSlot">
          <div className="storyHome__unlockIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
          </div>
          <span className="storyHome__unlockLabel">Achievements</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function StoryHomePage({ onEnter }: StoryHomePageProps) {
  const { playHover, playPrimaryClick } = useUiSounds();
  const { isReady, state } = useStory();

  const parts = useMemo(
    () => (isReady ? getPartDisplayList(state) : []),
    [isReady, state]
  );

  const resumeTarget = useMemo(
    () => (isReady ? getResumeTarget(state) : null),
    [isReady, state]
  );

  const showResume = isReady && hasProgress(state);

  // Compute global chapter offsets for numbering
  const globalOffsets = useMemo(() => {
    let sum = 0;
    return parts.map((part) => {
      const offset = sum;
      sum += part.totalChapterCount;
      return offset;
    });
  }, [parts]);

  const handlePrimaryCta = () => {
    playPrimaryClick();
    if (resumeTarget) {
      onEnter(resumeTarget.partIndex, resumeTarget.chapterIndex);
    } else {
      onEnter(0, 0);
    }
  };

  return (
    <CinematicShell>
      <div className="storyHome">
        {/* ─── Hero ─── */}
        <section className="storyHome__hero">
          <h1 className="storyHome__title">Nomad</h1>
          <p className="storyHome__subtitle">A cinematic journey</p>

          <button
            type="button"
            className="storyHome__cta"
            onMouseEnter={isReady ? playHover : undefined}
            onFocus={isReady ? playHover : undefined}
            onClick={handlePrimaryCta}
            disabled={!isReady}
          >
            {showResume ? "Continue" : "Begin"}
            <svg
              className="storyHome__ctaArrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {showResume && resumeTarget && (
            <p className="storyHome__resumeHint">
              {resumeTarget.partTitle} &middot; {resumeTarget.chapterTitle}
            </p>
          )}
        </section>

        {/* ─── Divider ─── */}
        <div className="storyHome__divider" />

        {/* ─── Chapters ─── */}
        <section className="storyHome__chapters">
          <p className="storyHome__sectionLabel">Your Journey</p>
          {parts.map((part, pi) => (
            <PartGroup
              key={part.definition.id}
              part={part}
              globalOffset={globalOffsets[pi]}
              onChapterSelect={onEnter}
            />
          ))}
        </section>

        {/* ─── Unlockables ─── */}
        <div className="storyHome__divider" />
        <UnlockablesPlaceholder />

        {/* ─── Footer spacer ─── */}
        <div className="storyHome__footer" />
      </div>
    </CinematicShell>
  );
}
