import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import preloadGateVideo from "../../assets/preload/YTDown.com_YouTube_Abstract-White-Background-4K-Motion-Grap_Media_kwmHaXUAa0M_001_1080p.mp4";

type CinematicShellProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * Full-viewport immersive shell with the looping background video.
 * Reusable across homepage, preload gate, or any atmospheric screen.
 */
export default function CinematicShell({ children, className }: CinematicShellProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const handleCanPlay = () => {
      setVideoReady(true);
      video.play().catch(() => {});
    };

    video.addEventListener("canplay", handleCanPlay);
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <div
      className={`cinematicShell${className ? ` ${className}` : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        className="cinematicShell__video"
        src={preloadGateVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: videoReady ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      />
      {/* Dark overlay for readability */}
      <div
        className="cinematicShell__overlay"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.85) 100%)",
          zIndex: 1,
        }}
      />
      {/* Content layer */}
      <div
        className="cinematicShell__content"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
