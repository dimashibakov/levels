import { STRINGS } from "./strings";
import { isSafetyItem } from "./steps";

type QuestionStepProps = {
  code: string;
  phq: Record<string, number>;
  safety: Record<string, 0 | 1>;
  onPhq: (code: string, value: number) => void;
  onSafety: (code: string, value: 0 | 1) => void;
};

export function QuestionStep({ code, phq, safety, onPhq, onSafety }: QuestionStepProps) {
  const text = STRINGS.items[code as keyof typeof STRINGS.items];

  if (isSafetyItem(code)) {
    const selected = safety[code];
    return (
      <div>
        <p className="text-[18px] font-semibold leading-snug">{text}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {([
            [STRINGS.no, 0],
            [STRINGS.yes, 1],
          ] as const).map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => onSafety(code, value)}
              className={`rounded-xl border p-4 text-left text-[14px] ${
                selected === value
                  ? "border-edge bg-edgesoft font-semibold"
                  : "border-line bg-card text-ink2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selected = phq[code];
  return (
    <div>
      <p className="text-[18px] font-semibold leading-snug">{text}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {STRINGS.scale.map((label, value) => (
          <button
            key={label}
            type="button"
            onClick={() => onPhq(code, value)}
            className={`rounded-xl border p-4 text-left text-[14px] ${
              selected === value
                ? "border-brand bg-brandsoft font-semibold"
                : "border-line bg-card text-ink2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
