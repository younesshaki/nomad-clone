import "./LoadingIndicator.css";

export function LoadingIndicator() {
  return (
    <div className="loadingIndicator" role="status" aria-live="polite">
      <div className="loader">
        <svg height="0" width="0" viewBox="0 0 64 64" className="absolute">
          <defs className="s-xJBuHA073rTt" xmlns="http://www.w3.org/2000/svg">
            <linearGradient
              className="s-xJBuHA073rTt"
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="b"
            >
              <stop className="s-xJBuHA073rTt" stopColor="#973BED" />
              <stop className="s-xJBuHA073rTt" stopColor="#007CFF" offset="1" />
            </linearGradient>
            <linearGradient
              className="s-xJBuHA073rTt"
              gradientUnits="userSpaceOnUse"
              y2="0"
              x2="0"
              y1="64"
              x1="0"
              id="c"
            >
              <stop className="s-xJBuHA073rTt" stopColor="#FFC800" />
              <stop className="s-xJBuHA073rTt" stopColor="#F0F" offset="1" />
              <animateTransform
                repeatCount="indefinite"
                keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
                keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                dur="8s"
                values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
                type="rotate"
                attributeName="gradientTransform"
              />
            </linearGradient>
            <linearGradient
              className="s-xJBuHA073rTt"
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="d"
            >
              <stop className="s-xJBuHA073rTt" stopColor="#00E0ED" />
              <stop className="s-xJBuHA073rTt" stopColor="#00DA72" offset="1" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 80"
          height="80"
          width="64"
          className="inline-block"
        >
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="letter dash"
            stroke="url(#b)"
            strokeWidth="6"
          >
            B
          </text>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          style={{ "--rotation-duration": "0ms", "--rotation-direction": "normal" } as React.CSSProperties}
          viewBox="0 0 64 80"
          height="80"
          width="64"
          className="inline-block"
        >
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="letter dash"
            stroke="url(#c)"
            strokeWidth="7"
          >
            R
          </text>
        </svg>
        <div className="w-2" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          style={{ "--rotation-duration": "0ms", "--rotation-direction": "normal" } as React.CSSProperties}
          viewBox="0 0 64 80"
          height="80"
          width="64"
          className="inline-block"
        >
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="letter dash"
            stroke="url(#d)"
            strokeWidth="6"
          >
            A
          </text>
        </svg>
        <div className="w-2" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 80"
          height="80"
          width="64"
          className="inline-block"
        >
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="letter dash"
            stroke="url(#b)"
            strokeWidth="6"
          >
            T
          </text>
        </svg>
      </div>
    </div>
  );
}
