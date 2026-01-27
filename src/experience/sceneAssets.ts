import { useGLTF } from "@react-three/drei";
import { chapterModelUrls as part1Chapter1Assets } from "./scenes/part1/chapter1/data/sceneAssets";
import { chapterModelUrls as part1Chapter3Assets } from "./scenes/part1/chapter3/data/sceneAssets";
import { chapterModelUrls as part1Chapter4Assets } from "./scenes/part1/chapter4/data/sceneAssets";
import { chapterModelUrls as part2Chapter1Assets } from "./scenes/part2/chapter5/data/sceneAssets";
import { chapterModelUrls as part2Chapter2Assets } from "./scenes/part2/chapter6/data/sceneAssets";
import { chapterModelUrls as part3Chapter1Assets } from "./scenes/part3/chapter9/data/sceneAssets";

export type SceneAssetKey = `${number}-${number}`;

const SCENE_ASSETS: Record<SceneAssetKey, string[]> = {
  "1-1": part1Chapter1Assets,
  "1-3": part1Chapter3Assets,
  "1-4": part1Chapter4Assets,
  "2-1": part2Chapter1Assets,
  "2-2": part2Chapter2Assets,
  "3-1": part3Chapter1Assets,
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

/**
 * Smart preloading: Only loads current and next chapter assets
 * Saves bandwidth and memory compared to loading all assets upfront
 */
export const preloadAdjacentChapters = (
  part: number,
  chapter: number
) => {
  const urls = new Set<string>();

  // Current chapter
  const currentAssets = getSceneAssetUrls(part, chapter);
  currentAssets.forEach((url) => urls.add(url));

  // Next chapter (if exists)
  const nextAssets = getSceneAssetUrls(part, chapter + 1);
  nextAssets.forEach((url) => urls.add(url));

  // Previous chapter (for going back)
  if (chapter > 1) {
    const prevAssets = getSceneAssetUrls(part, chapter - 1);
    prevAssets.forEach((url) => urls.add(url));
  }

  preloadAssetUrls(Array.from(urls));
};
