type Chapter1SceneAssets = {
  models: {
    scene1?: string;
    scene2?: string;
  };
};

export const chapterSceneAssets: Chapter1SceneAssets = {
  models: {},
};

export const chapterModelUrls = Object.values(chapterSceneAssets.models).filter(
  (url): url is string => Boolean(url)
);
