import type { RefObject } from "react";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter5Scenes } from "./data";
import "./Chapter5.css";

type Chapter5NarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function Chapter5Narrative({ isActive, overlayRef }: Chapter5NarrativeProps) {
  return (
    <NarrativeOverlay
      isActive={isActive}
      overlayRef={overlayRef}
      scenes={chapter5Scenes}
      overlayClassName="part6Chapter5Overlay"
      sceneClassName="part6Chapter5Scene"
    />
  );
}
