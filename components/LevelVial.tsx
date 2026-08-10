import { TIER_META, type Tier } from "@/lib/scoring";

/** The signature: a spirit level whose bubble position + color encode the tier. */
export function LevelVial({ tier }: { tier: Tier }) {
  const { color, pos } = TIER_META[tier];
  return (
    <div
      className="relative h-[70px] rounded-[20px] border border-[#E4E7EE] overflow-hidden"
      style={{ background: "linear-gradient(180deg,#F7F9FC,#EEF1F6)", boxShadow: "inset 0 3px 8px rgba(30,40,80,.08)" }}
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${color}22, ${color}33)` }} />
      <div className="absolute top-2 bottom-2 left-1/2 -ml-px w-0.5 bg-[rgba(30,40,80,.16)]" />
      <div
        className="absolute top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-700"
        style={{
          left: pos,
          background: `radial-gradient(circle at 36% 32%, #fff 0%, ${color} 58%, ${color} 100%)`,
          boxShadow: "0 2px 6px rgba(0,0,0,.2), inset 0 0 8px rgba(255,255,255,.35)",
        }}
      />
    </div>
  );
}
