import { useEffect, useRef } from "react";
import { GradientTexture, Stars } from "@react-three/drei";
import { BackSide, Points, BufferAttribute } from "three";
import { useFrame } from "@react-three/fiber";

export function Chapter2Scene() {
  const pointsRef = useRef<Points>(null);
  const velocityRef = useRef<Float32Array | null>(null);
  const isMobile =
    typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (!pointsRef.current) return;

    const count = 1000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;

      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    velocityRef.current = velocities;
    pointsRef.current.geometry.setAttribute(
      "position",
      new BufferAttribute(positions, 3)
    );
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !velocityRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocityRef.current;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      if (positions[i] > 10) positions[i] = -10;
      if (positions[i] < -10) positions[i] = 10;
      if (positions[i + 1] > 10) positions[i + 1] = -10;
      if (positions[i + 1] < -10) positions[i + 1] = 10;
      if (positions[i + 2] > 10) positions[i + 2] = -10;
      if (positions[i + 2] < -10) positions[i + 2] = 10;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

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
      <Stars
        radius={120}
        depth={80}
        count={isMobile ? 800 : 3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      <ambientLight intensity={0.4} color="#ffffff" />
      <pointLight position={[20, 10, 15]} intensity={0.8} color="#6b9fd4" />
      <pointLight position={[-20, 5, 10]} intensity={0.6} color="#a855f7" />
      <directionalLight position={[0, 20, 10]} intensity={0.5} color="#4a90e2" />

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(3000)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffffff" sizeAttenuation={true} />
      </points>
    </>
  );
}
