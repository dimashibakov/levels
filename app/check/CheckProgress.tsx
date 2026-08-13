type CheckProgressProps = {
  segments: [number, number, number];
};

export function CheckProgress({ segments }: CheckProgressProps) {
  return (
    <div className="mb-6 flex gap-2">
      {segments.map((fill, i) => (
        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, fill * 100))}%` }}
          />
        </div>
      ))}
    </div>
  );
}
