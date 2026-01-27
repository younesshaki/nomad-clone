import { Vector3 } from "three";
import { CameraConfig } from "../../../CameraConfigTypes";

export const cameraConfig: CameraConfig = {
  position: [0, 0, 1],
  target: [0, 0, 0],
  duration: 1.8,
  ease: "back.out(1.4)",
  fov: 90,
  type: "handheld",
  path: [new Vector3(0, 0, 5), new Vector3(2, -1, 3), new Vector3(0, 0, 1)],
  shakeIntensity: 0.02,
};
