import { Center, GradientTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { BackSide } from "three";
import { useDisposableGLTF } from "../../../../hooks/useDisposableGLTF";
import { chapterSceneAssets } from "./data/sceneAssets";

type Chapter1SceneProps = {
  overlayRef?: RefObject<HTMLDivElement>;
};

export function Chapter1Scene({ overlayRef }: Chapter1SceneProps) {
  const scene1Url = chapterSceneAssets.models.scene1;
  const scene2Url = chapterSceneAssets.models.scene2;

  if (!scene1Url || !scene2Url) {
    return null;
  }

  return (
    <Chapter1SceneModels
      overlayRef={overlayRef}
      scene1Url={scene1Url}
      scene2Url={scene2Url}
    />
  );
}

type Chapter1SceneModelsProps = Chapter1SceneProps & {
  scene1Url: string;
  scene2Url: string;
};

function Chapter1SceneModels({
  overlayRef,
  scene1Url,
  scene2Url,
}: Chapter1SceneModelsProps) {
  const { scene: scene1Model } = useDisposableGLTF(scene1Url);
  const { scene: scene2Model } = useDisposableGLTF(scene2Url);
  const scene5ElementRef = useRef<HTMLElement | null>(null);
  const scene2ElementRef = useRef<HTMLElement | null>(null);
  const scene1OpacityRef = useRef(1);
  const scene2OpacityRef = useRef(0);
  const [modelsReady, setModelsReady] = useState(false);

  const scene1Materials = useMemo(() => {
    const materials: THREE.Material[] = [];
    scene1Model.traverse((child) => {
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
  }, [scene1Model]);

  const scene2Materials = useMemo(() => {
    const materials: THREE.Material[] = [];
    scene2Model.traverse((child) => {
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
  }, [scene2Model]);

  useEffect(() => {
    if (overlayRef?.current) {
      scene5ElementRef.current =
        overlayRef.current.querySelector<HTMLElement>(".scene-5 .narrativeSceneInner") ??
        null;
      scene2ElementRef.current =
        overlayRef.current.querySelector<HTMLElement>(".scene-2a .narrativeSceneInner") ??
        null;
    }
  }, [overlayRef]);

  useLayoutEffect(() => {
    const normalizeModel = (root: THREE.Object3D, targetSize = 2.2) => {
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      root.position.sub(center);
      const maxAxis = Math.max(size.x, size.y, size.z);
      if (maxAxis > 0) {
        const scale = targetSize / maxAxis;
        root.scale.setScalar(scale);
      }
    };

    normalizeModel(scene1Model);
    normalizeModel(scene2Model);

    scene1Materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 1;
      material.visible = true;
    });
    scene2Materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0;
      material.visible = false;
    });
    setModelsReady(true);
  }, [scene1Materials, scene2Materials, scene1Model, scene2Model]);

  useFrame(() => {
    if (!modelsReady) {
      return;
    }
    if (!scene5ElementRef.current && overlayRef?.current) {
      scene5ElementRef.current =
        overlayRef.current.querySelector<HTMLElement>(".scene-5 .narrativeSceneInner") ??
        null;
    }
    if (!scene2ElementRef.current && overlayRef?.current) {
      scene2ElementRef.current =
        overlayRef.current.querySelector<HTMLElement>(".scene-2a .narrativeSceneInner") ??
        null;
    }

    const scene5Opacity = scene5ElementRef.current
      ? (() => {
          const style = window.getComputedStyle(scene5ElementRef.current);
          const opacity = Number.parseFloat(style.opacity || "0");
          return style.visibility === "hidden" ? 0 : Math.min(Math.max(opacity, 0), 1);
        })()
      : 0;

    const scene2Opacity = scene2ElementRef.current
      ? (() => {
          const style = window.getComputedStyle(scene2ElementRef.current);
          const opacity = Number.parseFloat(style.opacity || "0");
          return style.visibility === "hidden" ? 0 : Math.min(Math.max(opacity, 0), 1);
        })()
      : 0;

    const targetScene1Opacity = (1 - scene2Opacity) * (1 - scene5Opacity);
    const targetScene2Opacity = scene2Opacity * (1 - scene5Opacity);

    scene1OpacityRef.current += (targetScene1Opacity - scene1OpacityRef.current) * 0.03;
    scene2OpacityRef.current += (targetScene2Opacity - scene2OpacityRef.current) * 0.03;

    const nextScene1Opacity = Math.min(Math.max(scene1OpacityRef.current, 0), 1);
    const nextScene2Opacity = Math.min(Math.max(scene2OpacityRef.current, 0), 1);

    scene1Materials.forEach((material) => {
      material.opacity = nextScene1Opacity;
      material.visible = nextScene1Opacity > 0.02;
    });
    scene2Materials.forEach((material) => {
      material.opacity = nextScene2Opacity;
      material.visible = nextScene2Opacity > 0.02;
    });
  });

  return (
    <>
      <color attach="background" args={["#071225"]} />
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial side={BackSide}>
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={["#030712", "#0b1f3a", "#03030a"]}
          />
        </meshBasicMaterial>
      </mesh>
      <ambientLight intensity={0.25} />
      <rectAreaLight
        position={[3.5, 1.2, 2.5]}
        intensity={18}
        width={4.5}
        height={1.2}
        color="#3aa0ff"
      />
      <rectAreaLight
        position={[-3.2, -0.8, 2.3]}
        intensity={14}
        width={4.2}
        height={1.1}
        color="#ff355e"
      />
      {modelsReady ? (
        <group position={[-2.6, -0.6, 0]} rotation={[0, 0.35, 0]}>
          <Center>
            <primitive object={scene1Model} />
          </Center>
          <Center>
            <primitive object={scene2Model} />
          </Center>
        </group>
      ) : null}
    </>
  );
}
