import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type ChapterPose = {
  rig: [number, number, number];
  target: [number, number, number];
};

const chapterPoses: Record<number, ChapterPose> = {
  1: { rig: [0, 0, 5], target: [0, 0, 0] },
  2: { rig: [0, 0, 7], target: [0, 0, 0] },
  3: { rig: [0, 0, 1], target: [0, 0, 0] },
  4: { rig: [0, 0, 5], target: [0, 0, 0] },
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
    const useBmwRig = sceneIndex === 4 || (currentPart === 2 && currentChapter === 1);
    const targetSceneIndex = useBmwRig ? 4 : sceneIndex;
    const pose = chapterPoses[targetSceneIndex] ?? chapterPoses[1];
    timelineRef.current?.kill();
    autoRotateRef.current = false;
    rotateTargetRef.current = pose.target;

    const tl = gsap.timeline();
    timelineRef.current = tl;
    tl.to(camera.position, {
      x: pose.rig[0],
      y: pose.rig[1],
      z: pose.rig[2],
      duration: 2.5,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(...pose.target);
      },
    });

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
