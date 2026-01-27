import { useRef } from "react";
import { Chapter5Scene } from "./Chapter5Scene";
import { Chapter5Narrative } from "./Chapter5Narrative";
import { useChapter5Timeline } from "./Chapter5Timeline";

type Chapter5Props = {
  isActive?: boolean;
};

export default function Chapter5({ isActive = true }: Chapter5Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useChapter5Timeline({ overlayRef, isActive });

  return (
    <>
      <Chapter5Scene />
      <Chapter5Narrative isActive={isActive} overlayRef={overlayRef} />
    </>
  );
}
