import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter1Scenes } from "./data";
import "./Chapter1.css";
import scene5VideoUrl from "./media/YTDowncom_YouTube_Winners-SIN-PARAR_Media_BHXUJHnWveE_001_1080p (online-video-cutter.com).mp4?url";

type Chapter1NarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function Chapter1Narrative({ isActive, overlayRef }: Chapter1NarrativeProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoOpacityRef = useRef(0);
  const scene5ElementRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeSceneRef = useRef<HTMLElement | null>(null);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (portalRootRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene5VideoPortal";
    portalRoot.style.position = "fixed";
    portalRoot.style.top = "0";
    portalRoot.style.left = "0";
    portalRoot.style.width = "100vw";
    portalRoot.style.height = "100vh";
    portalRoot.style.margin = "0";
    portalRoot.style.padding = "0";
    const layer = document.createElement("div");
    layer.className = "chapter1Scene5VideoLayer";
    const video = document.createElement("video");
    video.className = "chapter1Scene5Video";
    video.src = scene5VideoUrl;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";
    layer.appendChild(video);
    portalRoot.appendChild(layer);
    document.body.appendChild(portalRoot);
    portalRootRef.current = portalRoot;
    videoRef.current = video;

    const tick = () => {
      if (!scene5ElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene5ElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-5 .narrativeSceneInner") ??
            null;
        }
      }
      const overlayRoot =
        overlayRef.current ??
        (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
      if (overlayRoot) {
        const scenes = Array.from(
          overlayRoot.querySelectorAll<HTMLElement>(".narrativeScene")
        );
        let bestScene: HTMLElement | null = null;
        let bestOpacity = 0;
        scenes.forEach((scene) => {
          const inner = scene.querySelector<HTMLElement>(".narrativeSceneInner");
          if (!inner) {
            return;
          }
          const rawOpacity = gsap.getProperty(inner, "autoAlpha");
          const opacityValue =
            typeof rawOpacity === "number"
              ? rawOpacity
              : Number.parseFloat(String(rawOpacity));
          const resolvedOpacity = Number.isFinite(opacityValue) ? opacityValue : 0;
          if (resolvedOpacity > bestOpacity) {
            bestOpacity = resolvedOpacity;
            bestScene = scene;
          }
        });
        activeSceneRef.current = bestScene;
      }

      const element = scene5ElementRef.current;
      let targetOpacity = 0;
      if (element) {
        const rawAutoAlpha = gsap.getProperty(element, "autoAlpha");
        const autoAlphaValue =
          typeof rawAutoAlpha === "number"
            ? rawAutoAlpha
            : Number.parseFloat(String(rawAutoAlpha));
        const rawOpacity = gsap.getProperty(element, "opacity");
        const opacityValue =
          typeof rawOpacity === "number"
            ? rawOpacity
            : Number.parseFloat(String(rawOpacity));
        const resolvedOpacity = Number.isFinite(autoAlphaValue)
          ? autoAlphaValue
          : Number.isFinite(opacityValue)
            ? opacityValue
            : 0;
        targetOpacity =
          element.style.visibility === "hidden"
            ? 0
            : Math.min(Math.max(resolvedOpacity, 0), 1);
      }

      const current = videoOpacityRef.current;
      const next = current + (targetOpacity - current) * 0.02;
      videoOpacityRef.current = next;
      video.style.opacity = String(next);
      video.style.visibility = next > 0.01 ? "visible" : "hidden";

      if (next > 0.05) {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        }
      } else if (!video.paused) {
        video.pause();
        video.currentTime = 0;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      video.pause();
      video.currentTime = 0;
      portalRoot.remove();
      portalRootRef.current = null;
      videoRef.current = null;
    };
  }, [overlayRef]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const scene = activeSceneRef.current;
      if (!scene) {
        return;
      }

      if (event.key.toLowerCase() === "t") {
        const x = Number.parseFloat(
          scene.style.getPropertyValue("--scene-x") || "0"
        );
        const y = Number.parseFloat(
          scene.style.getPropertyValue("--scene-y") || "0"
        );
        console.log(
          `${scene.className.split(" ").find((name) => name.startsWith("scene-"))} position: { x: ${x}, y: ${y} }`
        );
        return;
      }

      const isArrow = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(event.key);
      if (!isArrow) {
        return;
      }

      event.preventDefault();
      const step = event.shiftKey ? 20 : 8;
      const currentX = Number.parseFloat(
        scene.style.getPropertyValue("--scene-x") || "0"
      );
      const currentY = Number.parseFloat(
        scene.style.getPropertyValue("--scene-y") || "0"
      );

      let nextX = currentX;
      let nextY = currentY;
      if (event.key === "ArrowLeft") {
        nextX -= step;
      } else if (event.key === "ArrowRight") {
        nextX += step;
      } else if (event.key === "ArrowUp") {
        nextY -= step;
      } else if (event.key === "ArrowDown") {
        nextY += step;
      }

      scene.style.setProperty("--scene-x", `${nextX}px`);
      scene.style.setProperty("--scene-y", `${nextY}px`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  return (
    <>
      <NarrativeOverlay
        isActive={isActive}
        overlayRef={overlayRef}
        scenes={chapter1Scenes}
        overlayClassName="chapter1Overlay"
        sceneClassName="chapter1Scene"
        titleClassName="chapter1Title"
        lineClassName="chapter1Line"
      />
    </>
  );
}
