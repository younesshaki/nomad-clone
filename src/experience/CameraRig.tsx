import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
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

export default function CameraRig({ sceneIndex }: { sceneIndex: number }) {
  const { camera } = useThree();

  useEffect(() => {
    const pose = chapterPoses[sceneIndex] ?? chapterPoses[1];
    gsap.to(camera.position, {
      x: pose.rig[0],
      y: pose.rig[1],
      z: pose.rig[2],
      duration: 2.5,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(...pose.target);
      },
    });
    camera.updateProjectionMatrix();
  }, [camera, sceneIndex]);

  return null;
}
