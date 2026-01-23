import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Perf } from "r3f-perf";
import CameraRig from "./CameraRig";
import SceneManager from "./SceneManager";
import FadeOverlay from "./FadeOverlay";
import ChapterNav from "./ui/ChapterNav";
import CanvasErrorBoundary from "./CanvasErrorBoundary";
import {
  LoadingIndicatorA,
  LoadingIndicatorB,
  LoadingIndicatorC,
  LoadingIndicatorD,
  LoadingIndicatorE,
  LoadingIndicatorPreload,
} from "./ui/LoadingIndicator";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { parts } from "./parts";
import gsap from "gsap";
import { ModelPreloader } from "./ModelPreloader";
import { preloadSceneAssets } from "./sceneAssets";

type SceneLocation = {
  partIndex: number;
  chapterIndex: number;
};

const getAdjacentScenes = (
  partIndex: number,
  chapterIndex: number,
  partsData: typeof parts
): SceneLocation[] => {
  const scenes: SceneLocation[] = [{ partIndex, chapterIndex }];
  const currentPart = partsData[partIndex];
  const chapterCount = currentPart?.chapters.length ?? 0;

  let prevPartIndex = partIndex;
  let prevChapterIndex = chapterIndex - 1;
  if (prevChapterIndex < 0) {
    prevPartIndex = partIndex - 1;
    if (prevPartIndex >= 0) {
      const prevPart = partsData[prevPartIndex];
      prevChapterIndex = Math.max(0, prevPart.chapters.length - 1);
    }
  }
  if (prevPartIndex >= 0 && prevChapterIndex >= 0) {
    scenes.push({ partIndex: prevPartIndex, chapterIndex: prevChapterIndex });
  }

  let nextPartIndex = partIndex;
  let nextChapterIndex = chapterIndex + 1;
  if (nextChapterIndex >= chapterCount) {
    nextPartIndex = partIndex + 1;
    if (nextPartIndex < partsData.length) {
      nextChapterIndex = 0;
    }
  }
  if (nextPartIndex < partsData.length && nextChapterIndex >= 0) {
    scenes.push({ partIndex: nextPartIndex, chapterIndex: nextChapterIndex });
  }

  return scenes.filter(
    (scene, index, list) =>
      index ===
      list.findIndex(
        (value) =>
          value.partIndex === scene.partIndex &&
          value.chapterIndex === scene.chapterIndex
      )
  );
};

export default function Experience() {
  const { active: loadingActive, progress } = useProgress();
  const [fade, setFade] = useState(0);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [visibleChapterIndex, setVisibleChapterIndex] = useState(0);
  const [visiblePartIndex, setVisiblePartIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(1);
  const [goTo, setGoTo] = useState<((partIndex: number, chapterIndex: number) => void) | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [modelsPreloaded, setModelsPreloaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [warmLoader, setWarmLoader] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const loaderTextByPart = [
    "Loading Genesis",
    "Loading Trials",
    "Loading Exile",
    "Loading Ascension",
    "Loading Echoes",
  ];
  const progressLabel = loadingActive ? `Loading ${Math.round(progress)}%` : "Loading...";
  const loaderText = loadingActive
    ? progressLabel
    : loaderTextByPart[visiblePartIndex] ?? "Loading...";
  const loaderBackdropClass =
    visiblePartIndex === 0
      ? "loaderBackdrop-a"
      : visiblePartIndex === 1
        ? "loaderBackdrop-b"
        : visiblePartIndex === 2
          ? "loaderBackdrop-c"
          : visiblePartIndex === 3
            ? "loaderBackdrop-d"
            : "loaderBackdrop-e";
  const LoaderComponent =
    visiblePartIndex === 0
      ? LoadingIndicatorA
      : visiblePartIndex === 1
        ? LoadingIndicatorB
        : visiblePartIndex === 2
          ? LoadingIndicatorC
          : visiblePartIndex === 3
            ? LoadingIndicatorD
            : LoadingIndicatorE;
  
  console.log("Experience component rendered", {
    fade,
    part: activePartIndex,
    chapter: activeChapterIndex,
    visibleChapter: visibleChapterIndex
  });

  useEffect(() => {
    setSceneIndex(visibleChapterIndex + 1);
  }, [visibleChapterIndex]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinTimeElapsed(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadingComplete = !loadingActive && (progress >= 100 || progress === 0);
    if (minTimeElapsed && loadingComplete) {
      setModelsPreloaded(true);
    }
  }, [loadingActive, minTimeElapsed, progress]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setWarmLoader(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!controlsRef.current) {
      return;
    }

    controlsRef.current.enabled = true;
    controlsRef.current.enableZoom = !(visiblePartIndex === 0 && visibleChapterIndex === 3);
    controlsRef.current.update();
  }, [visibleChapterIndex, visiblePartIndex]);

  useEffect(() => {
    const scenes = getAdjacentScenes(visiblePartIndex, visibleChapterIndex, parts);
    scenes.forEach(({ partIndex, chapterIndex }) => {
      preloadSceneAssets(partIndex + 1, chapterIndex + 1);
    });
  }, [visibleChapterIndex, visiblePartIndex]);

  const handleSelectionChange = useCallback(
    (partIndex: number, chapterIndex: number) => {
      // Update UI state immediately for responsiveness
      setActivePartIndex(partIndex);
      setActiveChapterIndex(chapterIndex);

      const transition = gsap.timeline();
      transition.to({ v: 0 }, {
        v: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate() {
          setFade((this.targets()[0] as { v: number }).v);
        },
        onComplete() {
          setVisiblePartIndex(partIndex);
          setVisibleChapterIndex(chapterIndex);
          setShowLoader(true);
        },
      });

      transition.to({}, { duration: 2.5 });

      transition.call(() => {
        setShowLoader(false);
      });

      transition.to({ v: 1 }, {
        v: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate() {
          setFade((this.targets()[0] as { v: number }).v);
        },
      });
    },
    [],
  );
  
  if (!modelsPreloaded) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
        }}
      >
        <div className="loaderBackdrop loaderBackdrop-preload" />
        <LoadingIndicatorPreload text={progressLabel} />
        <ModelPreloader />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ModelPreloader />
      <CanvasErrorBoundary>
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 0, 5], fov: 75, far: 10000 }}
        >
          {import.meta.env.DEV && <Perf position="top-left" />}
          <color attach="background" args={["black"]} />
          <CameraRig
            key={`${sceneIndex}-${visiblePartIndex}-${visibleChapterIndex}`}
            sceneIndex={sceneIndex}
            currentPart={visiblePartIndex + 1}
            currentChapter={visibleChapterIndex + 1}
          />
          <Suspense fallback={null}>
            <SceneManager
              currentChapter={visibleChapterIndex + 1}
              currentPart={visiblePartIndex + 1}
            />
          </Suspense>
          <pointLight position={[0, 5, 0]} intensity={1} color="white" />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableZoom={!(visiblePartIndex === 0 && visibleChapterIndex === 3)}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <FadeOverlay opacity={fade} />
      {showLoader && <div className={`loaderBackdrop ${loaderBackdropClass}`} />}
      {warmLoader && <LoadingIndicatorA className="isHidden" text="Loading..." />}
      {showLoader && <LoaderComponent text={loaderText} />}
      <ChapterNav
        parts={parts}
        activePartIndex={activePartIndex}
        activeChapterIndex={activeChapterIndex}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
