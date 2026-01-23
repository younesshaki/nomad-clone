import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function useDisposableGLTF(url: string) {
  const gltf = useGLTF(url);

  useEffect(() => {
    return () => {
      gltf.scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        child.geometry?.dispose();

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          if (!material) {
            return;
          }

          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) {
              value.dispose();
            }
          });

          material.dispose();
        });
      });
    };
  }, [gltf.scene]);

  return gltf;
}
