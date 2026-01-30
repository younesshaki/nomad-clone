import { useRef } from "react";
import { Chapter1Scene } from "./Chapter1Scene";
import { Chapter1Narrative } from "./Chapter1Narrative";
import { useChapter1Timeline } from "./Chapter1Timeline";
import { useScrollCamera } from "./hooks/useScrollCamera";

type Chapter1Props = {
  isActive?: boolean;
};

export default function Chapter1({ isActive = true }: Chapter1Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useChapter1Timeline({ overlayRef, isActive });
  useScrollCamera({
    isActive,
    narrativeRef: overlayRef,
    enabled: isActive,
  });

  return (
    <>
      <Chapter1Scene overlayRef={overlayRef} />
      <Chapter1Narrative isActive={isActive} overlayRef={overlayRef} />
    </>
  );
}
