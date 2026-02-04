import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { useSoundSettings } from "../../../soundContext";
import { chapter1DirectorTrack } from "./data/directorTrack";

type Chapter1TimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
};

export function useChapter1Timeline(options: Chapter1TimelineOptions) {
  const { overlayRef, isActive } = options;
  const scrollProgressRef = useRef(0);
  const scrollEnabledRef = useRef(false);
  const totalDurationRef = useRef(0);
  const actRangesRef = useRef<
    Array<{
      sceneId: string;
      start: number;
      end: number;
      audioUrl?: string | null;
      audioGroup?: string;
    }>
  >([]);
  const audioMapRef = useRef<Record<string, HTMLAudioElement>>({});
  const activeSceneRef = useRef<string | null>(null);
  const activeAudioGroupRef = useRef<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundStateRef = useRef({ enabled: true, blocked: false });
  const stopAllAudioRef = useRef<() => void>(() => {});
  const voDelayedCallRef = useRef<gsap.core.Tween | null>(null);

  const { soundEnabled, soundBlocked } = useSoundSettings();

  useEffect(() => {
    soundStateRef.current = { enabled: soundEnabled, blocked: soundBlocked };
    if (!soundEnabled || soundBlocked) {
      stopAllAudioRef.current();
    }
  }, [soundEnabled, soundBlocked]);

  useEffect(() => {
    if (!isActive) {
      scrollEnabledRef.current = false;
      scrollProgressRef.current = 0;
      stopAllAudioRef.current();
      return;
    }

    let ctx: gsap.Context | null = null;
    let rafId = 0;
    let timeline: gsap.core.Timeline | null = null;
    let touchStartY = 0;

    const stopAllAudio = () => {
      Object.values(audioMapRef.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      });
      activeSceneRef.current = null;
      activeAudioRef.current = null;
      activeAudioGroupRef.current = null;
    };
    
    // Full cleanup - called only on unmount/deactivation
    const fullCleanup = () => {
      // Kill any pending delayed calls
      if (voDelayedCallRef.current) {
        voDelayedCallRef.current.kill();
        voDelayedCallRef.current = null;
      }
      // Kill all audio tweens
      Object.values(audioMapRef.current).forEach((audio) => {
        gsap.killTweensOf(audio);
      });
      stopAllAudio();
    };
    
    stopAllAudioRef.current = fullCleanup;

    const syncAudio = (progress: number) => {
      const { enabled, blocked } = soundStateRef.current;
      if (!enabled || blocked) {
        stopAllAudio();
        return;
      }

      const totalDuration = totalDurationRef.current;
      if (totalDuration <= 0) {
        stopAllAudio();
        return;
      }

      const currentTime = progress * totalDuration;
      const activeAct = actRangesRef.current.find(
        (act) => currentTime >= act.start && currentTime <= act.end
      );

      const activeGroup = activeAct?.audioGroup ?? activeAct?.sceneId ?? null;
      if (!activeAct || !activeGroup) {
        stopAllAudio();
        return;
      }

      const audioMap = audioMapRef.current;
      const audioSource = actRangesRef.current.find(
        (act) => (act.audioGroup ?? act.sceneId) === activeGroup && act.audioUrl
      );
      if (!audioSource?.audioUrl) {
        stopAllAudio();
        return;
      }

      let audio = audioMap[activeGroup];
      if (!audio) {
        audio = new Audio(audioSource.audioUrl);
        audio.preload = "auto";
        audio.volume = 0;
        audioMap[activeGroup] = audio;
      }

      if (activeAudioGroupRef.current !== activeGroup) {
        const previousAudio = activeAudioRef.current;
        if (previousAudio && !previousAudio.paused) {
          gsap.killTweensOf(previousAudio);
          gsap.to(previousAudio, {
            volume: 0,
            duration: chapter1DirectorTrack.fadeDuration,
            ease: "power1.in",
            onComplete: () => {
              previousAudio.pause();
              previousAudio.currentTime = 0;
            },
          });
        }

        gsap.killTweensOf(audio);
        audio.currentTime = 0;
        audio.volume = 0;
        
        // Kill any existing delayed call before creating new one
        if (voDelayedCallRef.current) {
          voDelayedCallRef.current.kill();
        }
        
        // 2 second delay before voice over starts for cinematic pacing
        voDelayedCallRef.current = gsap.delayedCall(2, () => {
          // Double-check we're still active before playing
          // Note: isActive is checked via the effect dependency, so we just check sound state
          if (soundStateRef.current.blocked || !soundStateRef.current.enabled) {
            return;
          }
          const playPromise = audio.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
          gsap.to(audio, {
            volume: 1,
            duration: chapter1DirectorTrack.fadeDuration,
            ease: "power1.out",
          });
        });

        activeSceneRef.current = activeAct.sceneId;
        activeAudioRef.current = audio;
        activeAudioGroupRef.current = activeGroup;
      }
    };

    const setProgress = (nextProgress: number) => {
      if (!timeline) {
        return;
      }
      timeline.progress(nextProgress);
      scrollProgressRef.current = nextProgress;
      syncAudio(nextProgress);
    };

    const updateFromDelta = (delta: number) => {
      if (!timeline || !scrollEnabledRef.current) {
        return;
      }
      // Reduced scroll sensitivity for smoother feel
      const smoothedDelta = delta * 0.35;
      const rawProgress = scrollProgressRef.current + smoothedDelta;
      const clamped = gsap.utils.clamp(0, 1, rawProgress);
      setProgress(clamped);
    };

    const startTimeline = () => {
      if (!overlayRef.current) {
        rafId = window.requestAnimationFrame(startTimeline);
        return;
      }

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ paused: true });
        timeline = tl;

        const acts = chapter1DirectorTrack.acts;
        let cursor = 0;
        const ranges: Array<{
          sceneId: string;
          start: number;
          end: number;
          audioUrl?: string | null;
          audioGroup?: string;
        }> = [];

        tl.set(".narrativeSceneInner", { autoAlpha: 0 });

        acts.forEach((act, index) => {
          const sceneSelector = `.narrativeScene.${act.sceneId}`;
          const innerSelector = `${sceneSelector} .narrativeSceneInner`;
          const titleSelector = `${sceneSelector} .narrativeTitle`;
          const lineSelector = `${sceneSelector} .narrativeLine`;

          const start = cursor;
          const end = start + act.duration;
          ranges.push({
            sceneId: act.sceneId,
            start,
            end,
            audioUrl: act.audioUrl,
            audioGroup: act.audioGroup,
          });

          tl.set(innerSelector, { autoAlpha: 1 }, start);
          tl.fromTo(
            titleSelector,
            { scale: 1.2, autoAlpha: 0, filter: "blur(12px)" },
            {
              scale: 1,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 2,
              ease: "power4.out",
            },
            start + 0.2
          );

          const lines = overlayRef.current?.querySelectorAll<HTMLElement>(lineSelector) ?? [];
          const pauseMap = new Map(
            (act.pauses ?? []).map((pause) => [pause.afterLine, pause.duration])
          );
          const totalPause = (act.pauses ?? []).reduce(
            (sum, pause) => sum + pause.duration,
            0
          );
          const lineStart = start + (act.lineStart ?? 0);
          const tailHold = act.tailHold ?? 0;
          const available = Math.max(
            0.1,
            act.duration - (act.lineStart ?? 0) - tailHold - totalPause
          );
          const lineSpacing = lines.length > 0 ? available / lines.length : available;
          const lineDuration = Math.min(1.6, Math.max(0.4, lineSpacing * 0.9));
          let time = lineStart;

          lines.forEach((line, lineIndex) => {
            // Smoother, more cinematic fade-in animation
            tl.fromTo(
              line,
              {
                y: 45,
                rotateX: -15,
                autoAlpha: 0,
                filter: "blur(12px)",
                scale: 0.92,
              },
              {
                y: 0,
                rotateX: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                scale: 1,
                duration: lineDuration * 1.8,
                ease: "power2.out",
              },
              time
            );
            time += lineSpacing * 1.2; // Slower spacing between lines
            const pauseDuration = pauseMap.get(lineIndex);
            if (pauseDuration) {
              time += pauseDuration;
            }
          });

          if (index < acts.length - 1) {
            // Smoother fade-out animation
            tl.to(
              innerSelector,
              {
                y: -50,
                autoAlpha: 0,
                scale: 1.06,
                filter: "blur(18px)",
                duration: chapter1DirectorTrack.fadeDuration * 1.5,
                ease: "power2.inOut",
              },
              end - chapter1DirectorTrack.fadeDuration * 1.5
            );
          }

          cursor = end;
        });

        totalDurationRef.current = cursor;
        actRangesRef.current = ranges;

        scrollEnabledRef.current = false;
        scrollProgressRef.current = 0;
        tl.progress(0);

        const autoAdvanceSeconds = Math.max(0, chapter1DirectorTrack.autoAdvanceSeconds);
        const targetProgress =
          cursor > 0 ? Math.min(autoAdvanceSeconds / cursor, 1) : 0;

        gsap.to(tl, {
          progress: targetProgress,
          duration: Math.max(autoAdvanceSeconds, 0.01),
          ease: "power1.inOut",
          onUpdate: () => {
            scrollProgressRef.current = tl.progress();
            syncAudio(tl.progress());
          },
          onComplete: () => {
            scrollEnabledRef.current = true;
            scrollProgressRef.current = targetProgress;
            syncAudio(targetProgress);
          },
        });
      }, overlayRef);

      timeline?.progress(scrollProgressRef.current);
    };

    startTimeline();

    const handleWheel = (event: WheelEvent) => {
      if (!timeline) {
        return;
      }
      if (!scrollEnabledRef.current) {
        return;
      }
      event.preventDefault();
      updateFromDelta(event.deltaY / 2500);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!timeline || !scrollEnabledRef.current) {
        return;
      }
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = (touchStartY - currentY) / 800;
      touchStartY = currentY;
      updateFromDelta(delta);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      
      // Full cleanup including delayed calls and tweens
      fullCleanup();
      ctx?.revert();
    };
  }, [isActive, overlayRef]);
}
