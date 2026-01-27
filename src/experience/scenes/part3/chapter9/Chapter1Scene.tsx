import CyberOcean from "../../../components/CyberOcean";
import { chapterSceneAssets } from "./data/sceneAssets";

type Chapter1SceneProps = {
  isActive?: boolean;
};

export function Chapter1Scene({ isActive = true }: Chapter1SceneProps) {
  return (
    <CyberOcean
      isActive={isActive}
      allowControls
      dolphinUrl={chapterSceneAssets.models.dolphin}
      envMapPath={chapterSceneAssets.textures.environmentMapPath}
      envMapFiles={chapterSceneAssets.textures.environmentMapFiles}
    />
  );
}
