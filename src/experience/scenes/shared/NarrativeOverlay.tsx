import { Html } from "@react-three/drei";
import type { RefObject } from "react";
import type { NarrativeScene } from "./narrativeTypes";
import "./NarrativeBase.css";

type NarrativeOverlayProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
  scenes: NarrativeScene[];
  overlayClassName: string;
  sceneClassName: string;
  titleClassName?: string;
  lineClassName?: string;
};

export function NarrativeOverlay({
  isActive,
  overlayRef,
  scenes,
  overlayClassName,
  sceneClassName,
  titleClassName,
  lineClassName,
}: NarrativeOverlayProps) {
  const titleClass = `narrativeTitle${titleClassName ? ` ${titleClassName}` : ""}`;
  const lineClass = `narrativeLine${lineClassName ? ` ${lineClassName}` : ""}`;

  return (
    <Html
      fullscreen
      style={{
        pointerEvents: "none",
        zIndex: 200,
      }}
    >
      <div 
        ref={overlayRef} 
        className={`${overlayClassName} narrativeOverlay`}
        style={{
          opacity: (!isActive || scenes.length === 0) ? 0 : 1,
          visibility: (!isActive || scenes.length === 0) ? 'hidden' : 'visible',
        }}
      >
        {scenes.map((scene) => (
          <section
            key={scene.id}
            className={`${sceneClassName} narrativeScene ${scene.id}`}
            data-voiceover={scene.voiceOver ?? undefined}
          >
            <div className={titleClass}>{scene.title}</div>
            {"columns" in scene ? (
              <>
                <div className="sceneColumns">
                  <div className="sceneColumn column-left">
                    {scene.columns.left.map((line, index) => (
                      <p
                        key={`left-${index}`}
                        className={`${lineClass}${line.className ? ` ${line.className}` : ""}`}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                  <div className="sceneColumn column-right">
                    {scene.columns.right.map((line, index) => (
                      <p
                        key={`right-${index}`}
                        className={`${lineClass}${line.className ? ` ${line.className}` : ""}`}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                </div>
                {scene.mergeLines.map((line, index) => (
                  <p
                    key={`merge-${index}`}
                    className={`${lineClass}${line.className ? ` ${line.className}` : ""}`}
                  >
                    {line.text}
                  </p>
                ))}
              </>
            ) : (
              scene.lines.map((line, index) => (
                <p
                  key={index}
                  className={`${lineClass}${line.className ? ` ${line.className}` : ""}`}
                >
                  {line.text}
                </p>
              ))
            )}
          </section>
        ))}
      </div>
    </Html>
  );
}
