import type { RefObject } from "react";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter3Scenes } from "./data";
import "./Chapter3.css";

type Chapter3NarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function Chapter3Narrative({ isActive, overlayRef }: Chapter3NarrativeProps) {
  return (
    <NarrativeOverlay
      isActive={isActive}
      overlayRef={overlayRef}
      scenes={chapter3Scenes}
      overlayClassName="part5Chapter3Overlay"
      sceneClassName="part5Chapter3Scene"
    />
  );
}
