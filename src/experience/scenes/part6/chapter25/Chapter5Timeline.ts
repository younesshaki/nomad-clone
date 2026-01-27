import type { RefObject } from "react";
import { useBasicTimeline } from "../../shared/useBasicTimeline";

type Chapter5TimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
};

export function useChapter5Timeline(options: Chapter5TimelineOptions) {
  useBasicTimeline(options);
}
