import { useEffect, useRef, useState, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import gsap from "gsap";
import { getCameraAngle, MAX_CHAPTER1_CAMERA_INDEX } from "../data/cameraAngles";

type UseScrollCameraProps = {
  isActive: boolean;
  narrativeRef: RefObject<HTMLDivElement>;
  enabled: boolean;
};

export function useScrollCamera({ isActive, narrativeRef, enabled }: UseScrollCameraProps) {
  const { camera } = useThree();
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const hasUserScrolledRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const introTweenRef = useRef<gsap.core.Timeline | null>(null);
  const introCompleteRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeParagraphIndex;
  }, [activeParagraphIndex]);

  useEffect(() => {
    if (!isActive || !enabled || !narrativeRef.current) {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    hasUserScrolledRef.current = false;
    activeIndexRef.current = 0;
    setActiveParagraphIndex(0);
    introCompleteRef.current = false;

    introTweenRef.current?.kill();
    introTweenRef.current = null;

    const introAngle = getCameraAngle(0);
    const introStart: [number, number, number] = [1.82, -4.99, 1.24];
    camera.position.set(...introStart);
    camera.lookAt(...introAngle.target);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = introAngle.fov ?? 78;
      camera.updateProjectionMatrix();
    }

    const introTl = gsap.timeline({
      onComplete: () => {
        introCompleteRef.current = true;
      },
    });
    introTweenRef.current = introTl;

    introTl.to(camera.position, {
      x: introAngle.position[0],
      y: introAngle.position[1],
      z: introAngle.position[2],
      duration: introAngle.duration ?? 5.6,
      ease: introAngle.ease ?? "power2.inOut",
      onUpdate: () => {
        camera.lookAt(introAngle.target[0], introAngle.target[1], introAngle.target[2]);
      },
    });

    if (introAngle.fov && camera instanceof PerspectiveCamera) {
      introTl.to(
        camera,
        {
          fov: introAngle.fov,
          duration: introAngle.duration ?? 5.6,
          ease: introAngle.ease ?? "power2.inOut",
          onUpdate: () => {
            camera.updateProjectionMatrix();
          },
        },
        0
      );
    }

    const paragraphs = Array.from(
      narrativeRef.current.querySelectorAll<HTMLElement>("p.narrativeLine")
    );
    if (paragraphs.length === 0) {
      return;
    }

    const maxIndex = Math.min(MAX_CHAPTER1_CAMERA_INDEX, paragraphs.length - 1);

    const handleUserScroll = () => {
      hasUserScrolledRef.current = true;
    };

    const tick = () => {
      if (!hasUserScrolledRef.current) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      let bestIndex = activeIndexRef.current;
      let bestOpacity = 0;

      for (let i = 0; i <= maxIndex; i += 1) {
        const element = paragraphs[i];
        const style = window.getComputedStyle(element);
        if (style.visibility === "hidden" || style.display === "none") {
          continue;
        }

        const opacity = Number.parseFloat(style.opacity || "0");
        if (opacity > bestOpacity) {
          bestOpacity = opacity;
          bestIndex = i;
        }
      }

      if (bestOpacity >= 0.2 && bestIndex !== activeIndexRef.current) {
        activeIndexRef.current = bestIndex;
        setActiveParagraphIndex(bestIndex);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("wheel", handleUserScroll, { passive: true });
    window.addEventListener("touchmove", handleUserScroll, { passive: true });

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("wheel", handleUserScroll);
      window.removeEventListener("touchmove", handleUserScroll);
      introTweenRef.current?.kill();
      introTweenRef.current = null;
    };
  }, [enabled, isActive, narrativeRef]);

  useEffect(() => {
    if (!isActive || !enabled) {
      return;
    }

    if (activeParagraphIndex === 0 && !introCompleteRef.current) {
      return;
    }

    const angle = getCameraAngle(activeParagraphIndex);
    timelineRef.current?.kill();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    tl.to(camera.position, {
      x: angle.position[0],
      y: angle.position[1],
      z: angle.position[2],
      duration: angle.duration ?? 2,
      ease: angle.ease ?? "power2.inOut",
      onUpdate: () => {
        camera.lookAt(angle.target[0], angle.target[1], angle.target[2]);
      },
    });

    if (angle.fov && camera instanceof PerspectiveCamera) {
      tl.to(
        camera,
        {
          fov: angle.fov,
          duration: angle.duration ?? 2,
          ease: angle.ease ?? "power2.inOut",
          onUpdate: () => {
            camera.updateProjectionMatrix();
          },
        },
        0
      );
    }

    return () => {
      tl.kill();
    };
  }, [activeParagraphIndex, camera, enabled, isActive]);

  return { activeParagraphIndex };
}
