import { useRef } from "react";
import { Chapter4Scene } from "./Chapter4Scene";
import { Chapter4Narrative } from "./Chapter4Narrative";
import { useChapter4Timeline } from "./Chapter4Timeline";

type Chapter4Props = {
  isActive?: boolean;
};

export default function Chapter4({ isActive = true }: Chapter4Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useChapter4Timeline({ overlayRef, isActive });

  return (
    <>
      <Chapter4Scene />
      <Chapter4Narrative isActive={isActive} overlayRef={overlayRef} />
    </>
  );
}
