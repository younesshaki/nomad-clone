import { Canvas } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Perf } from "r3f-perf";
import CameraRig from "./CameraRig";
import SceneManager from "./SceneManager";
import FadeOverlay from "./FadeOverlay";
import ChapterNav from "./ui/ChapterNav";
import CanvasErrorBoundary from "./CanvasErrorBoundary";
import PreloadGate from "./ui/PreloadGate";
import { LoaderOverlay } from "./loaders/shared/LoaderOverlay";
import type { LoaderVariant } from "./loaders/shared/types";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { parts } from "./parts";
import gsap from "gsap";
import { ModelPreloader } from "./ModelPreloader";
import { preloadSceneAssets, preloadAdjacentChapters } from "./sceneAssets";
import { useLoadingController } from "./hooks/useLoadingController";
import { SoundProvider } from "./soundContext";

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
  const { isLoading, progress } = useLoadingController();
  
  // URL Hash syncing logic
  const getInitialStateFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/#part-(\d+)-chapter-(\d+)/);
    if (match) {
      const p = parseInt(match[1], 10) - 1;
      const c = parseInt(match[2], 10) - 1;
      // Basic bounds check (assuming parts data is available or just safe defaults)
      const partIndex = Math.max(0, Math.min(p, parts.length - 1));
      const chapterCount = parts[partIndex]?.chapters.length ?? 1;
      const chapterIndex = Math.max(0, Math.min(c, chapterCount - 1));
      return { partIndex, chapterIndex };
    }
    return { partIndex: 0, chapterIndex: 0 };
  };

  const [initialState] = useState(getInitialStateFromHash);

  const [fade, setFade] = useState(0);
  const [activePartIndex, setActivePartIndex] = useState(initialState.partIndex);
  const [activeChapterIndex, setActiveChapterIndex] = useState(initialState.chapterIndex);
  const [visibleChapterIndex, setVisibleChapterIndex] = useState(initialState.chapterIndex);
  const [visiblePartIndex, setVisiblePartIndex] = useState(initialState.partIndex);
  const [sceneIndex, setSceneIndex] = useState(initialState.chapterIndex + 1);
  const [goTo, setGoTo] = useState<((partIndex: number, chapterIndex: number) => void) | null>(null);
  
  // Sync state to URL hash
  useEffect(() => {
    const hash = `#part-${activePartIndex + 1}-chapter-${activeChapterIndex + 1}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [activePartIndex, activeChapterIndex]);

  const [showLoader, setShowLoader] = useState(false);
  const [modelsPreloaded, setModelsPreloaded] = useState(false);
  const [preloadMinElapsed, setPreloadMinElapsed] = useState(false);
  const [initialRevealReady, setInitialRevealReady] = useState(false);
  const [canHideLoader, setCanHideLoader] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [preloadGateOpen, setPreloadGateOpen] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const loaderTextByPart = [
    "Loading Genesis",
    "Loading Trials",
    "Loading Exile",
    "Loading Ascension",
    "Loading Echoes",
    "Loading Part 6",
  ];
  const progressLabel = isLoading ? `Loading ${progress}%` : "Ready";
  const loaderText = isLoading
    ? progressLabel
    : loaderTextByPart[visiblePartIndex] ?? "Loading...";
  const loaderVariant: LoaderVariant = (
    visiblePartIndex === 0
      ? "a"
      : visiblePartIndex === 1
        ? "b"
        : visiblePartIndex === 2
          ? "c"
          : visiblePartIndex === 3
            ? "d"
            : visiblePartIndex === 4
              ? "e"
              : "f"
  );
  const isCyberOcean = visiblePartIndex === 2 && visibleChapterIndex === 0;
  const shouldShowLoader = showLoader && !canHideLoader;
  const preloaderVisible = preloadGateOpen && !initialRevealReady;
  const scenesHidden = shouldShowLoader || preloaderVisible || fade > 0.01;
  const cameraEnabled = !preloaderVisible && !shouldShowLoader;

  // Reset canHideLoader when chapter changes
  useEffect(() => {
    if (showLoader) {
      // When loader is shown (chapter change), reset canHideLoader to false
      setCanHideLoader(false);
    } else if (!showLoader && modelsPreloaded) {
      // After loader was hidden, allow it to be hidden by syncing with controller
      // This prevents blocking the fade out animation
      setCanHideLoader(true);
    }
  }, [showLoader, modelsPreloaded]);

  console.log("Experience component rendered", {
    fade,
    part: activePartIndex,
    chapter: activeChapterIndex,
    visibleChapter: visibleChapterIndex,
    showLoader,
    canHideLoader,
    shouldShowLoader,
  });

  useEffect(() => {
    setSceneIndex(visibleChapterIndex + 1);
  }, [visibleChapterIndex]);

  useEffect(() => {
    setSoundEnabled(true);
    setSoundBlocked(false);
  }, []);

  useEffect(() => {
    if (!preloadGateOpen) {
      return;
    }

    setModelsPreloaded(false);
    setPreloadMinElapsed(false);
    setInitialRevealReady(false);
    const timer = window.setTimeout(() => setPreloadMinElapsed(true), 7800);
    return () => window.clearTimeout(timer);
  }, [preloadGateOpen]);

  useEffect(() => {
    if (!preloadGateOpen || modelsPreloaded) {
      return;
    }

    if (preloadMinElapsed && !isLoading) {
      const rafId = window.requestAnimationFrame(() => {
        setModelsPreloaded(true);
      });
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [isLoading, preloadGateOpen, preloadMinElapsed, modelsPreloaded]);

  useEffect(() => {
    if (!modelsPreloaded || initialRevealReady) {
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setInitialRevealReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [modelsPreloaded, initialRevealReady]);

  // Smart preloading: Load current and adjacent chapters only
  useEffect(() => {
    preloadAdjacentChapters(visiblePartIndex + 1, visibleChapterIndex + 1);
  }, [visibleChapterIndex, visiblePartIndex]);

  const handleSelectionChange = useCallback(
    (partIndex: number, chapterIndex: number) => {
      // Update UI state immediately for responsiveness
      setActivePartIndex(partIndex);
      setActiveChapterIndex(chapterIndex);

      transitionRef.current?.kill();
      const transition = gsap.timeline();
      transitionRef.current = transition;
      transition.to({ v: 0 }, {
        v: 1,
        duration: 1.5,
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

      // Special case: Extend loader duration for Part 1 (Loader A) to let audio play
      const loaderDuration = partIndex === 0 ? 7.0 : 2.5;
      transition.to({}, { duration: loaderDuration });

      transition.call(() => {
        setShowLoader(false);
      });

      transition.to({ v: 1 }, {
        v: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate() {
          setFade((this.targets()[0] as { v: number }).v);
        },
      });

    },
    [],
  );
  
  const handleToggleSound = () => {
    if (!soundEnabled || soundBlocked) {
      setSoundEnabled(true);
      setSoundBlocked(false);
    } else {
      setSoundEnabled(false);
    }
  };

  const handleStartExperience = () => {
    setPreloadGateOpen(true);
    setSoundEnabled(true);
    setSoundBlocked(false);
  };

  let content: JSX.Element;

  if (!preloadGateOpen) {
    content = <PreloadGate onStart={handleStartExperience} />;
  } else {
    content = (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <ModelPreloader />
        <CanvasErrorBoundary key={`part-${visiblePartIndex}-chapter-${visibleChapterIndex}`}>
          <Canvas
            dpr={[1, 1.5]} // Cap DPR to 1.5 to save GPU on high-res screens
            gl={{ 
              antialias: false, // Significant perf boost
              powerPreference: "high-performance",
              stencil: false,
              depth: true
            }}
            style={{
              width: "100%",
              height: "100%",
              opacity: preloaderVisible ? 0 : 1,
              transition: "opacity 0.6s ease",
            }}
            camera={{ position: [0, 0, 5], fov: 75, far: 10000 }}
          >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            {import.meta.env.DEV && <Perf position="top-left" />}
            <color attach="background" args={["black"]} />
            <CameraRig
              key={`${sceneIndex}-${visiblePartIndex}-${visibleChapterIndex}`}
              sceneIndex={sceneIndex}
              currentPart={visiblePartIndex + 1}
              currentChapter={visibleChapterIndex + 1}
              enabled={cameraEnabled}
            />
            <Suspense fallback={null}>
              <SceneManager
                currentChapter={visibleChapterIndex + 1}
                currentPart={visiblePartIndex + 1}
                scenesHidden={scenesHidden}
              />
            </Suspense>
            <pointLight position={[0, 5, 0]} intensity={1} color="white" />
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enabled={!preloaderVisible && !shouldShowLoader}
              enableZoom={
                !(
                  (visiblePartIndex === 0 && visibleChapterIndex === 3) ||
                  (visiblePartIndex === 0 && visibleChapterIndex === 0)
                )
              }
              enableDamping
              dampingFactor={0.05}
            />
          </Canvas>
        </CanvasErrorBoundary>
        {!preloaderVisible && (
          <>
            <FadeOverlay opacity={fade} />
            <LoaderOverlay visible={shouldShowLoader} variant={loaderVariant} text={loaderText} />
          </>
        )}
        <LoaderOverlay visible={preloaderVisible} variant="pre" text={progressLabel} />
        <button className="loaderSoundButton" type="button" onClick={handleToggleSound}>
          {soundEnabled && !soundBlocked ? "Sound On" : "Enable Sound"}
        </button>
        {!preloaderVisible && (
          <ChapterNav
            parts={parts}
            activePartIndex={activePartIndex}
            activeChapterIndex={activeChapterIndex}
            onSelectionChange={handleSelectionChange}
          />
        )}
      </div>
    );
  }

  return (
    <SoundProvider value={{ soundEnabled, soundBlocked }}>
      {content}
    </SoundProvider>
  );
}
