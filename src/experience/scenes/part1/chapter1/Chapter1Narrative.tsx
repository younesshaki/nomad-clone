import type { RefObject } from "react";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter1Scenes } from "./data";
import "./Chapter1.css";

type Chapter1NarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function Chapter1Narrative({ isActive, overlayRef }: Chapter1NarrativeProps) {
  return (
    <NarrativeOverlay
      isActive={isActive}
      overlayRef={overlayRef}
      scenes={chapter1Scenes}
      overlayClassName="chapter1Overlay"
      sceneClassName="chapter1Scene"
      titleClassName="chapter1Title"
      lineClassName="chapter1Line"
    />
  );
}
