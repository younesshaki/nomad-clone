import { useGLTF } from "@react-three/drei";

import bmwUrl from "../assets/bmw_optimized.glb?url";
import jimnyUrl from "../assets/suzuki_jimny.draco.glb?url";
import friesUrl from "../assets/Fries.glb?url";
import redbullUrl from "../assets/redbull.glb?url";

const MODEL_URLS = [bmwUrl, jimnyUrl, friesUrl, redbullUrl];

MODEL_URLS.forEach((url) => {
  useGLTF.preload(url);
});

export function ModelPreloader() {
  return null;
}
