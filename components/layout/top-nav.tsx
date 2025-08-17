import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  Bell,
  HardDrive,
  UserRoundPlus,
  Puzzle,
  Settings,
  Search,
  CircleHelp,
  Grip,
  Gem,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function TopNav() {
  // Active is the icon *component type* (not JSX element)
  const [active, setActive] = useState<LucideIcon>(Bell);

  // Small helper to apply your clsx style
  const itemCx = (isActive: boolean) =>
    clsx(
      "group flex items-center gap-3 rounded-md px-3 py-2 mx-2 my-1",
      "transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer",
      isActive
        ? "bg-black/10 dark:bg-white/10 font-medium"
        : "text-gray-700 dark:text-gray-200"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[var(--primary-selected-color)]">
      <div className="flex h-14 w-full items-center justify-between px-7">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt="Iknasoft"
              width={25}
              height={25}
              priority
              className="rounded"
            />
            <span className="text-lg tracking-tight">
              <span className="font-bold tracking-[0.03em]">monday</span>{" "}
              <span className="font-extralight    tracking-[0.03em]">CRM</span>
            </span>
          </Link>
          <Button
            variant="outline"
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] transition
             border-[var(--primary-hover-color)] text-[var(--primary-hover-color)] bg-transparent
             hover:bg-[var(--primary-hover-color)] hover:text-white
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-hover-color)]
             active:scale-[.99]"
          >
            <Gem className="h-[14px] w-[14px]" />
            See plans
          </Button>
        </div>

        {/* Right Side Icons (same UI, just with clsx + active) */}
        <div className="flex items-center gap-0 text-gray-600 dark:text-gray-300">
          {/* Bell with badge */}
          <div
            className={itemCx(active === Bell)}
            onClick={() => setActive(Bell)}
            role="button"
            aria-label="Notifications"
          >
            <div className="relative">
              <Bell size={17} />
              <Badge
                variant="destructive"
                size="number"
                className="absolute -top-3 -right-3"
              >
                6
              </Badge>
            </div>
          </div>

          {/* HardDrive with badge */}
          <div
            className={itemCx(active === HardDrive)}
            onClick={() => setActive(HardDrive)}
            role="button"
            aria-label="Storage"
          >
            <div className="relative">
              <HardDrive size={17} />
              <Badge
                variant="secondary"
                size="number"
                className="absolute -top-3 -right-3"
              >
                3
              </Badge>
            </div>
          </div>

          {/* UserRoundPlus */}
          <div
            className={itemCx(active === UserRoundPlus)}
            onClick={() => setActive(UserRoundPlus)}
            role="button"
            aria-label="Add User"
          >
            <UserRoundPlus size={17} />
          </div>

          {/* Puzzle */}
          <div
            className={itemCx(active === Puzzle)}
            onClick={() => setActive(Puzzle)}
            role="button"
            aria-label="Apps"
          >
            <Puzzle size={17} />
          </div>

          {/* Settings */}
          <div
            className={itemCx(active === Settings)}
            onClick={() => setActive(Settings)}
            role="button"
            aria-label="Settings"
          >
            <Settings size={20} />
          </div>

          {/* Search */}
          <div
            className={itemCx(active === Search)}
            onClick={() => setActive(Search)}
            role="button"
            aria-label="Search"
          >
            <Search size={17} />
          </div>

          {/* Help with dot */}
          <div
            className={itemCx(active === CircleHelp)}
            onClick={() => setActive(CircleHelp)}
            role="button"
            aria-label="Help"
          >
            <div className="relative">
              <CircleHelp size={17} />
              <Badge
                variant="destructive"
                size="dot"
                className="absolute -top-3 -right-3"
              />
            </div>
          </div>

          {/* Divider before grip */}
          <div className="h-4 w-px bg-gray-400/50" />

          {/* Grip */}
          <div
            className={itemCx(active === Grip)}
            onClick={() => setActive(Grip)}
            role="button"
            aria-label="Menu"
          >
            <Grip size={25} />
          </div>

          {/* Avatar (unchanged) */}
          <div
            className="group flex items-center gap-1 rounded-l-sm rounded-r-xl bg-white pl-1 p-0 shadow-sm
             transition-colors hover:bg-[var(--primary-selected-hover-color)] dark:hover:bg-black/50"
          >
            {/* Left side icon container */}
            <div
              className="flex h-5 w-8 items-center justify-center rounded-sm
               bg-[var(--primary-surface-color)] transition-colors
               group-hover:bg-[var(--primary-surface-hover-color)]"
            >
              <Image
                src="/brand/icon.png"
                alt="Brand Icon"
                width={20}
                height={15}
                className="object-contain"
              />
            </div>

            {/* Right side avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src="/users/ajmal.jpg" alt="@ajmal" />
              <AvatarFallback className="bg-purple-500 text-white font-bold">
                SP
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
