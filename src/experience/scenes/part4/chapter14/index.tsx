import { useRef } from "react";
import { Chapter2Scene } from "./Chapter2Scene";
import { Chapter2Narrative } from "./Chapter2Narrative";
import { useChapter2Timeline } from "./Chapter2Timeline";

type Chapter2Props = {
  isActive?: boolean;
};

export default function Chapter2({ isActive = true }: Chapter2Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useChapter2Timeline({ overlayRef, isActive });

  return (
    <>
      <Chapter2Scene />
      <Chapter2Narrative isActive={isActive} overlayRef={overlayRef} />
    </>
  );
}
