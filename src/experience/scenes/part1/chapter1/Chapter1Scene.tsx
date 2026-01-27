import { Center, Sky } from "@react-three/drei";
import { useDisposableGLTF } from "../../../../hooks/useDisposableGLTF";
import { chapterSceneAssets } from "./data/sceneAssets";

export function Chapter1Scene() {
  const { scene: phoneScene } = useDisposableGLTF(chapterSceneAssets.models.phone);

  return (
    <>
      <color attach="background" args={["#f6f7fb"]} />
      <Sky
        distance={1200}
        sunPosition={[0, 0.6, -0.2]}
        inclination={0.4}
        azimuth={0.2}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 6]} intensity={1.2} />
      <group position={[-2.6, -0.6, 0]} rotation={[0, 0.35, 0]}>
        <Center>
          <primitive object={phoneScene} scale={0.1} />
        </Center>
      </group>
    </>
  );
}
