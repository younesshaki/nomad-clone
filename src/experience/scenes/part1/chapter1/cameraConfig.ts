import { Vector3 } from "three";
import { CameraConfig } from "../../../CameraConfigTypes";

export const cameraConfig: CameraConfig = {
  position: [0, 0, 5],
  target: [0, 0, 0],
  duration: 3.5,
  ease: "power2.inOut",
  fov: 75,
  type: "crane",
  path: [new Vector3(-3, 2, 8), new Vector3(-1, 1, 6), new Vector3(0, 0, 5)],
};
