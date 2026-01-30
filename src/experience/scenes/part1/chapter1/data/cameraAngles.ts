export type CameraAngle = {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  duration?: number;
  ease?: string;
};

const TARGET: [number, number, number] = [-2.6, -0.6, 0];
const DEFAULT_DURATION = 1.6;
const DEFAULT_EASE = "power2.inOut";

const makeAngle = (
  position: [number, number, number],
  overrides: Partial<CameraAngle> = {}
): CameraAngle => ({
  position,
  target: TARGET,
  duration: DEFAULT_DURATION,
  ease: DEFAULT_EASE,
  fov: 70,
  ...overrides,
});

// First two scenes only (15 paragraphs total).
export const CHAPTER1_CAMERA_ANGLES: CameraAngle[] = [
  makeAngle([-0.4, 1.6, 5.2], { fov: 78, duration: 5.6, ease: "power2.inOut" }), // 0
  makeAngle([-1.4, 1.1, 4.2], { fov: 74, duration: 2.0 }), // 1
  makeAngle([-2.6, 0.6, 3.4], { fov: 70, duration: 1.8 }), // 2
  makeAngle([-4.4, 0.1, 3.2], { fov: 66, duration: 1.6 }), // 3
  makeAngle([-5.6, -0.4, 2.6], { fov: 62, duration: 1.6 }), // 4
  makeAngle([-6.2, -0.7, 2.1], { fov: 58, duration: 1.4, ease: "power3.out" }), // 5
  makeAngle([-5.0, 0.8, 2.4], { fov: 64, duration: 1.7 }), // 6
  makeAngle([-3.6, 1.8, 3.2], { fov: 70, duration: 1.9 }), // 7
  makeAngle([-2.1, 1.6, 3.0], { fov: 64, duration: 2.0 }), // 8
  makeAngle([-1.6, 1.0, 2.6], { fov: 62, duration: 1.8 }), // 9
  makeAngle([-0.8, 0.1, 2.4], { fov: 60, duration: 1.6 }), // 10
  makeAngle([-1.6, -0.5, 2.2], { fov: 58, duration: 1.5 }), // 11
  makeAngle([-2.8, -0.9, 2.0], { fov: 56, duration: 1.5 }), // 12
  makeAngle([-3.8, -1.1, 1.9], { fov: 55, duration: 1.4 }), // 13
  makeAngle([-2.0, 0.7, 2.8], { fov: 62, duration: 2.2, ease: "power3.inOut" }), // 14
  makeAngle([2.78, -1.2, 2.61], { fov: 64, duration: 1.8 }), // 15
  makeAngle([2.78, -1.2, 2.61], { fov: 64, duration: 1.6 }), // 16
  makeAngle([2.78, -1.2, 2.61], { fov: 64, duration: 1.6 }), // 17
  makeAngle([2.78, -1.2, 2.61], { fov: 64, duration: 1.6 }), // 18
  makeAngle([2.78, -1.2, 2.61], { fov: 64, duration: 1.6 }), // 19
  makeAngle([2.78, -1.2, 2.61], { fov: 64, duration: 1.6 }), // 20
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.8 }), // 21
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.6 }), // 22
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.6 }), // 23
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.6 }), // 24
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.6 }), // 25
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.6 }), // 26
  makeAngle([1.66, -0.94, -3.51], { fov: 64, duration: 1.6 }), // 27
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.8 }), // 28
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.6 }), // 29
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.6 }), // 30
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.6 }), // 31
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.6 }), // 32
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.6 }), // 33
  makeAngle([-3.32, 2.17, 0.48], { fov: 64, duration: 1.6 }), // 34
];

export const MAX_CHAPTER1_CAMERA_INDEX = CHAPTER1_CAMERA_ANGLES.length - 1;

export const getCameraAngle = (index: number): CameraAngle => {
  const clampedIndex = Math.min(Math.max(index, 0), MAX_CHAPTER1_CAMERA_INDEX);
  return CHAPTER1_CAMERA_ANGLES[clampedIndex] ?? CHAPTER1_CAMERA_ANGLES[0];
};
