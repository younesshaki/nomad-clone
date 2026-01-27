import { useMemo, type ReactNode, lazy, Suspense } from "react";
import { parts } from "./parts";

const Part1Chapter1 = lazy(() => import("./scenes/part1/chapter1"));
const Part1Chapter2 = lazy(() => import("./scenes/part1/chapter2"));
const Part1Chapter3 = lazy(() => import("./scenes/part1/chapter3"));
const Part1Chapter4 = lazy(() => import("./scenes/part1/chapter4"));

const Part2Chapter1 = lazy(() => import("./scenes/part2/chapter5"));
const Part2Chapter2 = lazy(() => import("./scenes/part2/chapter6"));
const Part2Chapter3 = lazy(() => import("./scenes/part2/chapter7"));
const Part2Chapter4 = lazy(() => import("./scenes/part2/chapter8"));

const Part3Chapter1 = lazy(() => import("./scenes/part3/chapter9"));
const Part3Chapter2 = lazy(() => import("./scenes/part3/chapter10"));
const Part3Chapter3 = lazy(() => import("./scenes/part3/chapter11"));
const Part3Chapter4 = lazy(() => import("./scenes/part3/chapter12"));

const Part4Chapter1 = lazy(() => import("./scenes/part4/chapter13"));
const Part4Chapter2 = lazy(() => import("./scenes/part4/chapter14"));
const Part4Chapter3 = lazy(() => import("./scenes/part4/chapter15"));
const Part4Chapter4 = lazy(() => import("./scenes/part4/chapter16"));

const Part5Chapter1 = lazy(() => import("./scenes/part5/chapter17"));
const Part5Chapter2 = lazy(() => import("./scenes/part5/chapter18"));
const Part5Chapter3 = lazy(() => import("./scenes/part5/chapter19"));
const Part5Chapter4 = lazy(() => import("./scenes/part5/chapter20"));

const Part6Chapter1 = lazy(() => import("./scenes/part6/chapter21"));
const Part6Chapter2 = lazy(() => import("./scenes/part6/chapter22"));
const Part6Chapter3 = lazy(() => import("./scenes/part6/chapter23"));
const Part6Chapter4 = lazy(() => import("./scenes/part6/chapter24"));
const Part6Chapter5 = lazy(() => import("./scenes/part6/chapter25"));


interface SceneManagerProps {
  currentChapter: number;
  currentPart: number;
  onRegisterGoTo?: (fn: (partIndex: number, chapterIndex: number) => void) => void;
  scenesHidden?: boolean;
}

export default function SceneManager({
  currentChapter,
  currentPart,
  scenesHidden = false,
}: SceneManagerProps) {
  const chapterCount = parts[currentPart - 1]?.chapters.length ?? 0;
  const activeKey = `part${currentPart}-chapter${currentChapter}`;
  console.log("SceneManager rendered, part:", currentPart, "chapter:", currentChapter);

  const scenesToRender = useMemo(() => {
    const scenes: Array<{ key: string; component: ReactNode }> = [];

    for (let offset = -1; offset <= 1; offset += 1) {
      const chapterNum = currentChapter + offset;
      if (chapterNum < 1 || chapterNum > chapterCount) {
        continue;
      }

      const Component = getChapterComponent(currentPart, chapterNum);
      if (!Component) {
        continue;
      }

      const key = `part${currentPart}-chapter${chapterNum}`;
      const isActive = key === activeKey && !scenesHidden;
      scenes.push({
        key,
        component: <Component isActive={isActive} />,
      });
    }

    return scenes;
  }, [activeKey, chapterCount, currentChapter, currentPart, scenesHidden]);

  return (
    <>
      {scenesToRender.map(({ key, component }) => (
        <group key={key} visible={key === activeKey && !scenesHidden}>
          <Suspense fallback={null}>
            {component}
          </Suspense>
        </group>
      ))}
    </>
  );
}

type SceneComponent = React.ComponentType<{ isActive?: boolean }>;

function getChapterComponent(part: number, chapter: number): SceneComponent | null {
  switch (part) {
    case 1:
      if (chapter === 1) return Part1Chapter1 as SceneComponent;
      if (chapter === 2) return Part1Chapter2 as SceneComponent;
      if (chapter === 3) return Part1Chapter3 as SceneComponent;
      if (chapter === 4) return Part1Chapter4 as SceneComponent;
      break;
    case 2:
      if (chapter === 1) return Part2Chapter1 as SceneComponent;
      if (chapter === 2) return Part2Chapter2 as SceneComponent;
      if (chapter === 3) return Part2Chapter3 as SceneComponent;
      if (chapter === 4) return Part2Chapter4 as SceneComponent;
      break;
    case 3:
      if (chapter === 1) return Part3Chapter1 as SceneComponent;
      if (chapter === 2) return Part3Chapter2 as SceneComponent;
      if (chapter === 3) return Part3Chapter3 as SceneComponent;
      if (chapter === 4) return Part3Chapter4 as SceneComponent;
      break;
    case 4:
      if (chapter === 1) return Part4Chapter1 as SceneComponent;
      if (chapter === 2) return Part4Chapter2 as SceneComponent;
      if (chapter === 3) return Part4Chapter3 as SceneComponent;
      if (chapter === 4) return Part4Chapter4 as SceneComponent;
      break;
    case 5:
      if (chapter === 1) return Part5Chapter1 as SceneComponent;
      if (chapter === 2) return Part5Chapter2 as SceneComponent;
      if (chapter === 3) return Part5Chapter3 as SceneComponent;
      if (chapter === 4) return Part5Chapter4 as SceneComponent;
      break;
    case 6:
      if (chapter === 1) return Part6Chapter1 as SceneComponent;
      if (chapter === 2) return Part6Chapter2 as SceneComponent;
      if (chapter === 3) return Part6Chapter3 as SceneComponent;
      if (chapter === 4) return Part6Chapter4 as SceneComponent;
      if (chapter === 5) return Part6Chapter5 as SceneComponent;
      break;
    default:
      return null;
  }
  return null;
}
