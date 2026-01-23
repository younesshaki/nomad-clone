import { useEffect, useRef, useState } from "react";
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

type SelectOption = {
  label: string;
  value: number;
};

function ChapterSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  options: SelectOption[];
  onChange: (nextValue: number) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <label className="chapterNavLabel">
      <span className="chapterNavLabelText">{label}</span>
      <span
        ref={wrapRef}
        className={`chapterNavSelectWrap${open ? " isOpen" : ""}${disabled ? " isDisabled" : ""}`}
      >
        <button
          type="button"
          className="chapterNavSelectButton"
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span className="chapterNavSelectValue">{selected?.label ?? "Select"}</span>
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
        </button>

        {open && (
          <div className="chapterNavSelectMenu" role="listbox" aria-label={label}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`chapterNavSelectOption${isSelected ? " isSelected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </span>
    </label>
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

      <ChapterSelect
        label="Part"
        value={activePartIndex}
        options={parts.map((part, index) => ({
          value: index,
          label: `Part ${index + 1}: ${part.title}`,
        }))}
        onChange={(nextPart) => onSelectionChange(nextPart, 0)}
      />

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

      <ChapterSelect
        label="Chapter"
        value={activeChapterIndex}
        options={activeChapters.map((chapter, index) => ({
          value: index,
          label: chapter.title,
        }))}
        onChange={(nextChapter) => onSelectionChange(activePartIndex, nextChapter)}
        disabled={activeChapters.length === 0}
      />
    </div>
  );
}
