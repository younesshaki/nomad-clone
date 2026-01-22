import { Center, GradientTexture, Stars, useGLTF } from "@react-three/drei";
import { BackSide } from "three";
import carUrl from "../../../assets/ac_-_bmw_1m_free.glb?url";

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
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 6, 3]} intensity={1.8} />
      {/* Wide strip lights for long reflections */}
      <rectAreaLight position={[2.8, 1.5, 3.2]} intensity={22} width={6} height={0.6} color="#43b0ff" />
      <rectAreaLight position={[-2.8, 1.2, 3.2]} intensity={20} width={5.5} height={0.6} color="#2678ff" />
      <rectAreaLight position={[0, 2.6, -2.8]} intensity={18} width={5} height={0.5} color="#ff2a52" />
      <rectAreaLight position={[0, 0.8, 3.8]} intensity={16} width={4.5} height={0.45} color="#ff335f" />
      <Center>
        <primitive object={scene} scale={1} />
      </Center>
    </>
  );
}
