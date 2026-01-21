import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
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

  // helper fade functions
  const fadeIn = () => gsap.to({ v: fade }, {
    v: 0,
    duration: 1,
    onUpdate() { 
      const newFade = (this.targets()[0] as any).v;
      setFade(newFade);
      onFadeChange?.(newFade);
    }
  });

  const fadeOut = () => gsap.to({ v: fade }, {
    v: 1,
    duration: 1,
    onUpdate() { 
      const newFade = (this.targets()[0] as any).v;
      setFade(newFade);
      onFadeChange?.(newFade);
    }
  });

  // Don't auto-play timeline - let user control with buttons
  // useEffect(() => {
  //   // MASTER FILM TIMELINE
  //   const tl = gsap.timeline();
  //   // ... timeline code removed for manual control
  // }, []);

  return (
    <>
      {chapter === 1 && <Chapter1 />}
      {chapter === 2 && <Chapter2 />}
      {chapter === 3 && <Chapter3 />}
      {chapter === 4 && <Chapter4 />}
    </>
  );
}
