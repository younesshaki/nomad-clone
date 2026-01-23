import { Center, GradientTexture, Stars } from "@react-three/drei";
import { BackSide } from "three";
import carUrl from "../../../assets/bmw_optimized.glb?url";
import { useDisposableGLTF } from "../../../hooks/useDisposableGLTF";

export default function Chapter4() {
  const { scene } = useDisposableGLTF(carUrl);
  const isMobile =
    typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <>
      <color attach="background" args={["#030306"]} />
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[120, 24, 24]} />
        <meshBasicMaterial side={BackSide}>
          <GradientTexture
            stops={[0, 0.45, 0.8, 1]}
            colors={["#020205", "#080414", "#1b0b3d", "#0a0716"]}
          />
        </meshBasicMaterial>
      </mesh>
      <Stars
        radius={120}
        depth={50}
        count={isMobile ? 400 : 800}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />
      <ambientLight intensity={0.9} />
      <Center>
        <primitive object={scene} scale={1} />
      </Center>
    </>
  );
}
