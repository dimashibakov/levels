import { TIER_META, type Tier } from "@/lib/scoring";

const TICKS = [18, 32, 50, 68, 82];

/** The signature: a spirit level whose bubble position + color encode the tier. */
export function LevelVial({ tier }: { tier: Tier }) {
  const { color, pos } = TIER_META[tier];
  return (
    <div
      className="relative h-[70px] overflow-hidden rounded-[20px] border border-[#E4E7EE]"
      style={{
        background: "linear-gradient(180deg,#F7F9FC,#EEF1F6)",
        boxShadow: "inset 0 3px 8px rgba(30,40,80,.08)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${color}22, ${color}33)` }}
      />

      {/* tick marks */}
      {TICKS.map((left) => (
        <div
          key={left}
          className="absolute top-[18px] bottom-[18px] w-px bg-[rgba(30,40,80,.12)]"
          style={{ left: `${left}%` }}
        />
      ))}

      {/* center reference line */}
      <div className="absolute bottom-2 top-2 left-1/2 -ml-px w-0.5 bg-[rgba(30,40,80,.22)]" />

      {/* bubble */}
      <div
        className="level-bubble absolute top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: pos,
          background: `radial-gradient(circle at 36% 32%, #fff 0%, ${color} 58%, ${color} 100%)`,
          boxShadow: `0 2px 6px rgba(0,0,0,.2), inset 0 0 8px rgba(255,255,255,.35), 0 0 0 1px ${color}44`,
        }}
      >
        <div
          className="pointer-events-none absolute left-[22%] top-[18%] h-[38%] w-[42%] rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      </div>
    </div>
  );
}
