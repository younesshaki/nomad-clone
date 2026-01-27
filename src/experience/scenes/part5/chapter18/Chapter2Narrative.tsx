import type { RefObject } from "react";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter2Scenes } from "./data";
import "./Chapter2.css";

type Chapter2NarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function Chapter2Narrative({ isActive, overlayRef }: Chapter2NarrativeProps) {
  return (
    <NarrativeOverlay
      isActive={isActive}
      overlayRef={overlayRef}
      scenes={chapter2Scenes}
      overlayClassName="part5Chapter2Overlay"
      sceneClassName="part5Chapter2Scene"
    />
  );
}
