import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from "three";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { createNoise3D } from "simplex-noise";

gsap.registerPlugin(CustomEase);
const noise3D = createNoise3D();

type ChapterPose = {
  rig: [number, number, number];
  target: [number, number, number];
  duration?: number;
  ease?: string;
  fov?: number;
  cameraType?: "dolly" | "crane" | "handheld" | "static";
};

const chapterPoses: Record<number, ChapterPose> = {
  1: {
    rig: [0, 0, 5],
    target: [0, 0, 0],
    duration: 3.5,
    ease: "power2.inOut",
    fov: 75,
    cameraType: "crane",
  },
  2: {
    rig: [0, 0, 7],
    target: [0, 0, 0],
    duration: 2.8,
    ease: "expo.inOut",
    fov: 60,
    cameraType: "dolly",
  },
  3: {
    rig: [0, 0, 1],
    target: [0, 0, 0],
    duration: 1.8,
    ease: "back.out(1.4)",
    fov: 90,
    cameraType: "handheld",
  },
  4: {
    rig: [0, 0, 5],
    target: [0, 0, 0],
    duration: 4.2,
    ease: "circ.inOut",
    fov: 75,
    cameraType: "static",
  },
};

const chapterPaths: Record<number, Vector3[]> = {
  1: [new Vector3(-3, 2, 8), new Vector3(-1, 1, 6), new Vector3(0, 0, 5)],
  3: [new Vector3(0, 0, 5), new Vector3(2, -1, 3), new Vector3(0, 0, 1)],
};

