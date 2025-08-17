"use client";

import Link from "next/link";
import type { Route } from "next"; // ⬅️ for typedRoutes
import { usePathname } from "next/navigation";
import { UserRound, BadgeCent, Users, BarChart2, Settings } from "lucide-react";
import clsx from "clsx";

type Item = { label: string; href: string; icon: React.ComponentType<any> };

const NAV_ITEMS: Item[] = [
  { label: "Profile", href: "/", icon: UserRound },
  { label: "Deals", href: "/deals", icon: BadgeCent },
  { label: "Contacts", href: "/leads", icon: Users },
  { label: "Reports", href: "/accounts", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function SideNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="h-full">
      <ul className="py-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href as Route}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-md px-3 py-2 mx-2 my-1",
                  "transition-colors hover:bg-black/5 dark:hover:bg-white/10",
                  active
                    ? "bg-black/10 dark:bg-white/10 font-medium"
                    : "text-gray-700 dark:text-gray-200"
                )}
              >
                {/* thin icon */}
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1} />
                {/* Hide labels when collapsed */}
                <span
                  className={clsx(
                    "truncate transition-opacity",
                    collapsed
                      ? "opacity-0 pointer-events-none w-0"
                      : "opacity-100"
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
