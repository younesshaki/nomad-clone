import { useState, useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Perf } from "r3f-perf";

// Simple external progress tracker that can be updated by timeline hooks
export const debugState = {
  scrollProgress: 0,
  activeScene: null as string | null,
  totalDuration: 0,
};

export function DebugOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <>
      <Perf position="top-left" />
      <CameraLogger />
    </>
  );
}

function CameraLogger() {
  const { camera } = useThree();
  const [data, setData] = useState({ 
    pos: "", 
    rot: "",
    progress: 0,
    scene: "",
  });
  const frameCount = useRef(0);

  useFrame(() => {
    // Only update UI every 10 frames to save performance
    if (frameCount.current % 10 === 0) {
      setData({
        pos: `[${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}]`,
        rot: `[${camera.rotation.x.toFixed(2)}, ${camera.rotation.y.toFixed(2)}, ${camera.rotation.z.toFixed(2)}]`,
        progress: debugState.scrollProgress,
        scene: debugState.activeScene ?? "—",
      });
    }
    frameCount.current++;
  });

  return (
    <Html
      fullscreen
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.85)",
          padding: "12px",
          borderRadius: "6px",
          zIndex: 9999,
          border: "1px solid #00ff00",
          color: "#00ff00",
          fontFamily: "monospace",
          fontSize: "12px",
          minWidth: "280px",
        }}
      >
        <div style={{ marginBottom: "8px", borderBottom: "1px solid #00ff0044", paddingBottom: "6px" }}>
          <strong>📍 CAMERA</strong>
        </div>
        <div><strong>POS:</strong> {data.pos}</div>
        <div><strong>ROT:</strong> {data.rot}</div>
        
        <div style={{ marginTop: "12px", marginBottom: "8px", borderBottom: "1px solid #00ff0044", paddingBottom: "6px" }}>
          <strong>🎬 TIMELINE</strong>
        </div>
        <div><strong>PROGRESS:</strong> {(data.progress * 100).toFixed(1)}%</div>
        <div><strong>SCENE:</strong> {data.scene}</div>
        
        {/* Progress bar */}
        <div style={{ 
          marginTop: "8px", 
          background: "#00ff0022", 
          height: "6px", 
          borderRadius: "3px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${data.progress * 100}%`,
            height: "100%",
            background: "#00ff00",
            transition: "width 0.1s ease-out",
          }} />
        </div>
      </div>
    </Html>
  );
}
