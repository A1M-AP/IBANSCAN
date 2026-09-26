/** Lightweight original vector illustrations; decorative and motion-safe. */
export function ToolVisual({ kind = "scanner" }: { kind?: string }) {
  const money = ["rates", "converter", "currencies"].includes(kind);
  return (
    <div className={`tool-visual visual-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 300 150" fill="none">
        <g className="visual-float" stroke="currentColor" strokeWidth="1.5">
          {money ? (
            <>
              <ellipse
                cx="128"
                cy="87"
                rx="37"
                ry="37"
                className="visual-fill"
              />
              <ellipse
                cx="172"
                cy="63"
                rx="37"
                ry="37"
                className="visual-fill"
              />
              <text
                x="172"
                y="76"
                textAnchor="middle"
                stroke="none"
                fill="currentColor"
                fontSize="36"
              >
                €
              </text>
              <path d="M117 77h15m-20 8h17m9-20c-23-14-34 31-7 36M208 38l15 12-15 12m-7-12h22M92 111l-15-12 15-12m7 12H77" />
            </>
          ) : kind === "bank" ? (
            <>
              <path
                className="visual-fill"
                d="M88 57l62-30 62 30v11H88zM94 116h112v10H94z"
              />
              <path d="M104 77v29m31-29v29m30-29v29m31-29v29" strokeWidth="5" />
              <circle cx="150" cy="49" r="4" />
            </>
          ) : (
            <>
              <rect
                x="67"
                y="32"
                width="166"
                height="87"
                rx="15"
                className="visual-fill"
              />
              <path d="M87 57h36m-36 40h50m10 0h21m10 0h36" />
              <text
                x="88"
                y="83"
                stroke="none"
                fill="currentColor"
                fontSize="17"
                fontFamily="monospace"
              >
                IT · 00 · 1234
              </text>
              <path className="visual-scan" d="M75 40v70" strokeWidth="2" />
              <path d="M220 101l8 8 15-18" strokeWidth="3" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
