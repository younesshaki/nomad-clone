import { useEffect, useRef, useState } from "react";
import "../loaders/preloader/styles.css";
import preloadGateVideo from "../../assets/preload/preload-gate.mp4";

type PreloadGateProps = {
  onStart: () => void;
};

export default function PreloadGate({ onStart }: PreloadGateProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

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

    const handlePlay = () => setVideoPlaying(true);
    const handlePause = () => setVideoPlaying(false);

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
    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
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
      <button
        className="preloadGateAudioButton"
        type="button"
        onClick={handlePlayWoodz}
        disabled={!videoReady}
      >
        {videoPlaying ? "Woodz Playing" : 'Play "Woodz"'}
      </button>
    </div>
  );
}
