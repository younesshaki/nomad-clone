import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraRig from "./CameraRig";
import SceneManager from "./SceneManager";
import FadeOverlay from "./FadeOverlay";
import ChapterNav from "./ui/ChapterNav";
import { useState, useRef } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";

export default function Experience() {
  const [fade, setFade] = useState(0);
  const [chapter, setChapter] = useState(1);
  const fadeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const fadeObjRef = useRef({ value: 0 });
  
  console.log("Experience component rendered", { fade, chapter });
  
  const handleChapterChange = (newChapter: number) => {
    if (newChapter === chapter) return;
    
    console.log("Switching from chapter", chapter, "to", newChapter);
    
    // Kill any existing animation
    if (fadeTimelineRef.current) {
      fadeTimelineRef.current.kill();
    }
    
    // Create new fade animation
    const tl = gsap.timeline();
    fadeTimelineRef.current = tl;
    
    // Fade out
    tl.to(fadeObjRef.current, {
      value: 1,
      duration: 0.6,
      onUpdate: () => {
        flushSync(() => {
          setFade(fadeObjRef.current.value);
        });
      },
    });
    
    // Change chapter at peak fade
    tl.call(() => {
      console.log("Changing chapter to", newChapter);
      setChapter(newChapter);
    });
    
    // Fade in
    tl.to(fadeObjRef.current, {
      value: 0,
      duration: 0.6,
      onUpdate: () => {
        flushSync(() => {
          setFade(fadeObjRef.current.value);
        });
      },
    });
  };
  
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 5], fov: 75 }}
      >
        <color attach="background" args={["black"]} />
        <CameraRig chapter={chapter} />
        <SceneManager 
          currentChapter={chapter}
          onFadeChange={setFade}
          onChapterChange={handleChapterChange}
        />
        <pointLight position={[0, 5, 0]} intensity={1} color="white" />
        <OrbitControls key={chapter} />
      </Canvas>
      <FadeOverlay opacity={fade} />
      <ChapterNav currentChapter={chapter} onChapterChange={handleChapterChange} />
    </div>
  );
}
