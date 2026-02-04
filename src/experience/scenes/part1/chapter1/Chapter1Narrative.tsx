import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter1Scenes } from "./data";
import "./Chapter1.css";
import scene5VideoUrl from "./media/YTDowncom_YouTube_Winners-SIN-PARAR_Media_BHXUJHnWveE_001_1080p (online-video-cutter.com).mp4?url";
import { scene1BackgroundImages } from "./scenes/scene-1/content";

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

  // Scene 1 slideshow refs
  const scene1PortalRef = useRef<HTMLDivElement | null>(null);
  const scene1ElementRef = useRef<HTMLElement | null>(null);
  const scene1ImagesRef = useRef<HTMLImageElement[]>([]);
  const scene1ActiveIndexRef = useRef(0);
  const scene1OpacityRef = useRef(0);
  const scene1ProgressRef = useRef(0);
  const scene1TimelineRef = useRef<gsap.core.Timeline | null>(null);
  const scene1ImageProgressRef = useRef<number[]>([]); // Track each image's Ken Burns progress
  const scene1RafRef = useRef<number | null>(null);

  // Scene 1 image slideshow effect - completely rewritten for cinematic quality
  useEffect(() => {
    if (scene1PortalRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene1ImagePortal";
    portalRoot.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      pointer-events: none;
      opacity: 0;
    `;

    const layer = document.createElement("div");
    layer.className = "chapter1Scene1ImageLayer";
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    // Create image elements
    const images = scene1BackgroundImages.map((src, index) => {
      const img = document.createElement("img");
      img.className = "chapter1Scene1Image";
      img.src = src;
      img.alt = `Scene 1 background ${index + 1}`;
      img.draggable = false;
      img.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        will-change: transform, opacity;
      `;
      // First image visible, others hidden
      gsap.set(img, {
        opacity: index === 0 ? 1 : 0,
        scale: 1.12,
        x: index % 2 === 0 ? "-2%" : "2%",
        y: index % 2 === 0 ? "-1.5%" : "1.5%",
      });
      return img;
    });

    images.forEach((img) => layer.appendChild(img));
    portalRoot.appendChild(layer);
    document.body.appendChild(portalRoot);

    scene1PortalRef.current = portalRoot;
    scene1ImagesRef.current = images;
    scene1ImageProgressRef.current = images.map(() => 0);

    // GSAP timeline for the slideshow
    let slideshowTl: gsap.core.Timeline | null = null;
    let currentImageIndex = 0;
    let isSceneVisible = false;
    let kenBurnsTweens: gsap.core.Tween[] = [];

    const IMAGE_DURATION = 10; // seconds per image
    const CROSSFADE_DURATION = 1.8; // crossfade overlap

    // Ken Burns effect for a single image
    const startKenBurns = (img: HTMLImageElement, index: number) => {
      // Kill any existing tween on this image
      gsap.killTweensOf(img, "scale,x,y");
      
      const startScale = 1.12;
      const endScale = 1.0;
      const startX = index % 2 === 0 ? "-2%" : "2%";
      const endX = "0%";
      const startY = index % 2 === 0 ? "-1.5%" : "1.5%";
      const endY = "0%";

      // Reset to start position
      gsap.set(img, { scale: startScale, x: startX, y: startY });

      // Animate Ken Burns over the image duration
      const tween = gsap.to(img, {
        scale: endScale,
        x: endX,
        y: endY,
        duration: IMAGE_DURATION,
        ease: "none",
      });
      
      kenBurnsTweens.push(tween);
      return tween;
    };

    // Transition to next image
    const transitionToImage = (nextIndex: number) => {
      const currentImg = images[currentImageIndex];
      const nextImg = images[nextIndex];

      // Start Ken Burns on next image
      startKenBurns(nextImg, nextIndex);

      // Crossfade: fade out current, fade in next
      gsap.to(currentImg, {
        opacity: 0,
        duration: CROSSFADE_DURATION,
        ease: "power2.inOut",
      });

      gsap.to(nextImg, {
        opacity: 1,
        duration: CROSSFADE_DURATION,
        ease: "power2.inOut",
      });

      currentImageIndex = nextIndex;
    };

    // Build and start the slideshow timeline
    const startSlideshow = () => {
      if (slideshowTl) {
        slideshowTl.kill();
      }
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];

      // Reset all images
      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1.12,
          x: index % 2 === 0 ? "-2%" : "2%",
          y: index % 2 === 0 ? "-1.5%" : "1.5%",
        });
      });

      currentImageIndex = 0;

      // Start Ken Burns on first image immediately
      startKenBurns(images[0], 0);

      // Create timeline for transitions
      slideshowTl = gsap.timeline({ repeat: -1 });

      // Schedule transitions for each image
      images.forEach((_, index) => {
        const nextIndex = (index + 1) % images.length;
        slideshowTl!.call(
          () => transitionToImage(nextIndex),
          undefined,
          (index + 1) * IMAGE_DURATION - CROSSFADE_DURATION / 2
        );
      });
    };

    // Stop slideshow
    const stopSlideshow = () => {
      if (slideshowTl) {
        slideshowTl.kill();
        slideshowTl = null;
      }
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];
    };

    // RAF loop to track scene visibility
    const tick = () => {
      // Find scene-1 element if not found
      if (!scene1ElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene1ElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-1 .narrativeSceneInner") ??
            null;
        }
      }

      const element = scene1ElementRef.current;
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

      // Update portal opacity to match scene
      const currentOpacity = scene1OpacityRef.current;
      const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
      scene1OpacityRef.current = nextOpacity;
      portalRoot.style.opacity = String(nextOpacity);
      portalRoot.style.visibility = nextOpacity > 0.01 ? "visible" : "hidden";

      // Start/stop slideshow based on visibility
      const nowVisible = nextOpacity > 0.1;
      if (nowVisible && !isSceneVisible) {
        isSceneVisible = true;
        startSlideshow();
      } else if (!nowVisible && isSceneVisible) {
        isSceneVisible = false;
        stopSlideshow();
      }

      scene1RafRef.current = requestAnimationFrame(tick);
    };

    scene1RafRef.current = requestAnimationFrame(tick);

    return () => {
      if (scene1RafRef.current) {
        cancelAnimationFrame(scene1RafRef.current);
      }
      stopSlideshow();
      portalRoot.remove();
      scene1PortalRef.current = null;
      scene1ImagesRef.current = [];
    };
  }, [overlayRef]);

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