export default function CameraRig({
  sceneIndex,
  currentPart,
  currentChapter,
}: {
  sceneIndex: number;
  currentPart: number;
  currentChapter: number;
}) {
  const { camera } = useThree();
  const lastLogRef = useRef(0);
  const lastPoseRef = useRef<{ pos: [number, number, number]; rot: [number, number, number] } | null>(null);
  // Toggle this off before production to remove camera console logging.
  const ENABLE_CAMERA_LOG = import.meta.env.DEV;
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoRotateRef = useRef(false);
  const rotateTargetRef = useRef<[number, number, number]>([0, 0, 0]);
  const shakeIntensityRef = useRef(0);
  const shakeOffsetRef = useRef<[number, number, number]>([0, 0, 0]);
  const shakeRotZRef = useRef(0);

  useFrame((_, delta) => {
    if (autoRotateRef.current) {
      const target = rotateTargetRef.current;
      const dx = camera.position.x - target[0];
      const dz = camera.position.z - target[2];
      const radius = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx) + delta * 0.15;

      camera.position.x = target[0] + Math.cos(angle) * radius;
      camera.position.z = target[2] + Math.sin(angle) * radius;
      camera.lookAt(target[0], target[1], target[2]);
    }

    if (shakeIntensityRef.current > 0) {
      const time = performance.now() * 0.001;
      const intensity = shakeIntensityRef.current;
      const nextOffset: [number, number, number] = [
        noise3D(time * 2, 0, 0) * intensity,
        noise3D(0, time * 2, 0) * intensity,
        0,
      ];
      const nextRotZ = noise3D(0, 0, time * 2) * intensity * 0.5;

      camera.position.x -= shakeOffsetRef.current[0];
      camera.position.y -= shakeOffsetRef.current[1];
      camera.position.z -= shakeOffsetRef.current[2];
      camera.rotation.z -= shakeRotZRef.current;

      camera.position.x += nextOffset[0];
      camera.position.y += nextOffset[1];
      camera.position.z += nextOffset[2];
      camera.rotation.z += nextRotZ;

      shakeOffsetRef.current = nextOffset;
      shakeRotZRef.current = nextRotZ;
    } else if (shakeOffsetRef.current[0] || shakeOffsetRef.current[1] || shakeOffsetRef.current[2] || shakeRotZRef.current) {
      camera.position.x -= shakeOffsetRef.current[0];
      camera.position.y -= shakeOffsetRef.current[1];
      camera.position.z -= shakeOffsetRef.current[2];
      camera.rotation.z -= shakeRotZRef.current;
      shakeOffsetRef.current = [0, 0, 0];
      shakeRotZRef.current = 0;
    }

    // Camera logging (disabled)
    // if (!ENABLE_CAMERA_LOG) return;
    // const now = performance.now();
    // if (now - lastLogRef.current < 200) return;
    //
    // const pos: [number, number, number] = [
    //   Number(camera.position.x.toFixed(2)),
    //   Number(camera.position.y.toFixed(2)),
    //   Number(camera.position.z.toFixed(2)),
    // ];
    // const rot: [number, number, number] = [
    //   Number(camera.rotation.x.toFixed(2)),
    //   Number(camera.rotation.y.toFixed(2)),
    //   Number(camera.rotation.z.toFixed(2)),
    // ];
    //
    // const last = lastPoseRef.current;
    // const moved =
    //   !last ||
    //   pos.some((value, index) => value !== last.pos[index]) ||
    //   rot.some((value, index) => value !== last.rot[index]);
    //
    // if (!moved) return;
    //
    // lastLogRef.current = now;
    // lastPoseRef.current = { pos, rot };
    //
    // console.log("Camera", { position: pos, rotation: rot });
  });

  useEffect(() => {
    const useBmwRig = sceneIndex === 4  || (currentPart === 2 && currentChapter === 1);
    const targetSceneIndex = useBmwRig ? 4 : sceneIndex;
    const pose = chapterPoses[targetSceneIndex] ?? chapterPoses[1];
    const duration = pose.duration ?? 2.5;
    const ease = pose.ease ?? "power3.inOut";
    timelineRef.current?.kill();
    autoRotateRef.current = false;
    rotateTargetRef.current = pose.target;
    if (currentPart === 1 && currentChapter === 4) {
      shakeIntensityRef.current = 0.04;
    } else {
      shakeIntensityRef.current = pose.cameraType === "handheld" ? 0.02 : 0;
    }

    const tl = gsap.timeline();
    timelineRef.current = tl;
    const path = chapterPaths[targetSceneIndex];
    if (path && path.length > 2) {
      const curve = new CatmullRomCurve3(path);
      const tState = { t: 0 };
      tl.to(tState, {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
          const point = curve.getPoint(tState.t);
          camera.position.copy(point);
          camera.lookAt(...pose.target);
        },
      });
    } else {
      // Anticipation: slight pull back before the main move.
      tl.to(camera.position, {
        z: camera.position.z + 0.5,
        duration: 0.3,
        ease: "power2.in",
      })
        .to(camera.position, {
          x: pose.rig[0],
          y: pose.rig[1],
          z: pose.rig[2] - 0.2,
          duration,
          ease: "power3.out",
        })
        .to(camera.position, {
          z: pose.rig[2],
          duration: 0.4,
          ease: "power2.out",
        });
    }

    if (pose.fov && camera instanceof PerspectiveCamera) {
      tl.to(
        camera,
        {
          fov: pose.fov,
          duration,
          ease,
          onUpdate: () => {
            camera.updateProjectionMatrix();
          },
        },
        0,
      );
    }

    if (!path) {
      tl.to(
        { t: 0 },
        {
          t: 1,
          duration: duration * 0.8,
          ease: "power2.out",
          onUpdate: () => {
            camera.lookAt(...pose.target);
          },
        },
        0.2,
      );
    }

    if (useBmwRig) {
      tl.to(camera.position, {
        x: -2.08,
        y: 1.12,
        z: 4.41,
        duration: 2,
        ease: "power2.inOut",
      }).to(camera.rotation, {
        x: -0.25,
        y: -0.43,
        z: -0.11,
        duration: 2,
        ease: "power2.inOut",
      }, "<").call(() => {
        autoRotateRef.current = true;
      });
    }
    camera.updateProjectionMatrix();

    return () => {
      tl.kill();
    };
  }, [camera, sceneIndex, currentPart, currentChapter]);

  return null;
}
