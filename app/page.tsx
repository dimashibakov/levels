"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// type: "quote" = a stigma line men are told (black-on-white pill, as in the campaign);
// "line"/"small" = fact or affirmation (white-on-black); "talk" = final beat.
const SEQ: { t: "quote" | "line" | "small" | "talk"; d: number; text: string }[] = [
  { t: "quote", d: 3600, text: "\u201CYou\u2019re not a real man if you cry\u201D" },
  { t: "quote", d: 3600, text: "\u201CMan up, don\u2019t be depressed and just provide\u201D" },
  { t: "quote", d: 3400, text: "\u201CLife is so easy for men\u201D" },
  { t: "quote", d: 3400, text: "\u201CBut you\u2019re always smiling\u201D" },
  { t: "line", d: 3900, text: "40% of men struggle with their mental health." },
  { t: "line", d: 3900, text: "75% of all suicides are committed by men." },
  { t: "line", d: 4200, text: "Every single minute, we lose a man to suicide." },
  { t: "small", d: 4000, text: "Most men never say a word \u2014 because of the stigma." },
  { t: "line", d: 3600, text: "It\u2019s okay to not be okay." },
  { t: "line", d: 4200, text: "But remember \u2014 your life matters." },
  { t: "talk", d: 3600, text: "Talk." },
];

const serif = 'Georgia, "Times New Roman", serif';
const sans = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';

export default function Intro() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const done = i >= SEQ.length;

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setI((n) => n + 1), SEQ[i].d);
    return () => clearTimeout(id);
  }, [i, done]);

  const enter = () => router.push("/today");

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      onClick={() => !done && setI((n) => n + 1)}
      style={{ fontFamily: serif }}
    >
      <style>{`
        @keyframes levelsFill { from { width: 0 } to { width: 100% } }
        @media (prefers-reduced-motion: reduce) {
          .levels-fill { animation: none !important; width: 100% !important }
          .levels-slide { transition: none !important }
        }
      `}</style>

      {/* progress ticks */}
      <div className="absolute inset-x-0 top-0 z-10 flex gap-1 px-4 pt-3.5">
        {SEQ.map((s, n) => (
          <i key={n} className="h-[2.5px] flex-1 overflow-hidden rounded-sm" style={{ background: "rgba(255,255,255,.18)" }}>
            <b
              className="levels-fill block h-full"
              style={{
                background: "rgba(255,255,255,.85)",
                width: n < i ? "100%" : "0%",
                animation: n === i && !done ? `levelsFill ${s.d}ms linear forwards` : "none",
              }}
            />
          </i>
        ))}
      </div>

      {/* skip → straight into the app */}
      {!done && (
        <button
          onClick={(e) => { e.stopPropagation(); enter(); }}
          className="absolute right-[22px] top-5 z-10 p-1.5 text-[13px] font-semibold"
          style={{ fontFamily: sans, color: "#7a7a7a", background: "none", border: "none" }}
        >
          Skip
        </button>
      )}

      {/* slides (stacked, crossfade by opacity) */}
      {SEQ.map((s, n) => (
        <div
          key={n}
          className="levels-slide absolute inset-0 flex items-center justify-center px-[34px] text-center"
          style={{ opacity: n === i ? 1 : 0, transition: "opacity .9s ease" }}
        >
          {s.t === "quote" ? (
            <div
              style={{
                background: "#f4f4f4", color: "#0a0a0a", padding: "14px 20px", borderRadius: 6,
                fontSize: "clamp(24px,5.8vw,32px)", lineHeight: 1.24, maxWidth: "22ch",
              }}
            >
              {s.text}
            </div>
          ) : s.t === "talk" ? (
            <div style={{ color: "#fff", fontSize: "clamp(64px,17vw,108px)", letterSpacing: ".01em" }}>{s.text}</div>
          ) : (
            <div
              style={{
                color: s.t === "small" ? "#cfcfcf" : "#f2f2f2",
                fontSize: s.t === "small" ? "clamp(22px,5.4vw,28px)" : "clamp(26px,6.4vw,34px)",
                lineHeight: 1.28,
              }}
            >
              {s.text}
            </div>
          )}
        </div>
      ))}

      {/* end CTA */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-[34px]"
        style={{ opacity: done ? 1 : 0, transition: "opacity .8s ease", pointerEvents: done ? "auto" : "none" }}
      >
        <div style={{ width: 150, height: 34, borderRadius: 18, background: "#0f0f0f", border: "1px solid #262626", position: "relative" }}>
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle at 38% 34%,#fff 0%,#7CB342 60%,#4d7a2b 100%)", boxShadow: "0 1px 4px rgba(0,0,0,.5)" }} />
        </div>
        <h1 style={{ fontFamily: sans, color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: ".14em" }}>LEVELS</h1>
        <p style={{ fontFamily: sans, color: "#8a8a8a", fontSize: 15, fontWeight: 500, maxWidth: "26ch", lineHeight: 1.5, textAlign: "center" }}>
          You made it here. That already counts. Let&rsquo;s see how you&rsquo;re holding.
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); enter(); }}
          style={{ fontFamily: sans, fontSize: 16, fontWeight: 700, color: "#fff", background: "#5B52D9", border: "none", borderRadius: 16, padding: "15px 40px", cursor: "pointer" }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
