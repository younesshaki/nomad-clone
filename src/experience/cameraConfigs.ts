import { Vector3 } from "three";
import { cameraConfig as p1c1 } from "./scenes/part1/chapter1/cameraConfig";
import { cameraConfig as p1c2 } from "./scenes/part1/chapter2/cameraConfig";
import { cameraConfig as p1c3 } from "./scenes/part1/chapter3/cameraConfig";
import { cameraConfig as p1c4 } from "./scenes/part1/chapter4/cameraConfig";
import { cameraConfig as p2c1 } from "./scenes/part2/chapter5/cameraConfig";
import { cameraConfig as p2c2 } from "./scenes/part2/chapter6/cameraConfig";
import { cameraConfig as p3c1 } from "./scenes/part3/chapter9/cameraConfig";

import { CameraConfig } from "./CameraConfigTypes";

export const CAMERA_CONFIGS: Record<string, CameraConfig> = {
  "1-1": p1c1,
  "1-2": p1c2,
  "1-3": p1c3,
  "1-4": p1c4,
  "2-1": p2c1,
  "2-2": p2c2,
  "3-1": p3c1,
};

export * from "./CameraConfigTypes";

export const getCameraConfig = (part: number, chapter: number): CameraConfig | undefined => {
  return CAMERA_CONFIGS[`${part}-${chapter}`];
};
