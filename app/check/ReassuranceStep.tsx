import { STRINGS } from "./strings";

export function ReassuranceStep() {
  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-sm">
      <p className="text-[17px] leading-relaxed text-ink2">{STRINGS.safetyReassurance}</p>
    </div>
  );
}
