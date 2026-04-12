/**
 * SyncPreviewPanel.tsx
 *
 * Visual sync editor — lets you hear the VO and drag each text line's
 * reveal time until everything lines up perfectly.
 *
 * Toggle with W key.
 *
 * WORKFLOW
 * ────────
 * 1. Navigate to a scene in the experience.
 * 2. Press W to open this panel.
 * 3. Press ▶ to play the VO.
 * 4. Watch the white playhead move. The active line flashes green.
 * 5. Drag the ● dot on any line's bar left/right to shift its reveal time.
 * 6. Click anywhere on a bar (not on ●) to jump that line's start to that time.
 * 7. When it feels right, click 📋 COPY TIMINGS.
 * 8. Paste the copied snippet into the scene's content.ts, replacing the
 *    `lines: [...]` array. Save — Vite hot-reloads and the change is live.
 * 9. Press W to close.
 */

import {
  useState, useEffect, useRef, useCallback, type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { debugState } from "./DebugOverlay";
import { audioSyncRegistry } from "../scenes/part1/chapter1/audioSync";
import { CHAPTER1_CUES } from "../scenes/part1/chapter1/cueDatabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditableLine = {
  lineIndex: number;
  text: string;
  /** undefined = no timing set yet */
  startTime: number | undefined;
  endTime: number | undefined;
};

type DragState = {
  lineIndex: number;
  handle: "start" | "end";
  barEl: HTMLDivElement;
};

// ─── Colours ──────────────────────────────────────────────────────────────────

