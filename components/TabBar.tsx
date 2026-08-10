"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", label: "Today", icon: "◔" },
  { href: "/patterns", label: "Patterns", icon: "▦" },
  { href: "/playbook", label: "Playbook", icon: "📘" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-4 mx-auto flex max-w-[390px] gap-1 rounded-[26px] border border-white/60 bg-white/85 p-2 shadow-lg backdrop-blur">
      {tabs.map((t) => {
        const on = path?.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? "text-brand" : "text-mute"}`}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
