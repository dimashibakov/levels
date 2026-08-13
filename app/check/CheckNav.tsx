import { STRINGS } from "./strings";

type CheckNavProps = {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBack?: boolean;
};

export function CheckNav({
  onBack,
  onNext,
  nextLabel = STRINGS.nav.next,
  nextDisabled = false,
  nextLoading = false,
  showBack = true,
}: CheckNavProps) {
  return (
    <div className="mt-8 flex gap-3">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-2xl border border-line bg-card py-4 text-center text-[15px] font-bold text-ink2"
        >
          {STRINGS.nav.back}
        </button>
      ) : (
        <div className="flex-1" />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        className="flex-1 rounded-2xl bg-brand py-4 text-center text-[15px] font-bold text-white disabled:opacity-45"
      >
        {nextLoading ? "…" : nextLabel}
      </button>
    </div>
  );
}
