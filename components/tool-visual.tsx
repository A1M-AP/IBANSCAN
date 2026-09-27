import type { ReactNode } from "react";
/** Original illustrations keyed by tool, independently from shared tool behavior. */
export function ToolVisual({ slug }: { slug: string }) {
  const pictures: Record<string, ReactNode> = {
    "iban-validator": (
      <>
        <rect
          x="83"
          y="30"
          width="134"
          height="89"
          rx="14"
          className="visual-fill"
        />
        <path d="M102 51h45m-45 15h70m-70 16h35" />
        <circle cx="203" cy="102" r="24" className="visual-fill" />
        <path className="visual-draw" d="m190 102 9 9 17-20" strokeWidth="3" />
      </>
    ),
    "iban-analyzer": (
      <>
        <rect
          x="65"
          y="32"
          width="170"
          height="34"
          rx="9"
          className="visual-fill"
        />
        <path d="M86 49h25m17 0h20m17 0h48M100 66v19m50-19v19m50-19v19" />
        {[77, 127, 177].map((x, i) => (
          <g key={x}>
            <rect
              x={x}
              y={85 + i * 4}
              width="46"
              height="30"
              rx="7"
              className="visual-fill"
            />
            <path d={`M${x + 12} ${100 + i * 4}h22`} />
          </g>
        ))}
      </>
    ),
    "iban-formatter": (
      <>
        <path
          d="M73 36h154m-154 9h117M150 58v24m-7-7 7 7 7-7"
          className="visual-draw"
        />
        {[65, 111, 157, 203].map((x) => (
          <rect
            key={x}
            x={x}
            y="98"
            width="33"
            height="22"
            rx="5"
            className="visual-fill"
          />
        ))}
      </>
    ),
    "iban-generator": (
      <>
        <rect
          x="75"
          y="40"
          width="118"
          height="72"
          rx="12"
          className="visual-fill"
        />
        <path d="m108 59-12 17 12 17m47-34 12 17-12 17m-17-37-13 38" />
        <circle cx="210" cy="94" r="23" className="visual-fill" />
        <path d="M210 82v24m-12-12h24" className="visual-draw" />
      </>
    ),
    "iban-country-checker": (
      <>
        <circle cx="144" cy="75" r="47" className="visual-fill" />
        <ellipse cx="144" cy="75" rx="21" ry="47" />
        <path d="M99 60h90M99 90h90" />
        <path
          d="M207 35c-26 0-26 29 0 49 26-20 26-49 0-49Z"
          className="visual-fill"
        />
        <circle cx="207" cy="49" r="5" />
      </>
    ),
    "bic-swift-finder": (
      <>
        <path
          d="m74 59 58-31 58 31v10H74Zm10 54h96v10H84Z"
          className="visual-fill"
        />
        <path d="M91 79v23m27-23v23m27-23v23m27-23v23" strokeWidth="4" />
        <circle cx="202" cy="85" r="25" className="visual-fill" />
        <path d="m221 105 18 19M190 85h24m-12-12v24" />
      </>
    ),
    "bank-identifier-finder": (
      <>
        <rect
          x="67"
          y="39"
          width="170"
          height="72"
          rx="12"
          className="visual-fill"
        />
        <path d="M85 61h34m-34 28h22m65 0h45" />
        <rect x="117" y="73" width="45" height="29" rx="5" />
        <path d="M126 87h27M140 112v18m-7-7 7 7 7-7" className="visual-draw" />
      </>
    ),
    "abi-cab-checker": (
      <>
        <rect
          x="116"
          y="24"
          width="68"
          height="33"
          rx="8"
          className="visual-fill"
        />
        <path d="M150 57v22m-51 0h102m-102 0v16m102-16v16" />
        {[71, 174].map((x) => (
          <g key={x}>
            <rect
              x={x}
              y="95"
              width="55"
              height="32"
              rx="7"
              className="visual-fill"
            />
            <path d={`M${x + 12} 111h31`} />
          </g>
        ))}
        <path d="M133 40h34" />
      </>
    ),
    "sepa-checker": (
      <>
        <circle
          cx="150"
          cy="75"
          r="48"
          strokeDasharray="2 12"
          strokeWidth="4"
        />
        <path
          className="visual-draw"
          d="M128 60h45m-49 16h41m12-31c-54-23-65 85-5 60M79 62h26m-8-8 8 8-8 8m124 20h-26m8-8-8 8 8 8"
        />
      </>
    ),
    "bulk-iban-validator": (
      <>
        {[34, 68, 102].map((y, i) => (
          <g key={y}>
            <rect
              x={76 + i * 5}
              y={y}
              width="139"
              height="25"
              rx="6"
              className="visual-fill"
            />
            <path d={`M${90 + i * 5} ${y + 12}h65m20 0 5 5 10-10`} />
          </g>
        ))}
      </>
    ),
    "csv-iban-validator": (
      <>
        <path d="M100 22h70l30 29v78H100Z" className="visual-fill" />
        <path d="M170 22v29h30M114 70h72m-72 18h72m-72 18h72m-48-36v36m24-36v36" />
        <path className="visual-draw" d="M78 65v33m-10-10 10 10 10-10" />
      </>
    ),
    "iban-calculator": (
      <>
        <rect
          x="106"
          y="22"
          width="91"
          height="110"
          rx="13"
          className="visual-fill"
        />
        <rect x="120" y="36" width="63" height="24" rx="5" />
        {[76, 96, 116].map((y) =>
          [125, 146, 167].map((x) => (
            <path key={x + ":" + y} d={`M${x} ${y}h7`} strokeWidth="4" />
          )),
        )}
        <path d="M80 57v24m-12-12h24m122 23h23m-23 10h23" />
      </>
    ),
    "exchange-rates": (
      <>
        <path d="M74 29v91h157M87 53h144m-144 29h144" strokeOpacity=".25" />
        <path
          className="visual-chart"
          d="m86 103 27-25 28 11 25-41 24 12 37-30"
          strokeWidth="3"
        />
        <circle cx="227" cy="30" r="5" className="visual-fill" />
      </>
    ),
    "currency-converter": (
      <>
        <circle cx="113" cy="66" r="33" className="visual-fill" />
        <circle cx="187" cy="91" r="33" className="visual-fill" />
        <text
          x="113"
          y="77"
          textAnchor="middle"
          stroke="none"
          fill="currentColor"
          fontSize="31"
        >
          €
        </text>
        <text
          x="187"
          y="102"
          textAnchor="middle"
          stroke="none"
          fill="currentColor"
          fontSize="31"
        >
          $
        </text>
        <path
          className="visual-draw"
          d="M163 35h53l-8-8m8 8-8 8M136 122H83l8-8m-8 8 8 8"
        />
      </>
    ),
    "currency-codes": (
      <>
        <rect
          x="91"
          y="25"
          width="118"
          height="104"
          rx="12"
          className="visual-fill"
        />
        {["EUR", "USD", "GBP"].map((c, i) => (
          <g key={c}>
            <text
              x="108"
              y={51 + i * 29}
              stroke="none"
              fill="currentColor"
              fontFamily="monospace"
              fontSize="15"
            >
              {c}
            </text>
            <path d={`M156 ${46 + i * 29}h35`} />
          </g>
        ))}
      </>
    ),
  };
  return (
    <div className={`tool-visual visual-${slug}`} aria-hidden="true">
      <svg viewBox="0 0 300 150" fill="none">
        <g
          className="visual-float"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {pictures[slug]}
        </g>
      </svg>
    </div>
  );
}
