type IconProps = { className?: string; strokeWidth?: number };

const defaults = { className: "h-5 w-5", strokeWidth: 1.75 };

export function MoonIcon({ className = defaults.className, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z"
      />
    </svg>
  );
}

export function HeartPulseIcon({ className = defaults.className, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M12 20s-6.5-4.2-8.5-7.8C1.8 9.2 3.6 6 6.8 6c1.8 0 3.1.9 3.9 2 0.8-1.1 2.1-2 3.9-2 3.2 0 5 3.2 3.3 6.2C18.5 15.8 12 20 12 20Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 13h3l2-3 2 6 2-4h5" />
    </svg>
  );
}

export function FootprintsIcon({ className = defaults.className, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M8 18c-1.5 0-2.5-1.2-2-2.5.4-1.1 1.6-2 3-2.5M16 16c1.5 0 2.5-1.2 2-2.5-.4-1.1-1.6-2-3-2.5M10 10c0-1.2.8-2.2 2-2.5M14 8.5c0-1.2-.8-2.2-2-2.5M11 6.5a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6ZM13 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
      />
    </svg>
  );
}

export function ClockIcon({ className = defaults.className, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="8.5" strokeWidth={strokeWidth} />
      <path strokeLinecap="round" strokeWidth={strokeWidth} d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

export function GridIcon({ className = defaults.className, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="4" y="4" width="6" height="6" rx="1" strokeWidth={strokeWidth} />
      <rect x="14" y="4" width="6" height="6" rx="1" strokeWidth={strokeWidth} />
      <rect x="4" y="14" width="6" height="6" rx="1" strokeWidth={strokeWidth} />
      <rect x="14" y="14" width="6" height="6" rx="1" strokeWidth={strokeWidth} />
    </svg>
  );
}

export function BookIcon({ className = defaults.className, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18v16.5H7.5A2.5 2.5 0 0 0 5 22V5.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M7.5 3v16.5" />
    </svg>
  );
}
