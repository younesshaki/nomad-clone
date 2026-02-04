/**
 * Director Track Configuration for Chapter 1
 * 
 * This file demonstrates how to set up a full Director Timeline
 * with camera, DOM, and 3D object animations all synced to scroll.
 */

import type { DirectorKeyframe } from "../../../../hooks/useDirectorTimeline";
import { createTextReveal, createCameraMove } from "../../../../hooks/useDirectorTimeline";
import { chapter1Scenes } from "../data";

/**
 * Camera positions for each scene in Chapter 1
 * These define where the camera should be at each narrative beat
 */
export const chapter1CameraPositions: Record<string, {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  type?: "static" | "handheld" | "crane" | "dolly";
}> = {
  "scene-1": {
    position: [0, 0, 5],
    target: [0, 0, 0],
    fov: 75,
    type: "crane",
  },
  "scene-2a": {
    position: [-2, 1, 6],
    target: [-1, 0, 0],
    fov: 70,
    type: "dolly",
  },
  "scene-2b": {
    position: [-3, 0.5, 5],
    target: [-2, 0, 0],
    fov: 65,
    type: "handheld",
  },
  "scene-3a": {
    position: [1, 2, 7],
    target: [0, 0, 0],
    fov: 75,
    type: "crane",
  },
  "scene-3b": {
    position: [2, 1.5, 6],
    target: [1, 0, 0],
    fov: 70,
    type: "static",
  },
  "scene-4a": {
    position: [0, 3, 8],
    target: [0, 1, 0],
    fov: 80,
    type: "crane",
  },
  "scene-4b": {
    position: [-1, 2, 6],
    target: [0, 0.5, 0],
    fov: 75,
    type: "handheld",
  },
  "scene-5": {
    position: [0, 1, 4],
    target: [0, 0, 0],
    fov: 60,
    type: "dolly",
  },
};

/**
 * Generate Director Keyframes from scene data
 * This creates a complete timeline with all animations
 */
export function generateChapter1Keyframes(): DirectorKeyframe[] {
  const keyframes: DirectorKeyframe[] = [];
  const sceneDuration = 22; // seconds per scene
  const overlap = 4; // seconds of overlap between scenes
  const step = sceneDuration - overlap;

  chapter1Scenes.forEach((scene, index) => {
    const startTime = index * step;
    const sceneSelector = `.narrativeScene.${scene.id}`;
    const camConfig = chapter1CameraPositions[scene.id];

    const keyframe: DirectorKeyframe = {
      id: scene.id,
      at: startTime,
      duration: sceneDuration,
      behavior: scene.behavior === "cinematic" ? "cinematic" : "scroll",
      
      // Camera animation
      camera: camConfig ? {
        position: camConfig.position,
        target: camConfig.target,
        fov: camConfig.fov,
        ease: "power2.inOut",
      } : undefined,
      
      // DOM animations - reveal text with cinematic effect
      dom: createTextReveal(`${sceneSelector} .narrativeLine`),
      
      // Lifecycle callbacks
      onEnter: () => {
        console.log(`[Director] Entering scene: ${scene.id}`);
      },
      onLeave: () => {
        console.log(`[Director] Leaving scene: ${scene.id}`);
      },
    };

    keyframes.push(keyframe);
  });

  return keyframes;
}

/**
 * Pre-generated keyframes for direct use
 */
export const chapter1DirectorKeyframes = generateChapter1Keyframes();

/**
 * Total timeline duration
 */
export const chapter1TotalDuration = 
  chapter1Scenes.length * 22 - (chapter1Scenes.length - 1) * 4;
