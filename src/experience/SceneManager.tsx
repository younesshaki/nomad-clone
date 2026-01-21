import { useEffect, useState } from "react";
import Chapter1 from "./scenes/Chapter1";
import Chapter2 from "./scenes/Chapter2";
import Chapter3 from "./scenes/Chapter3";
import Chapter4 from "./scenes/Chapter4";

interface SceneManagerProps {
  onFadeChange?: (fade: number) => void;
  onChapterChange?: (chapter: number) => void;
  currentChapter: number;
}

export default function SceneManager({ onFadeChange, onChapterChange, currentChapter }: SceneManagerProps) {
  const [chapter, setChapter] = useState(1);

  console.log("SceneManager rendered, chapter:", chapter);

  // Update chapter when prop changes
  useEffect(() => {
    setChapter(currentChapter);
  }, [currentChapter]);

  return (
    <>
      {chapter === 1 && <Chapter1 />}
      {chapter === 2 && <Chapter2 />}
      {chapter === 3 && <Chapter3 />}
      {chapter === 4 && <Chapter4 />}
    </>
  );
}
