import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Vector3Tuple } from "three";

type ChapterPose = {
  rig: Vector3Tuple;
  target: Vector3Tuple;
};

const chapterPoses: Record<number, ChapterPose> = {
  1: { rig: [0, 0, 5], target: [0, 0, 0] },
  2: { rig: [0, 0, 7], target: [0, 0, 0] },
  3: { rig: [0, 0, 5], target: [0, 0, 0] },
  4: { rig: [0, 0, 5], target: [0, 0, 0] },
};

export default function CameraRig({ chapter }: { chapter: number }) {
  const { camera } = useThree();
  const rig = useRef<Group>(null);
  const target = useRef<Group>(null);

  useEffect(() => {
    const pose = chapterPoses[chapter] ?? chapterPoses[1];
    if (rig.current) rig.current.position.set(...pose.rig);
    if (target.current) target.current.position.set(...pose.target);
    camera.position.set(...pose.rig);
    camera.lookAt(...pose.target);
    camera.updateProjectionMatrix();
  }, [camera, chapter]);

  return (
    <>
      <group ref={rig} position={[0, 0, 5]} />
      <group ref={target} position={[0, 0, 0]} />
    </>
  );
}
