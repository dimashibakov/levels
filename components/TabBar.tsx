"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, ClockIcon, GridIcon } from "@/components/icons/LineIcons";

const tabs = [
  { href: "/today", label: "Today", Icon: ClockIcon },
  { href: "/patterns", label: "Patterns", Icon: GridIcon },
  { href: "/playbook", label: "Playbook", Icon: BookIcon },
] as const;

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-4 mx-auto flex max-w-[390px] gap-1 rounded-[26px] border border-white/60 bg-white/85 p-2 shadow-lg backdrop-blur">
      {tabs.map(({ href, label, Icon }) => {
        const on = path?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? "text-brand" : "text-mute"}`}
          >
            <Icon className="h-5 w-5" strokeWidth={on ? 2 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
