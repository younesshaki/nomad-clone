import { useGLTF } from "@react-three/drei";

import bmwUrl from "../assets/bmw_optimized.glb?url";
import jimnyUrl from "../assets/suzuki_jimny.draco.glb?url";
import friesUrl from "../assets/Fries.glb?url";
import redbullUrl from "../assets/redbull.glb?url";

export type SceneAssetKey = `${number}-${number}`;

const SCENE_ASSETS: Record<SceneAssetKey, string[]> = {
  "1-3": [friesUrl, redbullUrl],
  "1-4": [bmwUrl],
  "2-1": [jimnyUrl],
};

export const ALL_SCENE_ASSETS = Array.from(
  new Set(Object.values(SCENE_ASSETS).flat())
);

export const getSceneAssetUrls = (part: number, chapter: number) =>
  SCENE_ASSETS[`${part}-${chapter}`] ?? [];

export const preloadAssetUrls = (urls: string[]) => {
  urls.forEach((url) => {
    useGLTF.preload(url);
  });
};

export const preloadSceneAssets = (part: number, chapter: number) => {
  preloadAssetUrls(getSceneAssetUrls(part, chapter));
};
