/* Original line-art illustrations, drawn for this project — no stock imagery,
   nothing to license. They inherit the palette via CSS variables so a card
   can tint them on hover. Swap any of these for real photography later by
   replacing the <Art> element in the Equipment section. */

type ArtProps = { className?: string };

const shell = "h-full w-full";
const stroke = {
  fill: "none",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PowerRackArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={`${shell} ${className}`} aria-hidden="true">
      {/* uprights with actual width, plus feet — reads as a rack, not poles */}
      <rect x="34" y="16" width="12" height="106" rx="3" stroke="currentColor" {...stroke} />
      <rect x="154" y="16" width="12" height="106" rx="3" stroke="currentColor" {...stroke} />
      <path d="M26 122h28M146 122h28" stroke="currentColor" {...stroke} />
      {/* top crossmember ties the two sides together */}
      <path d="M40 16h120" stroke="currentColor" {...stroke} />
      {/* adjustment holes */}
      {[32, 44, 68, 80, 92, 104].map((y) => (
        <circle key={y} cx={40} cy={y} r={2} fill="currentColor" opacity={0.5} />
      ))}
      {[32, 44, 68, 80, 92, 104].map((y) => (
        <circle key={`r${y}`} cx={160} cy={y} r={2} fill="currentColor" opacity={0.5} />
      ))}
      {/* loaded bar sitting on the J-hooks */}
      <path d="M20 56h160" stroke="var(--art-accent)" {...stroke} />
      <rect x="54" y="40" width="10" height="32" rx="3" fill="var(--art-accent)" />
      <rect x="68" y="46" width="7" height="20" rx="3" fill="var(--art-accent)" opacity={0.6} />
      <rect x="136" y="40" width="10" height="32" rx="3" fill="var(--art-accent)" />
      <rect x="125" y="46" width="7" height="20" rx="3" fill="var(--art-accent)" opacity={0.6} />
    </svg>
  );
}

export function DumbbellArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={`${shell} ${className}`} aria-hidden="true">
      <path d="M62 70h76" stroke="currentColor" {...stroke} />
      <rect x="38" y="46" width="16" height="48" rx="5" fill="var(--art-accent)" />
      <rect x="22" y="56" width="12" height="28" rx="4" fill="currentColor" opacity={0.55} />
      <rect x="146" y="46" width="16" height="48" rx="5" fill="var(--art-accent)" />
      <rect x="166" y="56" width="12" height="28" rx="4" fill="currentColor" opacity={0.55} />
      {/* knurling */}
      {[74, 84, 94, 104, 114, 124].map((x) => (
        <path key={x} d={`M${x} 64v12`} stroke="currentColor" strokeWidth={2} opacity={0.4} strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function KettlebellArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={`${shell} ${className}`} aria-hidden="true">
      {/* handle: a squat arch, clearly narrower than the bell */}
      <path
        d="M84 52V44c0-9 7-16 16-16s16 7 16 16v8"
        stroke="currentColor"
        {...stroke}
      />
      {/* short neck into the bell */}
      <path d="M88 52h24" stroke="currentColor" {...stroke} />
      {/* the bell itself — a circle, which is what makes it read */}
      <circle cx="100" cy="88" r="30" stroke="var(--art-accent)" {...stroke} />
      {/* flat base so it sits on the floor */}
      <path d="M84 116h32" stroke="var(--art-accent)" {...stroke} />
      {/* weight stamp */}
      <path
        d="M92 84h16"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
}

export function TreadmillArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={`${shell} ${className}`} aria-hidden="true">
      {/* deck */}
      <path d="M34 108h116l14-26H48Z" stroke="var(--art-accent)" {...stroke} />
      {/* belt lines */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${62 + i * 26} 100l7-12`}
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.45}
          strokeLinecap="round"
        />
      ))}
      {/* upright + console */}
      <path d="M150 82V44M150 44h-34" stroke="currentColor" {...stroke} />
      <rect x="96" y="28" width="34" height="22" rx="5" stroke="currentColor" {...stroke} />
      <path d="M104 38h8M118 38h4" stroke="var(--art-accent)" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

export function RowerArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={`${shell} ${className}`} aria-hidden="true">
      {/* rail */}
      <path d="M46 96h124" stroke="currentColor" {...stroke} />
      <path d="M160 96l12 14M60 96l-12 14" stroke="currentColor" {...stroke} />
      {/* seat */}
      <rect x="96" y="82" width="26" height="10" rx="4" fill="var(--art-accent)" />
      {/* flywheel housing */}
      <circle cx="52" cy="62" r="24" stroke="var(--art-accent)" {...stroke} />
      <circle cx="52" cy="62" r="8" fill="currentColor" opacity={0.5} />
      {/* handle + chain */}
      <path d="M74 62h44" stroke="currentColor" {...stroke} />
      <path d="M118 54v16" stroke="var(--art-accent)" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

export function CableMachineArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={`${shell} ${className}`} aria-hidden="true">
      {/* frame */}
      <path d="M56 24v96M144 24v96M56 24h88" stroke="currentColor" {...stroke} />
      <path d="M48 120h16M136 120h16" stroke="currentColor" {...stroke} />
      {/* pulleys */}
      <circle cx="56" cy="40" r="6" stroke="var(--art-accent)" {...stroke} />
      <circle cx="144" cy="40" r="6" stroke="var(--art-accent)" {...stroke} />
      {/* weight stack */}
      {[64, 74, 84, 94].map((y, i) => (
        <rect
          key={y}
          x="86"
          y={y}
          width="28"
          height="7"
          rx="2"
          fill="var(--art-accent)"
          opacity={i === 0 ? 1 : 0.35}
        />
      ))}
      {/* cables */}
      <path d="M56 46v18M144 46v18" stroke="currentColor" strokeWidth={2} opacity={0.6} strokeLinecap="round" />
    </svg>
  );
}
