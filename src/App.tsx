import "./App.scss";
import { useCallback, useState } from "react";
import { UiSoundProvider } from "./experience/audio/UiSoundProvider";
import Experience from "./experience/Experience";
import { StoryProvider } from "./experience/story/StoryProvider";
import PreloadGate from "./experience/ui/PreloadGate";
import StoryHomePage from "./experience/ui/StoryHomePage";

type AppScreen = "gate" | "home" | "experience";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("gate");
  const [entryPartIndex, setEntryPartIndex] = useState(0);
  const [entryChapterIndex, setEntryChapterIndex] = useState(0);

  const handleEnterExperience = useCallback(
    (partIndex: number, chapterIndex: number) => {
      setEntryPartIndex(partIndex);
      setEntryChapterIndex(chapterIndex);
      setScreen("experience");
    },
    []
  );

  const handleGoHome = useCallback(() => {
    setScreen("home");
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      overflow: "hidden",
    }}>
      <StoryProvider>
        <UiSoundProvider>
          {screen === "gate" ? (
            <PreloadGate onStart={handleGoHome} />
          ) : screen === "experience" ? (
            <Experience
              initialPartIndex={entryPartIndex}
              initialChapterIndex={entryChapterIndex}
              onGoHome={handleGoHome}
            />
          ) : (
            <StoryHomePage onEnter={handleEnterExperience} />
          )}
        </UiSoundProvider>
      </StoryProvider>
    </div>
  );
}
