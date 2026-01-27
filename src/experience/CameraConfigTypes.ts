import { Vector3 } from "three";

export type CameraType = "dolly" | "crane" | "handheld" | "static";

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  duration: number;
  ease: string;
  fov: number;
  type: CameraType;
  path?: Vector3[];
  shakeIntensity?: number;
  useBmwRig?: boolean;
}
