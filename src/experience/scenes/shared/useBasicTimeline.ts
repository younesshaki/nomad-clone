import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { useSoundSettings } from "../../soundContext";

type BasicTimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
  introDuration?: number;
  introRevealLead?: number;
};

type VoiceOverMap = Record<string, HTMLAudioElement>;

export function useBasicTimeline({
  overlayRef,
  isActive,
  introDuration,
  introRevealLead,
}: BasicTimelineOptions) {
  const scrollProgressRef = useRef(0);
  const scrollEnabledRef = useRef(false);
  const soundStateRef = useRef({ enabled: true, blocked: false });
  const { soundEnabled, soundBlocked } = useSoundSettings();

  useEffect(() => {
    soundStateRef.current = { enabled: soundEnabled, blocked: soundBlocked };
  }, [soundEnabled, soundBlocked]);

  useEffect(() => {
    if (!isActive) {
      scrollEnabledRef.current = false;
      scrollProgressRef.current = 0;
      return;
    }

    let ctx: gsap.Context | null = null;
    let rafId = 0;
    let timeline: gsap.core.Timeline | null = null;
    let touchStartY = 0;
    let minScrollProgress = 0;
    let maxScrollProgress = 1;

    const audioMap: VoiceOverMap = {};

    const stopAllAudio = () => {
      Object.values(audioMap).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      });
    };

    const getSceneId = (element: HTMLElement) =>
      Array.from(element.classList).find((name) => name.startsWith("scene-"));

    const startTimeline = () => {
      if (!overlayRef.current) {
        rafId = window.requestAnimationFrame(startTimeline);
        return;
      }

      ctx = gsap.context(() => {
        const fadeDuration = 1.1;
        const sceneDuration = 22;
        const overlap = 4;
        const step = Math.max(sceneDuration - overlap, 1);
        const audioFade = 0.8;

        const sceneEntries = Array.from(
          overlayRef.current?.querySelectorAll<HTMLElement>(".narrativeScene") ?? []
        )
          .map((scene) => ({ element: scene, id: getSceneId(scene) }))
          .filter(
            (entry): entry is { element: HTMLElement; id: string } => Boolean(entry.id)
          );

        if (sceneEntries.length === 0) {
          return;
        }

        const introHold = Math.max(
          0,
          introDuration ?? Math.min(5, sceneDuration * 0.45)
        );
        const revealLead = Math.max(0, introRevealLead ?? 0);
        const timelineOffset = Math.max(0, introHold - revealLead);
        const totalDuration =
          timelineOffset + sceneDuration + step * (sceneEntries.length - 1);
        const MIN_SCROLL_PROGRESS = timelineOffset / totalDuration;
        const MAX_SCROLL_PROGRESS = 1;

        const tl = gsap.timeline({ paused: true });
        timeline = tl;
        minScrollProgress = MIN_SCROLL_PROGRESS;
        maxScrollProgress = MAX_SCROLL_PROGRESS;

        const cinematicReveal = (selector: string, startTime: number, stagger = 0.15) => {
          tl.fromTo(
            selector,
            {
              y: 50,
              rotateX: -20,
              autoAlpha: 0,
              filter: "blur(8px)",
              scale: 0.95,
            },
            {
              y: 0,
              rotateX: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              scale: 1,
              duration: 1.6,
              ease: "power3.out",
              stagger,
            },
            startTime
          );
        };

        const revealTitle = (selector: string, startTime: number) => {
          tl.fromTo(
            selector,
            { scale: 1.2, autoAlpha: 0, filter: "blur(12px)" },
            { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 2, ease: "power4.out" },
            startTime
          );
        };

        const revealScene = (sceneSelector: string, startTime: number, lineStagger = 0.2) => {
          const innerSelector = `${sceneSelector} .narrativeSceneInner`;
          tl.set(innerSelector, { autoAlpha: 1 }, startTime);
          revealTitle(`${sceneSelector} .narrativeTitle`, startTime + 0.3);
          cinematicReveal(`${sceneSelector} .narrativeLine`, startTime + 0.6, lineStagger);
        };

        const exitScene = (sceneSelector: string, endTime: number) => {
          const innerSelector = `${sceneSelector} .narrativeSceneInner`;
          tl.to(
            innerSelector,
            {
              y: -60,
              autoAlpha: 0,
              scale: 1.08,
              filter: "blur(15px)",
              duration: fadeDuration,
              ease: "power3.in",
            },
            endTime - fadeDuration
          );
        };

        const scheduleVoiceOver = (
          sceneId: string,
          sceneEl: HTMLElement,
          start: number,
          end: number
        ) => {
          const voiceOverUrl = sceneEl.dataset.voiceover;
          if (!voiceOverUrl) {
            return;
          }

          const startOffset = Number.parseFloat(sceneEl.dataset.voiceoverStart ?? "0") || 0;
          const endOffset = Number.parseFloat(sceneEl.dataset.voiceoverEnd ?? "0") || 0;
          const audioStart = start + startOffset;
          const audioEnd = Math.max(audioStart + audioFade, end - endOffset);

          if (!audioMap[sceneId]) {
            const audio = new Audio(voiceOverUrl);
            audio.preload = "auto";
            audio.volume = 0;
            audioMap[sceneId] = audio;
          }

          const audio = audioMap[sceneId];

          tl.call(() => {
            if (!soundStateRef.current.enabled || soundStateRef.current.blocked) {
              return;
            }
            stopAllAudio();
            audio.currentTime = 0;
            audio.volume = 0;
            const playPromise = audio.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          }, undefined, audioStart);

          tl.to(
            audio,
            {
              volume: 1,
              duration: audioFade,
              ease: "power1.out",
            },
            audioStart
          );

          tl.to(
            audio,
            {
              volume: 0,
              duration: audioFade,
              ease: "power1.in",
            },
            Math.max(audioEnd - audioFade, audioStart + audioFade)
          );

          tl.call(() => {
            audio.pause();
            audio.currentTime = 0;
          }, undefined, audioEnd);
        };

        tl.set(".narrativeSceneInner", { autoAlpha: 0 });

        sceneEntries.forEach((entry, index) => {
          const start = timelineOffset + index * step;
          const end = start + sceneDuration;
          const sceneSelector = `.narrativeScene.${entry.id}`;

          revealScene(sceneSelector, start, 0.2);
          if (index < sceneEntries.length - 1) {
            exitScene(sceneSelector, end);
          }
          scheduleVoiceOver(entry.id, entry.element, start, end);
        });

        scrollEnabledRef.current = false;
        scrollProgressRef.current = 0;
        tl.progress(0);

        gsap.fromTo(
          tl,
          { progress: 0 },
          {
            progress: MIN_SCROLL_PROGRESS,
            duration: introHold || 0.01,
            ease: "power2.inOut",
            onUpdate: () => {
              scrollProgressRef.current = tl.progress();
            },
            onComplete: () => {
              scrollEnabledRef.current = true;
              scrollProgressRef.current = MIN_SCROLL_PROGRESS;
            },
          }
        );
      }, overlayRef);

      timeline?.progress(scrollProgressRef.current);
    };

    startTimeline();

    const updateFromDelta = (delta: number) => {
      if (!timeline || !scrollEnabledRef.current) {
        return;
      }
      const rawProgress = scrollProgressRef.current + delta;
      scrollProgressRef.current = gsap.utils.clamp(
        minScrollProgress,
        maxScrollProgress,
        rawProgress
      );
      timeline.progress(scrollProgressRef.current);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!timeline) {
        return;
      }
      event.preventDefault();
      updateFromDelta(event.deltaY / 2500);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!timeline) {
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
      stopAllAudio();
      ctx?.revert();
    };
  }, [isActive]);
}
