import { useEffect, useState } from "react";
import { debugState } from "../../utils/DebugOverlay";

/**
 * A subtle "scroll to continue" indicator that appears at scene boundaries
 * when auto-play pauses and waits for user input.
 * 
 * NOTE: This component must be rendered OUTSIDE of the R3F Canvas to avoid
 * reconciler issues with HTML elements being interpreted as THREE objects.
 */
export function ScrollIndicator() {
  const [visible, setVisible] = useState(false);
  const [canScrollBack, setCanScrollBack] = useState(false);

  useEffect(() => {
    let rafId: number;
    
    const checkState = () => {
      setVisible(debugState.waitingForScroll);
      setCanScrollBack(debugState.canScrollBack);
      rafId = requestAnimationFrame(checkState);
    };
    
    rafId = requestAnimationFrame(checkState);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Scroll back indicator (top) */}
      {canScrollBack && (
        <div
          style={{
            position: "fixed",
            top: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 1000,
            pointerEvents: "none",
            animation: "scrollIndicatorFadeInDown 0.6s ease-out",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "40px",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              borderRadius: "12px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "50%",
                width: "4px",
                height: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: "2px",
                transform: "translateX(-50%)",
                animation: "scrollIndicatorBounceUp 1.5s ease-in-out infinite",
              }}
            />
          </div>
          <span
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
              fontWeight: 300,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            Scroll up to go back
          </span>
        </div>
      )}
      
      {/* Scroll forward indicator (bottom) - positioned higher to avoid chapter nav */}
      <div
        style={{
          position: "fixed",
          bottom: "120px", // Increased from 40px to avoid chapter nav overlap
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          zIndex: 1000,
          pointerEvents: "none",
          animation: "scrollIndicatorFadeInUp 0.6s ease-out",
        }}
      >
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px",
            fontWeight: 300,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          Scroll to continue
        </span>
        <div
          style={{
            width: "24px",
            height: "40px",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "12px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "50%",
              width: "4px",
              height: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "2px",
              transform: "translateX(-50%)",
              animation: "scrollIndicatorBounce 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes scrollIndicatorFadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes scrollIndicatorFadeInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes scrollIndicatorBounce {
          0%, 100% {
            top: 8px;
            opacity: 1;
          }
          50% {
            top: 20px;
            opacity: 0.5;
          }
        }
        @keyframes scrollIndicatorBounceUp {
          0%, 100% {
            bottom: 8px;
            opacity: 1;
          }
          50% {
            bottom: 20px;
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
