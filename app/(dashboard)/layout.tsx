"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/layout/top-nav";
import SideNav from "@/components/layout/side-nav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setIsDesktop(mq.matches);
      setCollapsed(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const isTextInput = (el: Element | null) =>
      !!el &&
      ((el as HTMLElement).isContentEditable ||
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        (el as HTMLInputElement).type === "search");
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (isTextInput(e.target as Element | null)) return;
      const periodPressed = e.key === "." || e.code === "Period";
      const mod = e.ctrlKey || e.metaKey;
      if (periodPressed && mod && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setCollapsed((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />

      {/* ⬇️ IMPORTANT: no page scroll here */}
      <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside
          aria-label="Primary"
          aria-expanded={!collapsed}
          className={clsx(
            "relative hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out bg-[var(--primary-surface-color)] lg:block",
            collapsed ? "w-16" : "w-64",
            "lg:ml-4 lg:rounded-tl-xl"
          )}
        >
          <SideNav collapsed={collapsed} />
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title="Toggle sidebar (Ctrl + .)"
            aria-keyshortcuts="Control+. Meta+."
            className={clsx(
              "absolute -right-3 top-5 z-50 flex h-7 w-7 items-center justify-center",
              "rounded-full border bg-[var(--primary-selected-color)] shadow hover:shadow-md",
              "outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Expand" : "Collapse"} sidebar
            </span>
          </button>
        </aside>

        {/* Mobile drawer (unchanged)… */}
        {!isDesktop && (
          <>
            {collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                aria-label="Open sidebar"
                className="fixed left-2 top-[76px] z-40 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-[var(--primary-selected-color)] shadow"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div
              className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 overflow-hidden bg-[var(--primary-surface-color)] shadow-xl transition-transform duration-300 ease-in-out",
                collapsed ? "-translate-x-full" : "translate-x-0"
              )}
              role="dialog"
              aria-modal="true"
            >
              <SideNav collapsed={false} />
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Close sidebar"
                className="absolute right-2 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-[var(--primary-selected-color)] shadow"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div
              className={clsx(
                "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
                collapsed ? "pointer-events-none opacity-0" : "opacity-100"
              )}
              onClick={() => setCollapsed(true)}
            />
          </>
        )}

        {/* ⬇️ Only this inner wrapper scrolls vertically */}
        <main
          className="flex-1 min-w-0 bg-[var(--primary-highlighted-color)]"
          style={{ height: "calc(100dvh - 56px)" }} // subtract TopNav height
        >
          <div className="w-full h-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-tl-xl p-[18px_30px_0_38px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
