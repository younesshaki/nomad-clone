import { Center, GradientTexture, Stars, useGLTF } from "@react-three/drei";
import { BackSide } from "three";
import friesUrl from "../../../assets/Fries.glb?url";
import redbullUrl from "../../../assets/redbull.glb?url";

export default function Chapter3() {
  const { scene: friesScene } = useGLTF(friesUrl);
  const { scene: redbullScene } = useGLTF(redbullUrl);

  return (
    <>
      <color attach="background" args={["#030306"]} />
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[120, 64, 64]} />
        <meshBasicMaterial side={BackSide}>
          <GradientTexture
            stops={[0, 0.45, 0.8, 1]}
            colors={["#020205", "#080414", "#1b0b3d", "#0a0716"]}
          />
        </meshBasicMaterial>
      </mesh>
      <Stars radius={120} depth={80} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1} />
      <Center>
        <group>
          <primitive object={friesScene} scale={1} position={[-0.8, 0, 0]} />
          <primitive object={redbullScene} scale={1} position={[0.8, 0, 0]} />
        </group>
      </Center>
    </>
  );
}
