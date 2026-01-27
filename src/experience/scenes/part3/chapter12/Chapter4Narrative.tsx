import type { RefObject } from "react";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter4Scenes } from "./data";
import "./Chapter4.css";

type Chapter4NarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function Chapter4Narrative({ isActive, overlayRef }: Chapter4NarrativeProps) {
  return (
    <NarrativeOverlay
      isActive={isActive}
      overlayRef={overlayRef}
      scenes={chapter4Scenes}
      overlayClassName="part3Chapter4Overlay"
      sceneClassName="part3Chapter4Scene"
    />
  );
}
