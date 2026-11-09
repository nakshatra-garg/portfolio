"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { asset, RESUME } from "@/lib/site";
import { publishedPosts } from "@/lib/posts";
import { useModKey } from "@/lib/useMediaQuery";

const sections = [
  { id: "work", label: "Work" },
  { id: "approach", label: "Approach" },
  { id: "experience", label: "Experience" },
  ...(publishedPosts.length ? [{ id: "writing", label: "Writing" }] : []),
];

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === "";
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const mod = useModKey();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome, pathname]);

  const current = onHome ? active : pathname.startsWith("/writing") ? "writing" : null;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(12px,env(safe-area-inset-top))]">
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-bg via-bg/80 to-transparent transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`} />
      <nav
        aria-label="Main"
        className={`pointer-events-auto flex w-full max-w-5xl items-center gap-1 rounded-2xl border px-2 py-1.5 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? "border-line bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent"
        }`}
      >
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 font-semibold" aria-label="Nakshatra Garg, home">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-tint text-[12px] font-bold tracking-tight text-white">NG</span>
          <span className="hidden text-sm sm:inline">Nakshatra Garg</span>
        </Link>
        <div className="ml-auto flex min-w-0 items-center overflow-x-auto [scrollbar-width:none]">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              aria-current={current === s.id ? "location" : undefined}
              className={`flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm transition-colors ${
                current === s.id ? "font-semibold text-accent" : "text-muted hover:text-ink"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-palette"))}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl px-2.5 text-muted transition-colors hover:bg-fill hover:text-ink"
          aria-label={`Search and jump (${mod}+K)`}
        >
          <Icon name="search" className="size-[18px]" />
          <kbd className="hidden rounded-md border border-line bg-fill px-1.5 font-mono text-xs lg:inline">{mod} K</kbd>
        </button>
        <a
          href={asset(RESUME)}
          download="Nakshatra_Garg_Resume.pdf"
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-bg transition-transform active:scale-[0.97] sm:flex"
        >
          <Icon name="download" className="size-4" />
          Résumé
        </a>
      </nav>
    </header>
  );
}
