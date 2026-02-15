import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { useSoundSettings } from "../../soundContext";
import { debugState } from "../../utils/DebugOverlay";
import { audioSyncRegistry } from "../part1/chapter1/audioSync";

/**
 * useCinematicTimeline
 * 
 * A timeline that auto-plays each scene cinematically, then pauses
 * at the end of each scene waiting for user scroll to continue.
 * 
 * - Scroll is LOCKED during scene playback
 * - Text reveals automatically with smooth animations
 * - User must scroll to advance to next scene
 * - User can scroll back to return to previous scene
 */

type CinematicTimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
  /** Duration of each scene in seconds (default: 20, but will extend to match VO) */
  sceneDuration?: number;
  /** Delay before scene content starts appearing (default: 2s for intro scene) */
  introDelay?: number;
  /** Callback for progress updates */
  onProgressUpdate?: (sceneIndex: number, sceneId: string | null, isWaiting: boolean) => void;
};

type SceneData = {
  element: HTMLElement;
  id: string;
  lines: HTMLElement[];
  title: HTMLElement | null;
  inner: HTMLElement | null;
  voiceOverUrl: string | null;
  voDuration: number; // Will be populated when audio loads
};

export function useCinematicTimeline({
  overlayRef,
  isActive,
  sceneDuration = 20,
  introDelay = 2.5, // Delay before first scene content appears
  onProgressUpdate,
}: CinematicTimelineOptions) {
  const currentSceneIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const isWaitingForScrollRef = useRef(false);
  const scrollAccumulatorRef = useRef(0);
  const sceneTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const audioMapRef = useRef<Record<string, HTMLAudioElement>>({});
  const scenesRef = useRef<SceneData[]>([]);
  const cleanupFnsRef = useRef<(() => void)[]>([]);
  const initializingRef = useRef(false);
  
  const soundStateRef = useRef({ enabled: true, blocked: false });
  const { soundEnabled, soundBlocked } = useSoundSettings();

  useEffect(() => {
    soundStateRef.current = { enabled: soundEnabled, blocked: soundBlocked };
  }, [soundEnabled, soundBlocked]);

  // Reset everything when chapter becomes inactive
  useEffect(() => {
    if (!isActive) {
      console.log("[Cinematic] Chapter inactive - resetting state");
      
      // Kill any running animations
      if (sceneTimelineRef.current) {
        sceneTimelineRef.current.kill();
        sceneTimelineRef.current = null;
      }
      
      // Stop all audio
      Object.values(audioMapRef.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      });
      
      // Reset refs
      currentSceneIndexRef.current = -1;
      isPlayingRef.current = false;
      isWaitingForScrollRef.current = false;
      scrollAccumulatorRef.current = 0;
      initializingRef.current = false;
      
      // Reset debug state
      debugState.isAutoPlaying = false;
      debugState.waitingForScroll = false;
      debugState.canScrollBack = false;
      debugState.activeScene = null;
      
      // Clean up event listeners
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
      
      return;
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Prevent double initialization
    if (initializingRef.current) {
      return;
    }
    initializingRef.current = true;

    let scenes: SceneData[] = [];

    const SCROLL_THRESHOLD = 50; // pixels of scroll needed to trigger scene change

    // Stop all audio
    const stopAllAudio = () => {
      Object.values(audioMapRef.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      });
    };

    // Play scene voiceover
    const playSceneAudio = (sceneId: string, voiceOverUrl: string) => {
      if (!soundStateRef.current.enabled || soundStateRef.current.blocked) return;
      
      stopAllAudio();
      
      if (!audioMapRef.current[sceneId]) {
        const audio = new Audio(voiceOverUrl);
        audio.preload = "auto";
        audioMapRef.current[sceneId] = audio;
        audioSyncRegistry.registerAudio(sceneId, audio);
      }
      
      const audio = audioMapRef.current[sceneId];
      audio.currentTime = 0;
      audio.volume = 0;
      
      gsap.to(audio, { volume: 1, duration: 0.8, ease: "power1.out" });
      audio.play().catch(() => {});
    };

    // Fade out audio
    const fadeOutAudio = (sceneId: string) => {
      const audio = audioMapRef.current[sceneId];
      if (audio) {
        gsap.to(audio, { 
          volume: 0, 
          duration: 0.8, 
          ease: "power1.in",
          onComplete: () => {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      }
    };

    // Create cinematic reveal animation for a scene
    const createSceneTimeline = (scene: SceneData, sceneIndex: number): gsap.core.Timeline => {
      const tl = gsap.timeline({ paused: true });
      
      // For the first scene, add an intro delay for dramatic effect
      const isFirstScene = sceneIndex === 0;
      const contentDelay = isFirstScene ? introDelay : 0.5;
      
      // Determine actual scene duration - use VO duration if available and longer
      // Text should finish with or slightly before VO ends
      const effectiveDuration = scene.voDuration > 0 
        ? Math.max(sceneDuration, scene.voDuration) // Match VO duration exactly
        : sceneDuration;
      
      // Set initial state
      if (scene.inner) {
        tl.set(scene.inner, { autoAlpha: 1 });
      }
      
      // Add initial delay (especially for first scene)
      tl.to({}, { duration: contentDelay });
      
      // Reveal title with dramatic entrance (after the delay)
      if (scene.title) {
        tl.fromTo(
          scene.title,
          { 
            scale: 1.3, 
            autoAlpha: 0, 
            filter: "blur(20px)",
            y: 30
          },
          { 
            scale: 1, 
            autoAlpha: 1, 
            filter: "blur(0px)",
            y: 0,
            duration: 1.8, 
            ease: "power4.out" 
          },
          contentDelay
        );
      }
      
      // Calculate timing for lines based on effective duration
      const linesStartTime = contentDelay + 1.2; // Start lines after title begins
      // Lines should finish with VO - account for line animation duration
      const lastLineAnimDuration = 1.2;
      const availableTime = effectiveDuration - linesStartTime - lastLineAnimDuration;
      
      // Reveal lines one by one with stagger
      if (scene.lines.length > 0) {
        const lineDelay = availableTime / scene.lines.length;
        
        scene.lines.forEach((line, index) => {
          const startTime = linesStartTime + (index * lineDelay);
          
          tl.fromTo(
            line,
            {
              y: 60,
              autoAlpha: 0,
              filter: "blur(10px)",
              scale: 0.95,
            },
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              scale: 1,
              duration: 1.2,
              ease: "power3.out",
            },
            startTime
          );
        });
      }
      
      // Use the already-calculated effectiveDuration for timeline end
      tl.to({}, { duration: 0.1 }, effectiveDuration);
      
      return tl;
    };

    // Play a specific scene
    const playScene = (index: number) => {
      if (index < 0 || index >= scenes.length) return;
      
      const scene = scenes[index];
      currentSceneIndexRef.current = index;
      isPlayingRef.current = true;
      isWaitingForScrollRef.current = false;
      debugState.isAutoPlaying = true;
      debugState.waitingForScroll = false;
      debugState.canScrollBack = index > 0; // Can scroll back if not first scene
      debugState.activeScene = scene.id;
      
      const isFirstScene = index === 0;
      console.log(`[Cinematic] Playing scene ${index + 1}/${scenes.length}: ${scene.id}${isFirstScene ? ' (with intro delay)' : ''}`);
      
      // Hide all other scenes
      scenes.forEach((s, i) => {
        if (i !== index && s.inner) {
          gsap.set(s.inner, { autoAlpha: 0 });
        }
      });
      
      // Kill any existing tweens on this scene's elements to prevent interference
      if (scene.inner) gsap.killTweensOf(scene.inner);
      if (scene.title) gsap.killTweensOf(scene.title);
      scene.lines.forEach(line => gsap.killTweensOf(line));
      
      // Fully reset current scene elements to their initial state
      if (scene.inner) {
        gsap.set(scene.inner, { 
          autoAlpha: 0, 
          y: 0, 
          scale: 1, 
          filter: "blur(0px)" 
        });
      }
      if (scene.title) {
        gsap.set(scene.title, { 
          autoAlpha: 0, 
          y: 30, 
          scale: 1.3, 
          filter: "blur(20px)" 
        });
      }
      scene.lines.forEach(line => {
        gsap.set(line, { 
          autoAlpha: 0, 
          y: 60, 
          scale: 0.95, 
          filter: "blur(10px)" 
        });
      });
      
      // Create and play the scene timeline
      if (sceneTimelineRef.current) {
        sceneTimelineRef.current.kill();
      }
      
      const tl = createSceneTimeline(scene, index);
      sceneTimelineRef.current = tl;
      
      // Play voiceover if available - delay for first scene to sync with title
      const voDelay = isFirstScene ? introDelay : 0.8;
      if (scene.voiceOverUrl) {
        gsap.delayedCall(voDelay, () => {
          playSceneAudio(scene.id, scene.voiceOverUrl!);
        });
      }
      
      // Play the timeline
      tl.play();
      
      // When scene ends, wait for scroll
      tl.eventCallback("onComplete", () => {
        console.log(`[Cinematic] Scene ${scene.id} complete. Waiting for scroll...`);
        isPlayingRef.current = false;
        isWaitingForScrollRef.current = true;
        debugState.isAutoPlaying = false;
        debugState.waitingForScroll = true;
        debugState.canScrollBack = index > 0; // Update scroll back availability
        scrollAccumulatorRef.current = 0;
        
        // Fade out audio
        if (scene.voiceOverUrl) {
          fadeOutAudio(scene.id);
        }
        
        onProgressUpdate?.(index, scene.id, true);
      });
      
      onProgressUpdate?.(index, scene.id, false);
    };

    // Transition to next scene with exit animation
    const transitionToNextScene = () => {
      const currentIndex = currentSceneIndexRef.current;
      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= scenes.length) {
        console.log(`[Cinematic] All scenes complete!`);
        isWaitingForScrollRef.current = false;
        debugState.waitingForScroll = false;
        debugState.canScrollBack = true; // Can still go back at the end
        return;
      }
      
      const currentScene = scenes[currentIndex];
      
      // Exit animation for current scene
      if (currentScene && currentScene.inner) {
        gsap.to(currentScene.inner, {
          y: -80,
          autoAlpha: 0,
          scale: 1.05,
          filter: "blur(20px)",
          duration: 0.8,
          ease: "power3.in",
          onComplete: () => {
            // Play next scene after exit animation
            playScene(nextIndex);
          }
        });
      } else {
        playScene(nextIndex);
      }
    };

    // Transition to previous scene with exit animation (scroll back)
    const transitionToPreviousScene = () => {
      const currentIndex = currentSceneIndexRef.current;
      const prevIndex = currentIndex - 1;
      
      if (prevIndex < 0) {
        console.log(`[Cinematic] Already at first scene, cannot go back`);
        return;
      }
      
      console.log(`[Cinematic] Going back to scene ${prevIndex + 1}`);
      
      // Stop current audio if playing
      const currentScene = scenes[currentIndex];
      if (currentScene?.voiceOverUrl) {
        fadeOutAudio(currentScene.id);
      }
      
      // Kill current timeline
      if (sceneTimelineRef.current) {
        sceneTimelineRef.current.kill();
        sceneTimelineRef.current = null;
      }
      
      // Reset state
      isPlayingRef.current = false;
      isWaitingForScrollRef.current = false;
      
      // Exit animation for current scene (downward motion since going back)
      if (currentScene && currentScene.inner) {
        // Kill any ongoing tweens on current scene elements
        gsap.killTweensOf(currentScene.inner);
        gsap.killTweensOf(currentScene.title);
        currentScene.lines.forEach(line => gsap.killTweensOf(line));
        
        gsap.to(currentScene.inner, {
          y: 80, // Move down (opposite of forward)
          autoAlpha: 0,
          scale: 1.05,
          filter: "blur(20px)",
          duration: 0.6,
          ease: "power3.in",
          onComplete: () => {
            // Fully reset current scene elements after exit
            gsap.set(currentScene.inner, { y: 0, scale: 1, filter: "blur(0px)" });
            playScene(prevIndex);
          }
        });
      } else {
        playScene(prevIndex);
      }
    };

    // Skip to next scene (can be called during playback)
    const skipToNextScene = () => {
      const currentIndex = currentSceneIndexRef.current;
      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= scenes.length) {
        console.log(`[Cinematic] Already at last scene, cannot skip forward`);
        return;
      }
      
      console.log(`[Cinematic] Skipping to scene ${nextIndex + 1}`);
      
      // Stop current audio if playing
      const currentScene = scenes[currentIndex];
      if (currentScene?.voiceOverUrl) {
        fadeOutAudio(currentScene.id);
      }
      
      // Kill current timeline
      if (sceneTimelineRef.current) {
        sceneTimelineRef.current.kill();
        sceneTimelineRef.current = null;
      }
      
      // Reset state
      isPlayingRef.current = false;
      isWaitingForScrollRef.current = false;
      debugState.waitingForScroll = false;
      
      // Quick exit animation
      if (currentScene && currentScene.inner) {
        gsap.killTweensOf(currentScene.inner);
        gsap.killTweensOf(currentScene.title);
        currentScene.lines.forEach(line => gsap.killTweensOf(line));
        
        gsap.to(currentScene.inner, {
          y: -80,
          autoAlpha: 0,
          scale: 1.05,
          filter: "blur(20px)",
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(currentScene.inner, { y: 0, scale: 1, filter: "blur(0px)" });
            playScene(nextIndex);
          }
        });
      } else {
        playScene(nextIndex);
      }
    };

    // Skip to previous scene (can be called during playback)  
    const skipToPreviousScene = () => {
      const currentIndex = currentSceneIndexRef.current;
      const prevIndex = currentIndex - 1;
      
      if (prevIndex < 0) {
        console.log(`[Cinematic] Already at first scene, cannot go back`);
        return;
      }
      
      console.log(`[Cinematic] Skipping back to scene ${prevIndex + 1}`);
      
      // Stop current audio if playing
      const currentScene = scenes[currentIndex];
      if (currentScene?.voiceOverUrl) {
        fadeOutAudio(currentScene.id);
      }
      
      // Kill current timeline
      if (sceneTimelineRef.current) {
        sceneTimelineRef.current.kill();
        sceneTimelineRef.current = null;
      }
      
      // Reset state
      isPlayingRef.current = false;
      isWaitingForScrollRef.current = false;
      debugState.waitingForScroll = false;
      
      // Quick exit animation
      if (currentScene && currentScene.inner) {
        gsap.killTweensOf(currentScene.inner);
        gsap.killTweensOf(currentScene.title);
        currentScene.lines.forEach(line => gsap.killTweensOf(line));
        
        gsap.to(currentScene.inner, {
          y: 80,
          autoAlpha: 0,
          scale: 1.05,
          filter: "blur(20px)",
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(currentScene.inner, { y: 0, scale: 1, filter: "blur(0px)" });
            playScene(prevIndex);
          }
        });
      } else {
        playScene(prevIndex);
      }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to next scene with 's' key
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        skipToNextScene();
      }
      // Go back to previous scene with 'b' key
      else if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        skipToPreviousScene();
      }
    };

    // Track scroll direction for back functionality
    let scrollBackAccumulator = 0;

    // Handle scroll input (only when waiting)
    const handleWheel = (event: WheelEvent) => {
      // Block all scroll during scene playback
      if (isPlayingRef.current) {
        event.preventDefault();
        return;
      }
      
      // If waiting for scroll, accumulate and check threshold
      if (isWaitingForScrollRef.current) {
        event.preventDefault();
        
        if (event.deltaY > 0) { // Forward scroll
          scrollBackAccumulator = 0; // Reset back accumulator
          scrollAccumulatorRef.current += Math.abs(event.deltaY);
          
          if (scrollAccumulatorRef.current >= SCROLL_THRESHOLD) {
            isWaitingForScrollRef.current = false;
            debugState.waitingForScroll = false;
            scrollAccumulatorRef.current = 0;
            transitionToNextScene();
          }
        } else if (event.deltaY < 0 && currentSceneIndexRef.current > 0) { // Backward scroll
          scrollAccumulatorRef.current = 0; // Reset forward accumulator
          scrollBackAccumulator += Math.abs(event.deltaY);
          
          if (scrollBackAccumulator >= SCROLL_THRESHOLD) {
            isWaitingForScrollRef.current = false;
            debugState.waitingForScroll = false;
            scrollBackAccumulator = 0;
            transitionToPreviousScene();
          }
        }
      }
    };

    // Handle touch for mobile
    let touchStartY = 0;
    
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isPlayingRef.current) {
        event.preventDefault();
        return;
      }
      
      if (isWaitingForScrollRef.current) {
        const currentY = event.touches[0]?.clientY ?? 0;
        const delta = touchStartY - currentY;
        touchStartY = currentY;
        
        if (delta > 0) { // Forward swipe
          scrollBackAccumulator = 0;
          scrollAccumulatorRef.current += Math.abs(delta);
          
          if (scrollAccumulatorRef.current >= SCROLL_THRESHOLD) {
            isWaitingForScrollRef.current = false;
            debugState.waitingForScroll = false;
            scrollAccumulatorRef.current = 0;
            transitionToNextScene();
          }
        } else if (delta < 0 && currentSceneIndexRef.current > 0) { // Backward swipe
          scrollAccumulatorRef.current = 0;
          scrollBackAccumulator += Math.abs(delta);
          
          if (scrollBackAccumulator >= SCROLL_THRESHOLD) {
            isWaitingForScrollRef.current = false;
            debugState.waitingForScroll = false;
            scrollBackAccumulator = 0;
            transitionToPreviousScene();
          }
        }
      }
    };

    // Initialize
    const init = () => {
      if (!overlayRef.current) {
        requestAnimationFrame(init);
        return;
      }

      // Gather all scenes
      const sceneElements = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(".narrativeScene")
      );

      scenes = sceneElements.map((element) => {
        const id = Array.from(element.classList).find((c) => c.startsWith("scene-")) || "";
        const lines = Array.from(element.querySelectorAll<HTMLElement>(".narrativeLine"));
        const title = element.querySelector<HTMLElement>(".narrativeTitle");
        const inner = element.querySelector<HTMLElement>(".narrativeSceneInner");
        const voiceOverUrl = element.dataset.voiceover || null;
        
        return { element, id, lines, title, inner, voiceOverUrl, voDuration: 0 };
      });

      if (scenes.length === 0) {
        console.warn("[Cinematic] No scenes found!");
        initializingRef.current = false;
        return;
      }

      console.log(`[Cinematic] Found ${scenes.length} scenes`);
      scenesRef.current = scenes;

      // Hide all scene content initially
      scenes.forEach((scene) => {
        if (scene.inner) gsap.set(scene.inner, { autoAlpha: 0 });
      });

      // Preload audio and get durations
      const audioLoadPromises = scenes.map((scene) => {
        if (!scene.voiceOverUrl) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audio = new Audio();
          audio.preload = "metadata";
          audio.src = scene.voiceOverUrl!;
          
          audio.addEventListener("loadedmetadata", () => {
            scene.voDuration = audio.duration;
            console.log(`[Cinematic] ${scene.id} VO duration: ${audio.duration.toFixed(1)}s`);
            audioMapRef.current[scene.id] = audio;
            audioSyncRegistry.registerAudio(scene.id, audio);
            resolve();
          });
          
          audio.addEventListener("error", () => {
            console.warn(`[Cinematic] Failed to load audio for ${scene.id}`);
            resolve();
          });
          
          // Timeout fallback
          setTimeout(() => resolve(), 3000);
        });
      });

      // Add event listeners
      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("keydown", handleKeyDown);

      cleanupFnsRef.current.push(() => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("keydown", handleKeyDown);
      });

      // Wait for audio to load, then start first scene
      Promise.all(audioLoadPromises).then(() => {
        console.log(`[Cinematic] Audio preloaded, starting scene 1`);
        gsap.delayedCall(0.3, () => {
          playScene(0);
        });
      });
    };

    init();

    // Cleanup
    return () => {
      initializingRef.current = false;
      
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
      
      if (sceneTimelineRef.current) {
        sceneTimelineRef.current.kill();
        sceneTimelineRef.current = null;
      }
      
      stopAllAudio();
      
      Object.keys(audioMapRef.current).forEach(sceneId => {
        audioSyncRegistry.unregisterAudio(sceneId);
      });
      
      gsap.killTweensOf("*");
    };
  }, [isActive, sceneDuration, introDelay, onProgressUpdate, overlayRef]);

  return {
    currentSceneIndex: currentSceneIndexRef.current,
    isPlaying: isPlayingRef.current,
    isWaitingForScroll: isWaitingForScrollRef.current,
  };
}
