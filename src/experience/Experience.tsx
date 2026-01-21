import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraRig from "./CameraRig";
import SceneManager from "./SceneManager";
import FadeOverlay from "./FadeOverlay";
import ChapterNav from "./ui/ChapterNav";
import { Suspense, useCallback, useEffect, useState } from "react";
import { parts } from "./parts";

export default function Experience() {
  const [fade, setFade] = useState(0);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(1);
  const [goTo, setGoTo] = useState<((partIndex: number, chapterIndex: number) => void) | null>(null);
  
  console.log("Experience component rendered", {
    fade,
    part: activePartIndex,
    chapter: activeChapterIndex,
  });

  useEffect(() => {
    setSceneIndex(activeChapterIndex + 1);
  }, [activeChapterIndex]);

  const handleSelectionChange = useCallback(
    (partIndex: number, chapterIndex: number) => {
      setActivePartIndex(partIndex);
      setActiveChapterIndex(chapterIndex);
    },
    [],
  );
  
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 5], fov: 75, far: 10000 }}
      >
        <color attach="background" args={["black"]} />
        <CameraRig key={sceneIndex} sceneIndex={sceneIndex} />
        <Suspense fallback={null}>
          <SceneManager
            onFadeChange={setFade}
            currentChapter={activeChapterIndex + 1}
          />
        </Suspense>
        <pointLight position={[0, 5, 0]} intensity={1} color="white" />
        <OrbitControls key={`${activePartIndex}-${activeChapterIndex}`} />
      </Canvas>
      <FadeOverlay opacity={fade} />
      <ChapterNav
        parts={parts}
        activePartIndex={activePartIndex}
        activeChapterIndex={activeChapterIndex}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
