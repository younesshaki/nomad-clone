import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Chapter1 from "./scenes/Chapter1";
import Chapter2 from "./scenes/Chapter2";
import Chapter3 from "./scenes/Chapter3";
import Chapter4 from "./scenes/Chapter4";

interface SceneManagerProps {
  onFadeChange?: (fade: number) => void;
  onChapterChange?: (chapter: number) => void;
  currentChapter: number;
  onRegisterGoTo?: (fn: (partIndex: number, chapterIndex: number) => void) => void;
}

export default function SceneManager({ onFadeChange, onChapterChange, currentChapter }: SceneManagerProps) {
  const [chapter, setChapter] = useState(1);
  const [fade, setFade] = useState(0);
  const fadeRef = useRef(0);
  const fadeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  console.log("SceneManager rendered, chapter:", chapter);

  // Update chapter when prop changes
  useEffect(() => {
    if (currentChapter === chapter) return;
    fadeTimelineRef.current?.kill();

    const tl = gsap.timeline();
    fadeTimelineRef.current = tl;
    tl.to({ v: fadeRef.current }, {
      v: 1,
      duration: 0.6,
      onUpdate() {
        const newFade = (this.targets()[0] as { v: number }).v;
        fadeRef.current = newFade;
        setFade(newFade);
        onFadeChange?.(newFade);
      },
    })
      .add(() => {
        setChapter(currentChapter);
        onChapterChange?.(currentChapter);
      })
      .to({ v: 1 }, {
        v: 0,
        duration: 0.6,
        onUpdate() {
          const newFade = (this.targets()[0] as { v: number }).v;
          fadeRef.current = newFade;
          setFade(newFade);
          onFadeChange?.(newFade);
        },
      });

    return () => {
      tl.kill();
    };
  }, [currentChapter]);

  useEffect(() => {
    fadeRef.current = fade;
  }, [fade]);

  return (
    <>
      {chapter === 1 && <Chapter1 />}
      {chapter === 2 && <Chapter2 />}
      {chapter === 3 && <Chapter3 />}
      {chapter === 4 && <Chapter4 />}
    </>
  );
}
