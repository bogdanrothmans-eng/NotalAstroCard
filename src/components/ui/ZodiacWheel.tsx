"use client";

/** Zodiac wheel line-art — stand-in for the exported Figma illustration. */
export function ZodiacWheel({ h = 180 }: { h?: number }) {
  const glyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const cx = 160,
    cy = 150,
    R1 = 118,
    R2 = 94;
  return (
    <svg viewBox="0 0 320 300" width="100%" height={h} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      {[...Array(46)].map((_, i) => (
        <circle
          key={"s" + i}
          cx={(i * 73) % 320}
          cy={(i * 131) % 300}
          r={i % 6 === 0 ? 1.5 : 0.7}
          fill="rgba(255,255,255,0.5)"
        />
      ))}
      <g stroke="rgba(255,255,255,0.45)" fill="none" strokeWidth="1">
        <circle cx={cx} cy={cy} r={R1} />
        <circle cx={cx} cy={cy} r={R2} />
        {glyphs.map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * R2}
              y1={cy + Math.sin(a) * R2}
              x2={cx + Math.cos(a) * R1}
              y2={cy + Math.sin(a) * R1}
            />
          );
        })}
      </g>
      <g stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1">
        {[...Array(12)].map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={"c" + i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R2} y2={cy + Math.sin(a) * R2} />;
        })}
        <circle cx={cx} cy={cy} r={R2 * 0.5} />
      </g>
      {glyphs.map((g, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
        const rr = (R1 + R2) / 2;
        return (
          <text
            key={g}
            x={cx + Math.cos(a) * rr}
            y={cy + Math.sin(a) * rr + 4}
            fill="rgba(255,255,255,0.7)"
            fontSize="12"
            textAnchor="middle"
          >
            {g}
          </text>
        );
      })}
      {/* face profile facing right */}
      <path
        d="M150 92 c 22 2 34 22 34 50 c 0 16 -6 24 -10 32 c -3 6 2 12 8 12 c -2 8 -12 10 -20 6 c -16 -8 -28 -28 -28 -52 c 0 -28 14 -46 24 -50 z"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
      />
      <circle cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.85)" />
      {/* crescent moon top-right */}
      <g transform="translate(270,52)">
        <path d="M0 -13 a13 13 0 1 0 0 26 a9.5 9.5 0 1 1 0 -26 z" fill="rgba(255,255,255,0.85)" />
      </g>
    </svg>
  );
}
