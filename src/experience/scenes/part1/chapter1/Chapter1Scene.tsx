import { Center, Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useDisposableGLTF } from "../../../../hooks/useDisposableGLTF";
import { chapterSceneAssets } from "./data/sceneAssets";

type Chapter1SceneProps = {
  overlayRef?: RefObject<HTMLDivElement>;
};

export function Chapter1Scene({ overlayRef }: Chapter1SceneProps) {
  const { scene: phoneScene } = useDisposableGLTF(chapterSceneAssets.models.phone);
  const scene5OpacityRef = useRef(0);
  const scene5ElementRef = useRef<HTMLElement | null>(null);
  const modelOpacityRef = useRef(1);
  const modelMaterials = useMemo(() => {
    const materials: THREE.Material[] = [];
    phoneScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((material) => {
          if (material && !materials.includes(material)) {
            materials.push(material);
          }
        });
      }
    });
    return materials;
  }, [phoneScene]);

  useEffect(() => {
    if (overlayRef?.current) {
      scene5ElementRef.current =
        overlayRef.current.querySelector<HTMLElement>(".scene-5 .narrativeSceneInner") ??
        null;
    }
  }, [overlayRef]);

  useEffect(() => {
    modelMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 1;
    });
  }, [modelMaterials]);

  useFrame(() => {
    if (!scene5ElementRef.current && overlayRef?.current) {
      scene5ElementRef.current =
        overlayRef.current.querySelector<HTMLElement>(".scene-5 .narrativeSceneInner") ??
        null;
    }

    const element = scene5ElementRef.current;
    if (!element) {
      scene5OpacityRef.current = 0;
      return;
    }

    const style = window.getComputedStyle(element);
    const opacity = Number.parseFloat(style.opacity || "0");
    scene5OpacityRef.current =
      style.visibility === "hidden" ? 0 : Math.min(Math.max(opacity, 0), 1);

    const targetOpacity = 1 - scene5OpacityRef.current;
    modelOpacityRef.current += (targetOpacity - modelOpacityRef.current) * 0.03;
    const nextOpacity = Math.min(Math.max(modelOpacityRef.current, 0), 1);
    modelMaterials.forEach((material) => {
      material.opacity = nextOpacity;
      material.visible = nextOpacity > 0.02;
    });
  });

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
