import type { RefObject } from "react";
import { useBasicTimeline } from "../../shared/useBasicTimeline";

type Chapter3TimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
};

export function useChapter3Timeline(options: Chapter3TimelineOptions) {
  useBasicTimeline(options);
}
