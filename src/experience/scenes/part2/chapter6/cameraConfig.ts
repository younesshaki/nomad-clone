import { Vector3 } from "three";
import { CameraConfig } from "../../../CameraConfigTypes";

export const cameraConfig: CameraConfig = {
  position: [0, 1.2, 5],
  target: [0, 0.5, 0],
  duration: 6.5,
  ease: "power3.inOut",
  fov: 45, // Cinematic focal length
  type: "crane",
  path: [
    new Vector3(5, 4, 12),    // Start high and wide
    new Vector3(3, 2.5, 9),   // Swoop down
    new Vector3(-2, 1.5, 7),  // Wrap around the subject
    new Vector3(0, 1.2, 5)    // Settle into final composition
  ],
  shakeIntensity: 0.002, // Subtle breath-like movement
};
