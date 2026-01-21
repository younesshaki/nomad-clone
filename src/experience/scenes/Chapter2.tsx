import { useMemo, useRef } from "react";
import { CanvasTexture, Points } from "three";
import { useFrame } from "@react-three/fiber";

export default function Chapter2() {
  const pointsRef = useRef<Points>(null);
  const count = 1000;
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      array[i] = (Math.random() - 0.5) * 20;
      array[i + 1] = (Math.random() - 0.5) * 20;
      array[i + 2] = (Math.random() - 0.5) * 20;
    }
    return array;
  }, []);
  const velocities = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      array[i] = (Math.random() - 0.5) * 0.02;
      array[i + 1] = (Math.random() - 0.5) * 0.02;
      array[i + 2] = (Math.random() - 0.5) * 0.02;
    }
    return array;
  }, []);
  const sprite = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const attribute = pointsRef.current.geometry.attributes.position;
    if (!attribute) return;

    for (let i = 0; i < positions.length; i += 3) {
      // Update position
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Wrap around
      if (positions[i] > 10) positions[i] = -10;
      if (positions[i] < -10) positions[i] = 10;
      if (positions[i + 1] > 10) positions[i + 1] = -10;
      if (positions[i + 1] < -10) positions[i + 1] = 10;
      if (positions[i + 2] > 10) positions[i + 2] = -10;
      if (positions[i + 2] < -10) positions[i + 2] = 10;
    }

    attribute.needsUpdate = true;
  });

  return (
    <>
      {/* Sparkles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#ffffff"
          sizeAttenuation={true}
          transparent={true}
          alphaTest={0.5}
          map={sprite || undefined}
          alphaMap={sprite || undefined}
        />
      </points>
    </>
  );
}
