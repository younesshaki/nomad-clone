import { Center, GradientTexture, Stars, useGLTF } from "@react-three/drei";
import { BackSide } from "three";
import carUrl from "../../assets/ac_-_bmw_1m_free.glb?url";

declare module "*.glb" {
  const src: string;
  export default src;
}

export default function Chapter4() {
  const { scene } = useGLTF(carUrl);

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
      <directionalLight position={[5, 6, 4]} intensity={3.2} />
      <Center>
        <primitive object={scene} scale={1} />
      </Center>
    </>
  );
}