const C = {
  active:    "#00ffcc",
  inactive:  "#ffffff44",
  unset:     "#ffffff18",
  img:       "#ff9900",
  vid:       "#ff4466",
  playhead:  "#ffffff",
  bg:        "rgba(5,5,10,0.97)",
  border:    "#00ffcc33",
  rowHover:  "#ffffff08",
  dot:       "#00ffcc",
  dotBorder: "#00ffcc88",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function SyncPreviewPanel({ enabled }: { enabled: boolean }) {
  const [voTime, setVoTime]           = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [lines, setLines]             = useState<EditableLine[]>([]);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [duration, setDuration]       = useState(0);
  const [imageCues, setImageCues]     = useState<typeof CHAPTER1_CUES[string]["imageCues"]>([]);
  const [videoCues, setVideoCues]     = useState<typeof CHAPTER1_CUES[string]["videoCues"]>([]);
  const [copied, setCopied]           = useState(false);

  const drag          = useRef<DragState | null>(null);
  const rulerRef      = useRef<HTMLDivElement>(null);
  const barRefs       = useRef<Record<number, HTMLDivElement | null>>({});
  const linesRef      = useRef<EditableLine[]>([]);
  linesRef.current    = lines;

  const resolveDuration = useCallback((sceneId: string | null) => {
    if (!sceneId) return 0;
    const liveDuration = audioSyncRegistry.getDuration(sceneId);
    if (liveDuration > 0) return liveDuration;
    return CHAPTER1_CUES[sceneId]?.voDuration ?? 0;
  }, []);

  // ── Watch active scene ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    let rafId: number;
    let lastScene = "";
    const poll = () => {
      const sid = debugState.activeScene ?? null;
      if (sid !== lastScene) {
        lastScene = sid ?? "";
        setActiveSceneId(sid);
        if (sid && CHAPTER1_CUES[sid]) {
          const data = CHAPTER1_CUES[sid];
          setDuration(resolveDuration(sid));
          setImageCues(data.imageCues);
          setVideoCues(data.videoCues);
          // Build editable lines from allLines
          setLines(
            data.allLines.map((l, i) => ({
              lineIndex: i,
              text:      l.text,
              startTime: l.startTime,
              endTime:   l.endTime,
            }))
          );
          setSelectedLineIndex(data.allLines.length > 0 ? 0 : null);
          setVoTime(0);
          setIsPlaying(false);
        } else {
          setLines([]);
          setImageCues([]);
          setVideoCues([]);
          setSelectedLineIndex(null);
          setDuration(0);
        }
      }
      rafId = requestAnimationFrame(poll);
    };
    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, resolveDuration]);

  // Keep the ruler aligned to the real audio metadata if it becomes available
  // after the panel has already opened.
  useEffect(() => {
    if (!enabled || !activeSceneId) return;

    let rafId = 0;
    const pollDuration = () => {
      const nextDuration = resolveDuration(activeSceneId);
      setDuration(prev => {
        if (nextDuration <= 0) return prev;
        return Math.abs(prev - nextDuration) > 0.05 ? nextDuration : prev;
      });
      rafId = requestAnimationFrame(pollDuration);
    };

    rafId = requestAnimationFrame(pollDuration);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, activeSceneId, resolveDuration]);

  // ── Subscribe to VO time ────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !activeSceneId) return;
    const unsub = audioSyncRegistry.subscribe((time, id) => {
      if (id === activeSceneId) {
        setVoTime(time);
        setIsPlaying(!audioSyncRegistry.isPlaying(id) === false);
      }
    });
    return unsub;
  }, [enabled, activeSceneId]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!activeSceneId) return;
    if (isPlaying) {
      audioSyncRegistry.pause(activeSceneId);
      setIsPlaying(false);
    } else {
      audioSyncRegistry.play(activeSceneId);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (!activeSceneId) return;
    audioSyncRegistry.pause(activeSceneId);
    audioSyncRegistry.seekTo(activeSceneId, 0);
    setVoTime(0);
    setIsPlaying(false);
  };

  const stampSelectedLine = useCallback(() => {
    if (selectedLineIndex === null) return;
    const t = parseFloat(voTime.toFixed(1));
    setLines(prev => prev.map(line =>
      line.lineIndex === selectedLineIndex ? { ...line, startTime: t } : line
    ));
  }, [selectedLineIndex, voTime]);

  const selectAdjacentLine = useCallback((direction: -1 | 1) => {
    setSelectedLineIndex(prev => {
      if (linesRef.current.length === 0) return null;
      if (prev === null) return 0;
      return Math.max(0, Math.min(linesRef.current.length - 1, prev + direction));
    });
  }, []);

  // ── Ruler seek ──────────────────────────────────────────────────────────────
  const seekFromClientX = useCallback((clientX: number, refEl?: HTMLDivElement | null) => {
    const el = refEl ?? rulerRef.current;
    if (!el || !activeSceneId || duration <= 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const t = ratio * duration;
    audioSyncRegistry.seekTo(activeSceneId, t);
    setVoTime(t);
  }, [activeSceneId, duration]);

  const onRulerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    seekFromClientX(e.clientX);
  };

  // ── Dot drag ────────────────────────────────────────────────────────────────
  const onDotMouseDown = (
    e: React.MouseEvent,
    lineIndex: number,
    handle: "start" | "end",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const barEl = barRefs.current[lineIndex];
    if (!barEl) return;
    drag.current = { lineIndex, handle, barEl };
  };

  // Global mouse-move / mouse-up for drag
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (!d || duration <= 0) return;
      const rect = d.barEl.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const t = parseFloat((ratio * duration).toFixed(1));
      setLines(prev => prev.map(l => {
        if (l.lineIndex !== d.lineIndex) return l;
        if (d.handle === "start") return { ...l, startTime: t };
        return { ...l, endTime: t };
      }));
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [duration]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement | null)?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectAdjacentLine(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectAdjacentLine(-1);
      } else if (event.key.toLowerCase() === "e") {
        event.preventDefault();
        stampSelectedLine();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, selectAdjacentLine, stampSelectedLine]);

  // ── Click on bar (not dot) → set startTime ─────────────────────────────────
  const onBarClick = (e: React.MouseEvent, lineIndex: number) => {
    // only fire if we weren't dragging
    if (drag.current) return;
    const barEl = barRefs.current[lineIndex];
    if (!barEl || duration <= 0) return;
    const rect = barEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = parseFloat((ratio * duration).toFixed(1));
    setLines(prev => prev.map(l =>
      l.lineIndex === lineIndex ? { ...l, startTime: t } : l
    ));
  };

  // ── Copy timings to clipboard ───────────────────────────────────────────────
  const copyTimings = () => {
    const snippet = [
      "lines: [",
      ...linesRef.current.map(l => {
        const parts: string[] = [`text: ${JSON.stringify(l.text)}`];
        if (l.startTime !== undefined) parts.push(`startTime: ${l.startTime}`);
        if (l.endTime   !== undefined) parts.push(`endTime: ${l.endTime}`);
        return `  { ${parts.join(", ")} },`;
      }),
      "],",
    ].join("\n");
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!enabled) return null;

  const progress = duration > 0 ? voTime / duration : 0;
  // Portal to document.body so it sits in the root stacking context,
  // above the drei <Html> overlay (which also portals to body at zIndex 200).
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}.${Math.floor((s % 1) * 10)}`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return createPortal(
    <div style={panelStyle}>

      {/* ── Header ── */}
      <div style={headerStyle}>
        <span style={{ color: C.active, fontWeight: "bold", fontSize: "12px" }}>
          🎬 SYNC PREVIEW
        </span>
        <span style={{ opacity: 0.45, flex: 1, marginLeft: 8 }}>
          {activeSceneId ?? "no active scene"}
        </span>
        <button onClick={handlePlayPause} disabled={!activeSceneId} style={btnStyle}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={handleStop} disabled={!activeSceneId} style={btnStyle}>⏹</button>
        <button
          onClick={stampSelectedLine}
          disabled={selectedLineIndex === null}
          style={btnStyle}
          title="Stamp the selected line to the current playhead time"
        >
          Stamp Selected
        </button>
        <span style={{ opacity: 0.6, minWidth: 90, textAlign: "right" }}>
          {fmt(voTime)} / {fmt(duration)}
        </span>
        <button
          onClick={copyTimings}
          disabled={lines.length === 0}
          style={{ ...btnStyle, marginLeft: 8, color: copied ? C.active : "#fff" }}
        >
          {copied ? "✓ Copied!" : "📋 Copy Timings"}
        </button>
      </div>

      {/* ── Overview timeline (ruler + image/video tracks) ── */}
      <div style={{ marginBottom: 8 }}>
        {/* Ruler */}
        <div
          ref={rulerRef}
          onMouseDown={onRulerMouseDown}
          style={rulerStyle}
        >
          <RulerTicks duration={duration} />
          {/* Playhead */}
          <div style={{ ...playheadStyle, left: `${progress * 100}%` }} />
        </div>

        {/* Image track */}
        {imageCues.length > 0 && (
          <MediaTrack
            label="IMG"
            color={C.img}
            cues={imageCues}
            duration={duration}
            voTime={voTime}
            getLabel={(_, i) => `img${i + 1}`}
            getTooltip={c => c.description}
          />
        )}

        {/* Video track */}
        {videoCues.length > 0 && (
          <MediaTrack
            label="VID"
            color={C.vid}
            cues={videoCues}
            duration={duration}
            voTime={voTime}
            getLabel={(_, i) => `vid${i + 1}`}
            getTooltip={c => c.description}
          />
        )}
      </div>

      {/* ── Text lines ── */}
      {lines.length === 0 ? (
        <div style={{ opacity: 0.35, textAlign: "center", padding: "16px 0", fontSize: "11px" }}>
          No lines found for this scene. Navigate to a Chapter 1 scene.
        </div>
      ) : (
        <div style={linesContainerStyle}>
          <div style={{ opacity: 0.4, fontSize: "10px", marginBottom: 6, paddingLeft: 2 }}>
            TEXT LINES — drag ● to set reveal time, click bar to place, ▶ to preview
          </div>

          {lines.map(line => {
            const hasTiming = line.startTime !== undefined;
            const isActive  = hasTiming && voTime >= line.startTime! &&
                              (line.endTime === undefined || voTime < line.endTime);
            const startPct  = hasTiming ? (line.startTime! / duration) * 100 : null;

            return (
              <div
                key={line.lineIndex}
                onClick={() => setSelectedLineIndex(line.lineIndex)}
                style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           8,
                  padding:       "4px 4px",
                  borderRadius:  4,
                  marginBottom:  2,
                  background:    line.lineIndex === selectedLineIndex
                    ? "#ffffff10"
                    : isActive ? "#00ffcc10" : "transparent",
                  border:        `1px solid ${
                    line.lineIndex === selectedLineIndex
                      ? "#ffffff44"
                      : isActive ? C.active + "44" : "transparent"
                  }`,
                  cursor:        "pointer",
                }}
              >
                {/* Active indicator */}
                <div style={{
                  width:    8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: isActive ? C.active : hasTiming ? "#ffffff20" : "#ffffff08",
                  boxShadow:  isActive ? `0 0 6px ${C.active}` : "none",
                }} />

                {/* Time badge */}
                <div style={{
                  width:      38, flexShrink: 0, textAlign: "right",
                  fontSize:   "10px", fontVariantNumeric: "tabular-nums",
                  color:      hasTiming ? (isActive ? C.active : "#ffffff88") : "#ffffff25",
                }}>
                  {hasTiming ? `${line.startTime!.toFixed(1)}s` : "—"}
                </div>

                {/* Text */}
                <div style={{
                  flex:          1,
                  fontSize:      "11px",
                  color:         isActive ? "#fff" : hasTiming ? "#ffffff99" : "#ffffff33",
                  overflow:      "hidden",
                  textOverflow:  "ellipsis",
                  whiteSpace:    "nowrap",
                  minWidth:      0,
                }}>
                  {line.text}
                </div>

                {/* Position bar */}
                <div
                  ref={el => { barRefs.current[line.lineIndex] = el; }}
                  onClick={e => onBarClick(e, line.lineIndex)}
                  style={barStyle}
                >
                  {/* Playhead ghost on bar */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0,
                    left:     `${progress * 100}%`, width: 1,
                    background: C.playhead, opacity: 0.3, pointerEvents: "none",
                  }} />

                  {/* Timed range fill */}
                  {hasTiming && (
                    <div style={{
                      position:   "absolute",
                      top:        2, bottom: 2,
                      left:       `${startPct}%`,
                      right:      line.endTime !== undefined
                        ? `${100 - (line.endTime / duration) * 100}%`
                        : "0%",
                      background: isActive ? C.active + "44" : C.active + "18",
                      borderRadius: 2,
                      pointerEvents: "none",
                    }} />
                  )}

                  {/* Start dot (draggable) */}
                  {hasTiming && (
                    <div
                      onMouseDown={e => onDotMouseDown(e, line.lineIndex, "start")}
                      title={`Start: ${line.startTime!.toFixed(1)}s — drag to move`}
                      style={{
                        ...dotStyle,
                        left:       `${startPct}%`,
                        background: isActive ? C.dot : "#ffffff55",
                        boxShadow:  isActive ? `0 0 5px ${C.dot}` : "none",
                        transform:  "translateX(-50%)",
                      }}
                    />
                  )}

                  {/* Click hint when no timing */}
                  {!hasTiming && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "9px", color: "#ffffff20", pointerEvents: "none",
                    }}>
                      click to set
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: 8, opacity: 0.3, fontSize: "9px", textAlign: "center" }}>
        W — toggle &nbsp;|&nbsp; Click ruler to seek &nbsp;|&nbsp;
        Drag ● to adjust &nbsp;|&nbsp; 📋 Copy Timings → paste into content.ts lines array
      </div>
    </div>,
    document.body
  );
}

// ─── Media track (image / video) ─────────────────────────────────────────────

function MediaTrack<T extends { startTime: number; endTime: number }>({
  label, color, cues, duration, voTime, getLabel, getTooltip,
}: {
  label: string;
  color: string;
  cues: T[];
  duration: number;
  voTime: number;
  getLabel: (cue: T, i: number) => string;
  getTooltip?: (cue: T) => string | undefined;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
      <span style={{ width: 28, fontSize: "9px", color, opacity: 0.7, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 18, position: "relative", background: "#ffffff06", borderRadius: 3 }}>
        {duration > 0 && cues.map((c, i) => {
          const left  = (c.startTime / duration) * 100;
          const width = Math.max(1, ((c.endTime - c.startTime) / duration) * 100);
          const active = voTime >= c.startTime && voTime < c.endTime;
          return (
            <div
              key={i}
              title={getTooltip?.(c)}
              style={{
                position: "absolute", top: 2, bottom: 2,
                left:     `${left}%`, width: `${width}%`,
                background: active ? color : color + "33",
                border:     `1px solid ${color}88`,
                borderRadius: 2,
                display:    "flex", alignItems: "center", justifyContent: "center",
                fontSize:   "9px", color: active ? "#000" : color,
                overflow:   "hidden", fontWeight: active ? "bold" : "normal",
              }}
            >
              {width > 3 ? getLabel(c, i) : ""}
            </div>
          );
        })}
        {/* playhead */}
        {duration > 0 && (
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${(voTime / duration) * 100}%`,
            width: 1, background: C.playhead, opacity: 0.35, pointerEvents: "none",
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Ruler ticks ─────────────────────────────────────────────────────────────

