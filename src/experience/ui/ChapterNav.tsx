import type { Part } from "../parts";
import "./ChapterNav.css";

interface ChapterNavProps {
  parts: Part[];
  activePartIndex: number;
  activeChapterIndex: number;
  onSelectionChange: (partIndex: number, chapterIndex: number) => void;
}

function FancyButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="button" onClick={onClick} disabled={disabled}>
      <span className="fold" />

      <div className="points_wrapper" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <i key={i} className="point" />
        ))}
      </div>

      <span className="inner">
        <svg
          className="icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          aria-hidden="true"
          focusable="false"
        >
          <polyline points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37" />
        </svg>
        {label}
      </span>
    </button>
  );
}

export default function ChapterNav({
  parts,
  activePartIndex,
  activeChapterIndex,
  onSelectionChange,
}: ChapterNavProps) {
  const activePart = parts[activePartIndex];
  const activeChapters = activePart?.chapters ?? [];
  const canPrevPart = activePartIndex > 0;
  const canNextPart = activePartIndex < parts.length - 1;
  const canPrevChapter = activeChapterIndex > 0;
  const canNextChapter = activeChapterIndex < activeChapters.length - 1;

  return (
    <div className="chapterNav">
      <div className="chapterNavButtonRow">
        <FancyButton
          label="Prev Part"
          disabled={!canPrevPart}
          onClick={() => onSelectionChange(activePartIndex - 1, 0)}
        />
        <FancyButton
          label="Next Part"
          disabled={!canNextPart}
          onClick={() => onSelectionChange(activePartIndex + 1, 0)}
        />
      </div>

      <label className="chapterNavLabel">
        Part
        <span className="chapterNavSelectWrap">
          <select
            value={activePartIndex}
            onChange={(e) => {
              const nextPart = Number(e.target.value);
              onSelectionChange(nextPart, 0);
            }}
            className="chapterNavSelect"
            aria-label="Part"
          >
            {parts.map((part, index) => (
              <option key={part.title} value={index}>
                {`Part ${index + 1}: ${part.title}`}
              </option>
            ))}
          </select>
          <svg
            className="chapterNavSelectChevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </label>

      <div className="chapterNavButtonRow">
        <FancyButton
          label="Prev Chapter"
          disabled={!canPrevChapter}
          onClick={() => onSelectionChange(activePartIndex, activeChapterIndex - 1)}
        />
        <FancyButton
          label="Next Chapter"
          disabled={!canNextChapter}
          onClick={() => onSelectionChange(activePartIndex, activeChapterIndex + 1)}
        />
      </div>

      <label className="chapterNavLabel">
        Chapter
        <span className="chapterNavSelectWrap">
          <select
            value={activeChapterIndex}
            onChange={(e) => {
              const nextChapter = Number(e.target.value);
              onSelectionChange(activePartIndex, nextChapter);
            }}
            className="chapterNavSelect"
            aria-label="Chapter"
          >
            {activeChapters.map((chapter, index) => (
              <option key={`${activePart?.title}-${chapter.title}`} value={index}>
                {chapter.title}
              </option>
            ))}
          </select>
          <svg
            className="chapterNavSelectChevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </label>
    </div>
  );
}
