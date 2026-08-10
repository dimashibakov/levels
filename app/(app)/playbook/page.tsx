export default function Playbook() {
  return (
    <div>
      <h1 className="mb-3 mt-1 text-2xl font-extrabold">Playbook</h1>

      <div className="mb-4 rounded-card p-5 text-white" style={{ background: "linear-gradient(160deg,#5B52D9,#7A4FD0)" }}>
        <div className="text-[11px] uppercase tracking-widest opacity-80">Keep this</div>
        <h3 className="mb-3 mt-0.5 text-xl font-extrabold">Your plan</h3>
        {[
          ["When it's tilting", "No sleep · short fuse · reaching for a drink"],
          ["What takes the edge off", "Step outside · walk · cold water"],
          ["Who to text, in order", "1. brother · 2. Sam · 3. 988"],
          ["One number that always answers", "988"],
        ].map(([k, v]) => (
          <div key={k} className="border-t border-white/20 py-2.5">
            <div className="text-[11px] uppercase tracking-wide opacity-75">{k}</div>
            <div className="text-[14px] font-medium">{v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-line bg-card p-4">
        <div className="text-3xl font-extrabold text-brand">988</div>
        <p className="mt-1.5 text-[13px] leading-snug text-ink2">
          Suicide &amp; Crisis Lifeline. Call or text, 24/7. A trained counselor —
          not the police. Reach out before the peak, not only in a crisis.
        </p>
      </div>
    </div>
  );
}