function RulerTicks({ duration }: { duration: number }) {
  if (duration <= 0) return null;
  const step = duration <= 20 ? 2 : duration <= 60 ? 5 : 10;
  const ticks: number[] = [];
  for (let t = 0; t <= duration; t += step) ticks.push(t);
  return (
    <>
      {ticks.map(t => (
        <div key={t} style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${(t / duration) * 100}%`, width: 1,
          background: "#ffffff30", pointerEvents: "none",
        }}>
          <span style={{
            position: "absolute", top: 2, left: 3,
            fontSize: "9px", color: "#ffffff55", userSelect: "none",
          }}>{t}s</span>
        </div>
      ))}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const panelStyle: CSSProperties = {
  position:    "fixed",
  bottom:      10,
  left:        "50%",
  transform:   "translateX(-50%)",
  background:  C.bg,
  border:      `1px solid ${C.border}`,
  borderRadius: 10,
  padding:     "14px 18px",
  zIndex:      2147483647, // max browser z-index, guarantees top of every stacking context
  fontFamily:  "monospace",
  fontSize:    "11px",
  color:       "#fff",
  width:       "min(960px, 96vw)",
  maxHeight:   "80vh",
  display:     "flex",
  flexDirection: "column",
  userSelect:  "none",
};

const headerStyle: CSSProperties = {
  display:      "flex",
  alignItems:   "center",
  gap:          8,
  marginBottom: 10,
};

const rulerStyle: CSSProperties = {
  position:    "relative",
  height:      20,
  cursor:      "col-resize",
  background:  "#ffffff08",
  borderRadius: 3,
  overflow:    "visible",
  marginBottom: 4,
};

const playheadStyle: CSSProperties = {
  position:  "absolute",
  top:       -2, bottom: -2,
  width:     2,
  background: C.playhead,
  boxShadow: `0 0 6px ${C.playhead}`,
  pointerEvents: "none",
  zIndex:    5,
};

const linesContainerStyle: CSSProperties = {
  overflowY:  "auto",
  maxHeight:  "50vh",
  paddingRight: 4,
};

const barStyle: CSSProperties = {
  width:       200,
  flexShrink:  0,
  height:      20,
  background:  "#ffffff08",
  borderRadius: 3,
  position:    "relative",
  cursor:      "crosshair",
  overflow:    "visible",
};

const dotStyle: CSSProperties = {
  position:    "absolute",
  top:         "50%",
  width:       10,
  height:      10,
  borderRadius: "50%",
  background:  C.dot,
  border:      `1.5px solid ${C.dotBorder}`,
  transform:   "translate(-50%, -50%)",
  cursor:      "ew-resize",
  zIndex:      2,
};

const btnStyle: CSSProperties = {
  background:   "#ffffff12",
  border:       "1px solid #ffffff28",
  color:        "#fff",
  borderRadius: 4,
  padding:      "3px 10px",
  cursor:       "pointer",
  fontSize:     "12px",
  fontFamily:   "monospace",
};
