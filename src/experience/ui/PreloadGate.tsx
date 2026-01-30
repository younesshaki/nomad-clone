import { useEffect, useRef, useState } from "react";
import "../loaders/preloader/styles.css";
import preloadGateVideo from "../../assets/preload/preload-gate.mp4";

type PreloadGateProps = {
  onStart: () => void;
};

export default function PreloadGate({ onStart }: PreloadGateProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;

    const handleCanPlay = () => {
      setVideoReady(true);
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    };

    const handlePlay = () => {};
    const handlePause = () => {};

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleStart = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      setAudioEnabled(true);
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }
    onStart();
  };

  const handlePlayWoodz = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = false;
    setAudioEnabled(true);
    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  };

  const handleMuteWoodz = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = true;
    setAudioEnabled(false);
  };

  const handleAudioToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const shouldMute = event.target.checked;
    if (shouldMute) {
      handleMuteWoodz();
    } else {
      handlePlayWoodz();
    }
  };

  return (
    <div className="preloadGate">
      <video
        ref={videoRef}
        className="preloadGateVideo"
        src={preloadGateVideo}
        autoPlay
        loop
        playsInline
        preload="auto"
      />
      <button className="preloadGateButton" type="button" onClick={handleStart}>
        Play
      </button>
      <div className="preloadGateAudioControls" aria-label="Woodz audio controls">
        <input
          id="preloadGateAudioToggle"
          type="checkbox"
          checked={!audioEnabled}
          onChange={handleAudioToggle}
          disabled={!videoReady}
        />
        <label htmlFor="preloadGateAudioToggle" className="toggleSwitch">
          <div className="speaker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75">
              <path
                d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
                style={{
                  stroke: "#fff",
                  strokeWidth: 5,
                  strokeLinejoin: "round",
                  fill: "#fff",
                }}
              />
              <path
                d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
                style={{
                  fill: "none",
                  stroke: "#fff",
                  strokeWidth: 5,
                  strokeLinecap: "round",
                }}
              />
            </svg>
          </div>
          <div className="mute-speaker">
            <svg viewBox="0 0 75 75" stroke="#fff" strokeWidth="5">
              <path
                d="m39,14-17,15H6V48H22l17,15z"
                fill="#fff"
                strokeLinejoin="round"
              />
              <path
                d="m49,26 20,24m0-24-20,24"
                fill="#fff"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </label>
      </div>
    </div>
  );
}
