import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraRig from "./CameraRig";
import SceneManager from "./SceneManager";
import FadeOverlay from "./FadeOverlay";
import ChapterNav from "./ui/ChapterNav";
import { Suspense, useCallback, useEffect, useState } from "react";
import { parts } from "./parts";
import gsap from "gsap";

export default function Experience() {
  const [fade, setFade] = useState(0);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [visibleChapterIndex, setVisibleChapterIndex] = useState(0);
  const [visiblePartIndex, setVisiblePartIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(1);
  const [goTo, setGoTo] = useState<((partIndex: number, chapterIndex: number) => void) | null>(null);
  
  console.log("Experience component rendered", {
    fade,
    part: activePartIndex,
    chapter: activeChapterIndex,
    visibleChapter: visibleChapterIndex
  });

  useEffect(() => {
    setSceneIndex(visibleChapterIndex + 1);
  }, [visibleChapterIndex]);

  const handleSelectionChange = useCallback(
    (partIndex: number, chapterIndex: number) => {
      // Update UI state immediately for responsiveness
      setActivePartIndex(partIndex);
      setActiveChapterIndex(chapterIndex);

      // Trigger transition for 3D content
      gsap.to({ v: 0 }, {
        v: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate() {
          setFade((this.targets()[0] as any).v);
        },
        onComplete() {
          // Update visible state while screen is black
          setVisiblePartIndex(partIndex);
          setVisibleChapterIndex(chapterIndex);

          // Small delay before fading back in
          gsap.to({ v: 1 }, {
            v: 0,
            duration: 0.5,
            delay: 0.1,
            ease: "power2.inOut",
            onUpdate() {
              setFade((this.targets()[0] as any).v);
            }
          });
        }
      });
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
            currentChapter={visibleChapterIndex + 1}
            currentPart={visiblePartIndex + 1}
          />
        </Suspense>
        <pointLight position={[0, 5, 0]} intensity={1} color="white" />
        <OrbitControls key={`${visiblePartIndex}-${visibleChapterIndex}`} />
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
