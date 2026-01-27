import type { RefObject } from "react";
import { useBasicTimeline } from "../../shared/useBasicTimeline";

type Chapter2TimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
};

export function useChapter2Timeline(options: Chapter2TimelineOptions) {
  useBasicTimeline(options);
}
