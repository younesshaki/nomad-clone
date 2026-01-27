import { useRef } from "react";
import { Chapter3Scene } from "./Chapter3Scene";
import { Chapter3Narrative } from "./Chapter3Narrative";
import { useChapter3Timeline } from "./Chapter3Timeline";

type Chapter3Props = {
  isActive?: boolean;
};

export default function Chapter3({ isActive = true }: Chapter3Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useChapter3Timeline({ overlayRef, isActive });

  return (
    <>
      <Chapter3Scene />
      <Chapter3Narrative isActive={isActive} overlayRef={overlayRef} />
    </>
  );
}
