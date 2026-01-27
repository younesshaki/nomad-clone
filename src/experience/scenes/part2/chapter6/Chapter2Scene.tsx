import { Center } from "@react-three/drei";
import { useDisposableGLTF } from "../../../../hooks/useDisposableGLTF";
import { chapterSceneAssets } from "./data/sceneAssets";

export function Chapter2Scene() {
  const { scene } = useDisposableGLTF(chapterSceneAssets.models.bmwM4);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <Center>
        <primitive object={scene} scale={0.8} />
      </Center>
    </>
  );
}
