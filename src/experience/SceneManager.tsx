import { useEffect, useState } from "react";
import Part1Chapter1 from "./scenes/part1/Chapter1";
import Part1Chapter2 from "./scenes/part1/Chapter2";
import Part1Chapter3 from "./scenes/part1/Chapter3";
import Part1Chapter4 from "./scenes/part1/Chapter4";
import Part2Chapter1 from "./scenes/part2/Chapter1";
import Part2Chapter2 from "./scenes/part2/Chapter2";
import Part2Chapter3 from "./scenes/part2/Chapter3";
import Part2Chapter4 from "./scenes/part2/Chapter4";
import Part3Chapter1 from "./scenes/part3/Chapter1";
import Part3Chapter2 from "./scenes/part3/Chapter2";
import Part3Chapter3 from "./scenes/part3/Chapter3";
import Part3Chapter4 from "./scenes/part3/Chapter4";
import Part4Chapter1 from "./scenes/part4/Chapter1";
import Part4Chapter2 from "./scenes/part4/Chapter2";
import Part4Chapter3 from "./scenes/part4/Chapter3";
import Part4Chapter4 from "./scenes/part4/Chapter4";
import Part5Chapter1 from "./scenes/part5/Chapter1";
import Part5Chapter2 from "./scenes/part5/Chapter2";
import Part5Chapter3 from "./scenes/part5/Chapter3";
import Part5Chapter4 from "./scenes/part5/Chapter4";


interface SceneManagerProps {
  currentChapter: number;
  currentPart: number;
  onRegisterGoTo?: (fn: (partIndex: number, chapterIndex: number) => void) => void;
}

export default function SceneManager({ currentChapter, currentPart }: SceneManagerProps) {
  const [chapter, setChapter] = useState(1);
  const [part, setPart] = useState(1);

  console.log("SceneManager rendered, part:", part, "chapter:", chapter);

  // Update chapter/part immediately when prop changes (Experience handles the fade timing)
  useEffect(() => {
    setChapter(currentChapter);
    setPart(currentPart);
  }, [currentChapter, currentPart]);

  const renderScene = () => {
    switch (part) {
      case 1:
        if (chapter === 1) return <Part1Chapter1 />;
        if (chapter === 2) return <Part1Chapter2 />;
        if (chapter === 3) return <Part1Chapter3 />;
        if (chapter === 4) return <Part1Chapter4 />;
        break;
      case 2:
        if (chapter === 1) return <Part2Chapter1 />;
        if (chapter === 2) return <Part2Chapter2 />;
        if (chapter === 3) return <Part2Chapter3 />;
        if (chapter === 4) return <Part2Chapter4 />;
        break;
      case 3:
        if (chapter === 1) return <Part3Chapter1 />;
        if (chapter === 2) return <Part3Chapter2 />;
        if (chapter === 3) return <Part3Chapter3 />;
        if (chapter === 4) return <Part3Chapter4 />;
        break;
      case 4:
        if (chapter === 1) return <Part4Chapter1 />;
        if (chapter === 2) return <Part4Chapter2 />;
        if (chapter === 3) return <Part4Chapter3 />;
        if (chapter === 4) return <Part4Chapter4 />;
        break;
      case 5:
        if (chapter === 1) return <Part5Chapter1 />;
        if (chapter === 2) return <Part5Chapter2 />;
        if (chapter === 3) return <Part5Chapter3 />;
        if (chapter === 4) return <Part5Chapter4 />;
        break;
      default:
        return null;
    }
    return null;
  };

  return (
    <>
      {renderScene()}
    </>
  );
}
