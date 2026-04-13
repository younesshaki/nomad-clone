import "./App.scss";
import { useState } from "react";
import Experience from "./experience/Experience";
import { StoryProvider } from "./experience/story/StoryProvider";
import PreloadGate from "./experience/ui/PreloadGate";

export default function App() {
  const [experienceStarted, setExperienceStarted] = useState(false);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      margin: 0,
      padding: 0,
      overflow: "hidden",
    }}>
      <StoryProvider>
        {experienceStarted ? (
          <Experience />
        ) : (
          <PreloadGate onStart={() => setExperienceStarted(true)} />
        )}
      </StoryProvider>
    </div>
  );
}
