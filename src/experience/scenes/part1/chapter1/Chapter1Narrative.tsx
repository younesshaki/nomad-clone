import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { NarrativeOverlay } from "../../shared/NarrativeOverlay";
import { chapter1Scenes } from "./data";
import "./Chapter1.css";
// TODO: Replace with new video file in scenes/scene-5/media/
// import scene5VideoUrl from "./scenes/scene-5/media/YOUR_NEW_VIDEO.mp4?url";
const scene5VideoUrl = ""; // Placeholder until new video is added
import { scene1BackgroundImages } from "./scenes/scene-1/content";
import { scene2aBackgroundImages, scene2aImageCues } from "./scenes/scene-2a/content";
import { scene2bBackgroundImages, scene2bImageCues } from "./scenes/scene-2b/content";
import { scene3aBackgroundImages, scene3aImageCues } from "./scenes/scene-3a/content";
import { scene3bBackgroundImages, scene3bImageCues } from "./scenes/scene-3b/content";
import { scene4aBackgroundImages, scene4aImageCues, scene4aVideoCue } from "./scenes/scene-4a/content";
import { audioSyncRegistry } from "./audioSync";

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

const devError = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

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

  // Scene 2a slideshow refs
  const scene2aPortalRef = useRef<HTMLDivElement | null>(null);
  const scene2aElementRef = useRef<HTMLElement | null>(null);
  const scene2aImagesRef = useRef<HTMLImageElement[]>([]);
  const scene2aOpacityRef = useRef(0);
  const scene2aRafRef = useRef<number | null>(null);

  // Scene 2b slideshow refs
  const scene2bPortalRef = useRef<HTMLDivElement | null>(null);
  const scene2bElementRef = useRef<HTMLElement | null>(null);
  const scene2bImagesRef = useRef<HTMLImageElement[]>([]);
  const scene2bOpacityRef = useRef(0);
  const scene2bRafRef = useRef<number | null>(null);

  // Scene 3a slideshow refs
  const scene3aPortalRef = useRef<HTMLDivElement | null>(null);
  const scene3aElementRef = useRef<HTMLElement | null>(null);
  const scene3aImagesRef = useRef<HTMLImageElement[]>([]);
  const scene3aOpacityRef = useRef(0);
  const scene3aRafRef = useRef<number | null>(null);

  // Scene 3b slideshow refs
  const scene3bPortalRef = useRef<HTMLDivElement | null>(null);
  const scene3bElementRef = useRef<HTMLElement | null>(null);
  const scene3bImagesRef = useRef<HTMLImageElement[]>([]);
  const scene3bOpacityRef = useRef(0);
  const scene3bRafRef = useRef<number | null>(null);

  // Scene 4a slideshow refs
  const scene4aPortalRef = useRef<HTMLDivElement | null>(null);
  const scene4aElementRef = useRef<HTMLElement | null>(null);
  const scene4aImagesRef = useRef<HTMLImageElement[]>([]);
  const scene4aOpacityRef = useRef(0);
  const scene4aRafRef = useRef<number | null>(null);

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

  // Scene 2a image slideshow effect - TIME-BASED sync to voiceover
  useEffect(() => {
    if (scene2aPortalRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene2aImagePortal";
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
      z-index: 150;
    `;

    const layer = document.createElement("div");
    layer.className = "chapter1Scene2aImageLayer";
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    // Create image elements from cues
    const images = scene2aImageCues.map((cue, index) => {
      const img = document.createElement("img");
      img.className = "chapter1Scene2aImage";
      img.src = cue.image;
      img.alt = cue.description ?? `Scene 2a background ${index + 1}`;
      img.draggable = false;
      img.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        will-change: transform, opacity;
      `;
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

    scene2aPortalRef.current = portalRoot;
    scene2aImagesRef.current = images;

    let currentImageIndex = 0;
    let isSceneVisible = false;
    let kenBurnsTweens: gsap.core.Tween[] = [];
    let lastAudioTime = -1;

    const CROSSFADE_DURATION = 1.8;

    const startKenBurns = (img: HTMLImageElement, index: number, duration: number) => {
      gsap.killTweensOf(img, "scale,x,y");
      const startScale = 1.12;
      const endScale = 1.0;
      const startX = index % 2 === 0 ? "-2%" : "2%";
      const endX = "0%";
      const startY = index % 2 === 0 ? "-1.5%" : "1.5%";
      const endY = "0%";
      gsap.set(img, { scale: startScale, x: startX, y: startY });
      const tween = gsap.to(img, {
        scale: endScale,
        x: endX,
        y: endY,
        duration: duration,
        ease: "none",
      });
      kenBurnsTweens.push(tween);
      return tween;
    };

    const transitionToImage = (nextIndex: number, duration: number) => {
      if (nextIndex === currentImageIndex) return;
      const currentImg = images[currentImageIndex];
      const nextImg = images[nextIndex];
      startKenBurns(nextImg, nextIndex, duration);
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

    const resetImages = () => {
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];
      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1.12,
          x: index % 2 === 0 ? "-2%" : "2%",
          y: index % 2 === 0 ? "-1.5%" : "1.5%",
        });
      });
      currentImageIndex = 0;
      lastAudioTime = -1;
      // Start Ken Burns on first image
      if (images.length > 0 && scene2aImageCues.length > 0) {
        const firstCue = scene2aImageCues[0];
        startKenBurns(images[0], 0, firstCue.endTime - firstCue.startTime);
      }
    };

    // Subscribe to audio sync updates
    const unsubscribe = audioSyncRegistry.subscribe((currentTime, sceneId) => {
      if (sceneId !== "scene-2a" || !isSceneVisible) return;
      
      // Find which image should be showing based on current audio time
      const targetIndex = scene2aImageCues.findIndex(
        cue => currentTime >= cue.startTime && currentTime < cue.endTime
      );
      
      if (targetIndex !== -1 && targetIndex !== currentImageIndex) {
        const cue = scene2aImageCues[targetIndex];
        transitionToImage(targetIndex, cue.endTime - cue.startTime);
      }
      
      lastAudioTime = currentTime;
    });

    const tick = () => {
      if (!scene2aElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene2aElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-2a .narrativeSceneInner") ??
            null;
        }
      }

      const element = scene2aElementRef.current;
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

      const currentOpacity = scene2aOpacityRef.current;
      const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
      scene2aOpacityRef.current = nextOpacity;
      portalRoot.style.opacity = String(nextOpacity);
      portalRoot.style.visibility = nextOpacity > 0.01 ? "visible" : "hidden";

      const nowVisible = nextOpacity > 0.1;
      if (nowVisible && !isSceneVisible) {
        isSceneVisible = true;
        resetImages();
      } else if (!nowVisible && isSceneVisible) {
        isSceneVisible = false;
      }

      scene2aRafRef.current = requestAnimationFrame(tick);
    };

    scene2aRafRef.current = requestAnimationFrame(tick);

    return () => {
      unsubscribe();
      if (scene2aRafRef.current) {
        cancelAnimationFrame(scene2aRafRef.current);
      }
      kenBurnsTweens.forEach(t => t.kill());
      portalRoot.remove();
      scene2aPortalRef.current = null;
      scene2aImagesRef.current = [];
    };
  }, [overlayRef]);

  // Scene 2b image slideshow effect - TIME-BASED sync to voiceover
  useEffect(() => {
    if (scene2bPortalRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene2bImagePortal";
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
      z-index: 150;
    `;

    const layer = document.createElement("div");
    layer.className = "chapter1Scene2bImageLayer";
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    // Create image elements from cues
    const images = scene2bImageCues.map((cue, index) => {
      const img = document.createElement("img");
      img.className = "chapter1Scene2bImage";
      img.src = cue.image;
      img.alt = cue.description ?? `Scene 2b background ${index + 1}`;
      img.draggable = false;
      img.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        will-change: transform, opacity;
      `;
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

    scene2bPortalRef.current = portalRoot;
    scene2bImagesRef.current = images;

    let currentImageIndex = 0;
    let isSceneVisible = false;
    let kenBurnsTweens: gsap.core.Tween[] = [];
    let lastAudioTime = -1;

    const CROSSFADE_DURATION = 1.8;

    const startKenBurns = (img: HTMLImageElement, index: number, duration: number) => {
      gsap.killTweensOf(img, "scale,x,y");
      const startScale = 1.12;
      const endScale = 1.0;
      const startX = index % 2 === 0 ? "-2%" : "2%";
      const endX = "0%";
      const startY = index % 2 === 0 ? "-1.5%" : "1.5%";
      const endY = "0%";
      gsap.set(img, { scale: startScale, x: startX, y: startY });
      const tween = gsap.to(img, {
        scale: endScale,
        x: endX,
        y: endY,
        duration: duration,
        ease: "none",
      });
      kenBurnsTweens.push(tween);
      return tween;
    };

    const transitionToImage = (nextIndex: number, duration: number) => {
      if (nextIndex === currentImageIndex) return;
      const currentImg = images[currentImageIndex];
      const nextImg = images[nextIndex];
      startKenBurns(nextImg, nextIndex, duration);
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

    const resetImages = () => {
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];
      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1.12,
          x: index % 2 === 0 ? "-2%" : "2%",
          y: index % 2 === 0 ? "-1.5%" : "1.5%",
        });
      });
      currentImageIndex = 0;
      lastAudioTime = -1;
      // Start Ken Burns on first image
      if (images.length > 0 && scene2bImageCues.length > 0) {
        const firstCue = scene2bImageCues[0];
        startKenBurns(images[0], 0, firstCue.endTime - firstCue.startTime);
      }
    };

    // Subscribe to audio sync updates
    const unsubscribe = audioSyncRegistry.subscribe((currentTime, sceneId) => {
      if (sceneId !== "scene-2b" || !isSceneVisible) return;
      
      // Find which image should be showing based on current audio time
      const targetIndex = scene2bImageCues.findIndex(
        cue => currentTime >= cue.startTime && currentTime < cue.endTime
      );
      
      if (targetIndex !== -1 && targetIndex !== currentImageIndex) {
        const cue = scene2bImageCues[targetIndex];
        transitionToImage(targetIndex, cue.endTime - cue.startTime);
      }
      
      lastAudioTime = currentTime;
    });

    const tick = () => {
      if (!scene2bElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene2bElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-2b .narrativeSceneInner") ??
            null;
        }
      }

      const element = scene2bElementRef.current;
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

      const currentOpacity = scene2bOpacityRef.current;
      const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
      scene2bOpacityRef.current = nextOpacity;
      portalRoot.style.opacity = String(nextOpacity);
      portalRoot.style.visibility = nextOpacity > 0.01 ? "visible" : "hidden";

      const nowVisible = nextOpacity > 0.1;
      if (nowVisible && !isSceneVisible) {
        isSceneVisible = true;
        resetImages();
      } else if (!nowVisible && isSceneVisible) {
        isSceneVisible = false;
      }

      scene2bRafRef.current = requestAnimationFrame(tick);
    };

    scene2bRafRef.current = requestAnimationFrame(tick);

    return () => {
      unsubscribe();
      if (scene2bRafRef.current) {
        cancelAnimationFrame(scene2bRafRef.current);
      }
      kenBurnsTweens.forEach(t => t.kill());
      portalRoot.remove();
      scene2bPortalRef.current = null;
      scene2bImagesRef.current = [];
    };
  }, [overlayRef]);

  // Scene 3a image slideshow effect - TIME-BASED sync to voiceover
  useEffect(() => {
    if (scene3aPortalRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene3aImagePortal";
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
      z-index: 150;
    `;

    const layer = document.createElement("div");
    layer.className = "chapter1Scene3aImageLayer";
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;

    // Create image elements from cues
    const images = scene3aImageCues.map((cue, index) => {
      const img = document.createElement("img");
      img.className = "chapter1Scene3aImage";
      img.src = cue.image;
      img.alt = cue.description ?? `Scene 3a background ${index + 1}`;
      img.draggable = false;
      img.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        will-change: transform, opacity;
      `;
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

    scene3aPortalRef.current = portalRoot;
    scene3aImagesRef.current = images;

    let currentImageIndex = 0;
    let isSceneVisible = false;
    let kenBurnsTweens: gsap.core.Tween[] = [];
    let lastAudioTime = -1;

    const CROSSFADE_DURATION = 1.8;

    const startKenBurns = (img: HTMLImageElement, index: number, duration: number) => {
      gsap.killTweensOf(img, "scale,x,y");
      const startScale = 1.12;
      const endScale = 1.0;
      const startX = index % 2 === 0 ? "-2%" : "2%";
      const endX = "0%";
      const startY = index % 2 === 0 ? "-1.5%" : "1.5%";
      const endY = "0%";
      gsap.set(img, { scale: startScale, x: startX, y: startY });
      const tween = gsap.to(img, {
        scale: endScale,
        x: endX,
        y: endY,
        duration: duration,
        ease: "none",
      });
      kenBurnsTweens.push(tween);
      return tween;
    };

    const transitionToImage = (nextIndex: number, duration: number) => {
      if (nextIndex === currentImageIndex) return;
      const currentImg = images[currentImageIndex];
      const nextImg = images[nextIndex];
      startKenBurns(nextImg, nextIndex, duration);
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

    const resetImages = () => {
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];
      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1.12,
          x: index % 2 === 0 ? "-2%" : "2%",
          y: index % 2 === 0 ? "-1.5%" : "1.5%",
        });
      });
      currentImageIndex = 0;
      lastAudioTime = -1;
      // Start Ken Burns on first image
      if (images.length > 0 && scene3aImageCues.length > 0) {
        const firstCue = scene3aImageCues[0];
        startKenBurns(images[0], 0, firstCue.endTime - firstCue.startTime);
      }
    };

    // Subscribe to audio sync updates
    const unsubscribe = audioSyncRegistry.subscribe((currentTime, sceneId) => {
      if (sceneId !== "scene-3a" || !isSceneVisible) return;
      
      // Find which image should be showing based on current audio time
      const targetIndex = scene3aImageCues.findIndex(
        cue => currentTime >= cue.startTime && currentTime < cue.endTime
      );
      
      if (targetIndex !== -1 && targetIndex !== currentImageIndex) {
        const cue = scene3aImageCues[targetIndex];
        transitionToImage(targetIndex, cue.endTime - cue.startTime);
      }
      
      lastAudioTime = currentTime;
    });

    const tick = () => {
      if (!scene3aElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene3aElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-3a .narrativeSceneInner") ??
            null;
        }
      }

      const element = scene3aElementRef.current;
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

      const currentOpacity = scene3aOpacityRef.current;
      const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
      scene3aOpacityRef.current = nextOpacity;
      portalRoot.style.opacity = String(nextOpacity);
      portalRoot.style.visibility = nextOpacity > 0.01 ? "visible" : "hidden";

      const nowVisible = nextOpacity > 0.1;
      if (nowVisible && !isSceneVisible) {
        isSceneVisible = true;
        resetImages();
      } else if (!nowVisible && isSceneVisible) {
        isSceneVisible = false;
      }

      scene3aRafRef.current = requestAnimationFrame(tick);
    };

    scene3aRafRef.current = requestAnimationFrame(tick);

    return () => {
      unsubscribe();
      if (scene3aRafRef.current) {
        cancelAnimationFrame(scene3aRafRef.current);
      }
      kenBurnsTweens.forEach(t => t.kill());
      portalRoot.remove();
      scene3aPortalRef.current = null;
      scene3aImagesRef.current = [];
    };
  }, [overlayRef]);

  // Scene 3b image slideshow effect with Ken Burns and crossfades
  useEffect(() => {
    if (scene3bPortalRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene3bImagePortal";
    portalRoot.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
      visibility: hidden;
    `;

    const layer = document.createElement("div");
    layer.className = "chapter1Scene3bImageLayer";
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;

    const images = scene3bBackgroundImages.map((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Scene 3b background ${index + 1}`;
      img.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        transform: translate(-50%, -50%) scale(1.12);
        object-fit: cover;
        opacity: ${index === 0 ? 1 : 0};
        will-change: transform, opacity;
      `;
      img.draggable = false;
      img.setAttribute("fetchpriority", index === 0 ? "high" : "low");
      img.addEventListener("load", () => {
        devLog(`[Scene3b] Image ${index + 1} loaded`);
      });
      return img;
    });

    images.forEach((img) => layer.appendChild(img));
    portalRoot.appendChild(layer);
    document.body.appendChild(portalRoot);

    scene3bPortalRef.current = portalRoot;
    scene3bImagesRef.current = images;

    let currentImageIndex = 0;
    let isSceneVisible = false;
    let kenBurnsTweens: gsap.core.Tween[] = [];
    let lastAudioTime = -1;

    const CROSSFADE_DURATION = 1.8;

    const startKenBurns = (img: HTMLImageElement, index: number, duration: number) => {
      gsap.killTweensOf(img, "scale,x,y");
      const startScale = 1.12;
      const endScale = 1.0;
      const startX = index % 2 === 0 ? "-2%" : "2%";
      const endX = "0%";
      const startY = index % 2 === 0 ? "-1.5%" : "1.5%";
      const endY = "0%";
      gsap.set(img, { scale: startScale, x: startX, y: startY });
      const tween = gsap.to(img, {
        scale: endScale,
        x: endX,
        y: endY,
        duration: duration,
        ease: "none",
      });
      kenBurnsTweens.push(tween);
      return tween;
    };

    const transitionToImage = (nextIndex: number, duration: number) => {
      if (nextIndex === currentImageIndex) return;
      const currentImg = images[currentImageIndex];
      const nextImg = images[nextIndex];
      startKenBurns(nextImg, nextIndex, duration);
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

    const resetImages = () => {
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];
      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1.12,
          x: index % 2 === 0 ? "-2%" : "2%",
          y: index % 2 === 0 ? "-1.5%" : "1.5%",
        });
      });
      currentImageIndex = 0;
      lastAudioTime = -1;
      // Start Ken Burns on first image
      if (images.length > 0 && scene3bImageCues.length > 0) {
        const firstCue = scene3bImageCues[0];
        startKenBurns(images[0], 0, firstCue.endTime - firstCue.startTime);
      }
    };

    // Subscribe to audio sync updates
    const unsubscribe = audioSyncRegistry.subscribe((currentTime, sceneId) => {
      if (sceneId !== "scene-3b" || !isSceneVisible) return;
      
      // Find which image should be showing based on current audio time
      const targetIndex = scene3bImageCues.findIndex(
        cue => currentTime >= cue.startTime && currentTime < cue.endTime
      );
      
      if (targetIndex !== -1 && targetIndex !== currentImageIndex) {
        const cue = scene3bImageCues[targetIndex];
        transitionToImage(targetIndex, cue.endTime - cue.startTime);
      }
      
      lastAudioTime = currentTime;
    });

    const tick = () => {
      if (!scene3bElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene3bElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-3b .narrativeSceneInner") ??
            null;
        }
      }

      const element = scene3bElementRef.current;
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

      const currentOpacity = scene3bOpacityRef.current;
      const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
      scene3bOpacityRef.current = nextOpacity;
      portalRoot.style.opacity = String(nextOpacity);
      portalRoot.style.visibility = nextOpacity > 0.01 ? "visible" : "hidden";

      const nowVisible = nextOpacity > 0.1;
      if (nowVisible && !isSceneVisible) {
        isSceneVisible = true;
        resetImages();
      } else if (!nowVisible && isSceneVisible) {
        isSceneVisible = false;
      }

      scene3bRafRef.current = requestAnimationFrame(tick);
    };

    scene3bRafRef.current = requestAnimationFrame(tick);

    return () => {
      unsubscribe();
      if (scene3bRafRef.current) {
        cancelAnimationFrame(scene3bRafRef.current);
      }
      kenBurnsTweens.forEach(t => t.kill());
      portalRoot.remove();
      scene3bPortalRef.current = null;
      scene3bImagesRef.current = [];
    };
  }, [overlayRef]);

  // Scene 4a image slideshow effect with Ken Burns and crossfades
  useEffect(() => {
    if (scene4aPortalRef.current) {
      return;
    }

    const portalRoot = document.createElement("div");
    portalRoot.className = "chapter1Scene4aImagePortal";
    portalRoot.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
      visibility: hidden;
    `;

    const layer = document.createElement("div");
    layer.className = "chapter1Scene4aImageLayer";
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;

    const images = scene4aBackgroundImages.map((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Scene 4a background ${index + 1}`;
      img.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        transform: translate(-50%, -50%) scale(1.12);
        object-fit: cover;
        opacity: ${index === 0 ? 1 : 0};
        will-change: transform, opacity;
      `;
      img.draggable = false;
      img.setAttribute("fetchpriority", index === 0 ? "high" : "low");
      img.addEventListener("load", () => {
        devLog(`[Scene4a] Image ${index + 1} loaded`);
      });
      return img;
    });

    // Create video element for final segment
    const video = document.createElement("video");
    video.src = scene4aVideoCue.video;
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.preload = "auto";
    video.autoplay = false; // We'll play manually when ready
    video.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      transform: translate(-50%, -50%) scale(1.05);
      object-fit: cover;
      opacity: 0;
      will-change: transform, opacity;
    `;
    
    // Track video ready state
    let videoReady = false;
    video.addEventListener("loadeddata", () => {
      devLog("[Scene4a] Video loaded and ready, readyState:", video.readyState);
      videoReady = true;
    });
    video.addEventListener("error", (e) => {
      devError("[Scene4a] Video error:", e, video.error);
    });
    // Force video to start loading
    video.load();

    images.forEach((img) => layer.appendChild(img));
    layer.appendChild(video);
    portalRoot.appendChild(layer);
    document.body.appendChild(portalRoot);

    scene4aPortalRef.current = portalRoot;
    scene4aImagesRef.current = images;
    
    devLog("[Scene4a] Slideshow initialized, video src:", video.src);

    let currentImageIndex = 0;
    let isVideoActive = false;
    let isSceneVisible = false;
    let kenBurnsTweens: gsap.core.Tween[] = [];
    let lastAudioTime = -1;

    const CROSSFADE_DURATION = 1.8;

    const startKenBurns = (img: HTMLImageElement, index: number, duration: number) => {
      gsap.killTweensOf(img, "scale,x,y");
      const startScale = 1.12;
      const endScale = 1.0;
      const startX = index % 2 === 0 ? "-2%" : "2%";
      const endX = "0%";
      const startY = index % 2 === 0 ? "-1.5%" : "1.5%";
      const endY = "0%";
      gsap.set(img, { scale: startScale, x: startX, y: startY });
      const tween = gsap.to(img, {
        scale: endScale,
        x: endX,
        y: endY,
        duration: duration,
        ease: "none",
      });
      kenBurnsTweens.push(tween);
      return tween;
    };

    const transitionToImage = (nextIndex: number, duration: number) => {
      if (nextIndex === currentImageIndex && !isVideoActive) return;
      
      // If video is active, fade it out
      if (isVideoActive) {
        gsap.to(video, {
          opacity: 0,
          duration: CROSSFADE_DURATION,
          ease: "power2.inOut",
          onComplete: () => {
            video.pause();
          }
        });
        isVideoActive = false;
      }
      
      const currentImg = images[currentImageIndex];
      const nextImg = images[nextIndex];
      startKenBurns(nextImg, nextIndex, duration);
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

    const transitionToVideo = () => {
      if (isVideoActive) return;
      
      devLog("[Scene4a] Transitioning to video");
      devLog("[Scene4a] Video src:", video.src);
      devLog("[Scene4a] Video readyState:", video.readyState, "videoReady:", videoReady);
      isVideoActive = true;
      
      // Fade out current image
      const currentImg = images[currentImageIndex];
      gsap.to(currentImg, {
        opacity: 0,
        duration: CROSSFADE_DURATION,
        ease: "power2.inOut",
      });
      
      // Function to actually play video
      const playVideo = () => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            devLog("[Scene4a] Video playing successfully");
          }).catch((err) => {
            devError("[Scene4a] Video play failed:", err);
          });
        }
        gsap.fromTo(video, 
          { scale: 1.08, opacity: 0 },
          { 
            scale: 1.0,
            opacity: 1, 
            duration: CROSSFADE_DURATION, 
            ease: "power2.inOut" 
          }
        );
      };
      
      // Check if video is ready, if not wait for it
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        playVideo();
      } else {
        devLog("[Scene4a] Video not ready, waiting for canplay event");
        video.addEventListener("canplay", () => {
          devLog("[Scene4a] Video canplay fired, now playing");
          playVideo();
        }, { once: true });
      }
    };

    const resetImages = () => {
      kenBurnsTweens.forEach(t => t.kill());
      kenBurnsTweens = [];
      images.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1.12,
          x: index % 2 === 0 ? "-2%" : "2%",
          y: index % 2 === 0 ? "-1.5%" : "1.5%",
        });
      });
      // Reset video
      gsap.set(video, { opacity: 0, scale: 1.08 });
      video.pause();
      video.currentTime = 0;
      isVideoActive = false;
      
      currentImageIndex = 0;
      lastAudioTime = -1;
      // Start Ken Burns on first image
      if (images.length > 0 && scene4aImageCues.length > 0) {
        const firstCue = scene4aImageCues[0];
        startKenBurns(images[0], 0, firstCue.endTime - firstCue.startTime);
      }
    };

    // Subscribe to audio sync updates
    const unsubscribe = audioSyncRegistry.subscribe((currentTime, sceneId) => {
      if (sceneId !== "scene-4a") return;
      if (!isSceneVisible) {
        // Log occasionally to avoid spam
        if (Math.floor(currentTime) !== Math.floor(lastAudioTime)) {
          devLog("[Scene4a] Audio update received but scene not visible yet, time:", currentTime.toFixed(2));
        }
        return;
      }
      
      devLog("[Scene4a] Audio sync update, time:", currentTime.toFixed(2), "sceneId:", sceneId);
      
      // Check if we should show video (after all images)
      if (currentTime >= scene4aVideoCue.startTime && currentTime < scene4aVideoCue.endTime) {
        transitionToVideo();
        lastAudioTime = currentTime;
        return;
      }
      
      // Find which image should be showing based on current audio time
      const targetIndex = scene4aImageCues.findIndex(
        cue => currentTime >= cue.startTime && currentTime < cue.endTime
      );
      
      if (targetIndex !== -1 && (targetIndex !== currentImageIndex || isVideoActive)) {
        const cue = scene4aImageCues[targetIndex];
        transitionToImage(targetIndex, cue.endTime - cue.startTime);
      }
      
      lastAudioTime = currentTime;
    });

    const tick = () => {
      if (!scene4aElementRef.current) {
        const overlayRoot =
          overlayRef.current ??
          (document.querySelector(".chapter1Overlay") as HTMLDivElement | null);
        if (overlayRoot) {
          scene4aElementRef.current =
            overlayRoot.querySelector<HTMLElement>(".scene-4a .narrativeSceneInner") ??
            null;
        }
      }

      const element = scene4aElementRef.current;
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

      const currentOpacity = scene4aOpacityRef.current;
      const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.08;
      scene4aOpacityRef.current = nextOpacity;
      portalRoot.style.opacity = String(nextOpacity);
      portalRoot.style.visibility = nextOpacity > 0.01 ? "visible" : "hidden";

      const nowVisible = nextOpacity > 0.1;
      if (nowVisible && !isSceneVisible) {
        devLog("[Scene4a] Scene became visible, opacity:", nextOpacity.toFixed(2));
        isSceneVisible = true;
        resetImages();
      } else if (!nowVisible && isSceneVisible) {
        devLog("[Scene4a] Scene became hidden");
        isSceneVisible = false;
      }

      scene4aRafRef.current = requestAnimationFrame(tick);
    };

    scene4aRafRef.current = requestAnimationFrame(tick);

    return () => {
      unsubscribe();
      if (scene4aRafRef.current) {
        cancelAnimationFrame(scene4aRafRef.current);
      }
      kenBurnsTweens.forEach(t => t.kill());
      video.pause();
      video.src = "";
      portalRoot.remove();
      scene4aPortalRef.current = null;
      scene4aImagesRef.current = [];
    };
  }, [overlayRef]);

  useEffect(() => {
    if (!scene5VideoUrl) {
      return;
    }

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
      if (document.body.dataset.syncPreviewOpen === "true") {
        return;
      }

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
        devLog(
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
