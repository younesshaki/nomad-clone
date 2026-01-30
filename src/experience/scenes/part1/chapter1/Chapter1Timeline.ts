import type { RefObject } from "react";
import { useBasicTimeline } from "../../shared/useBasicTimeline";

type Chapter1TimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
};

export function useChapter1Timeline(options: Chapter1TimelineOptions) {
  useBasicTimeline({
    ...options,
    introDuration: 5.6,
    introRevealLead: 1.4,
  });
}
