import { useEffect } from "react";
import { ALL_SCENE_ASSETS, preloadAssetUrls } from "./sceneAssets";

export function ModelPreloader() {
  useEffect(() => {
    preloadAssetUrls(ALL_SCENE_ASSETS);
  }, []);

  return null;
}
