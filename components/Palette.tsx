"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { projects } from "@/lib/content";
import { publishedPosts } from "@/lib/posts";
import { asset, GITHUB, LINKEDIN, MAILTO, RESUME } from "@/lib/site";

type Item = { group: string; label: string; hint?: string; run: () => void };

/** Subsequence match; whole-substring matches rank first. */
function score(q: string, text: string) {
  if (!q) return 1;
  const t = text.toLowerCase();
  const at = t.indexOf(q);
  if (at >= 0) return 100 + (at === 0 || /[\s:·(/-]/.test(t[at - 1]) ? 50 : 0) - at * 0.1;
  let ti = 0, s = 0, run = 0;
  for (const ch of q) {
    const i = t.indexOf(ch, ti); if (i < 0) return 0;
    run = i === ti ? run + 1 : 0;
    s += 1 + run * 2 + (i === 0 || /[\s:·(-]/.test(t[i - 1]) ? 3 : 0);
    ti = i + 1;
  }
  return s / (t.length * 0.05 + 1);
}

export function Palette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<Element | null>(null);

  const goSection = useCallback((id: string) => {
    if (pathname !== "/") { router.push(`/#${id}`); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pathname, router]);

  const goProject = useCallback((slug: string, i: number) => {
    if (pathname !== "/") { router.push(`/#project-${slug}`); return; }
    const el = document.getElementById(`project-${slug}`);
    const rail = el?.closest("section");
    if (!el || !rail) return;
    const travel = rail.offsetHeight - window.innerHeight;
    if (rail.style.height && travel > 0) {
      // Pinned horizontal rail: scroll to the vertical position that slides this card into view.
      const top = rail.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (i / (projects.length - 1)) * travel, behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [pathname, router]);

  const items = useMemo<Item[]>(() => [
    { group: "Sections", label: "Case study: self-hosted LLM", hint: "−40% cost", run: () => goSection("work") },
    { group: "Sections", label: "Selected work", hint: `${projects.length} projects`, run: () => goProject(projects[0].slug, 0) },
    { group: "Sections", label: "How I work", hint: "the self-hosting story", run: () => goSection("approach") },
    { group: "Sections", label: "Experience", hint: "Rezo.ai and earlier", run: () => goSection("experience") },
    { group: "Sections", label: "Skills & education", run: () => goSection("skills") },
    ...projects.map((p, i) => ({ group: "Projects", label: p.title, hint: p.metric, run: () => goProject(p.slug, i) })),
    ...publishedPosts.map((p) => ({ group: "Writing", label: p.title, hint: p.readingTime, run: () => router.push(`/writing/${p.slug}/`) })),
    { group: "Actions", label: "Try the latency demo", hint: "TTFT vs TTFS", run: () => { goSection("work"); window.dispatchEvent(new Event("open-demo")); } },
    { group: "Actions", label: "Ask my résumé (AI chat)", hint: "questions about my work", run: () => window.dispatchEvent(new CustomEvent("open-chat", { detail: "" })) },
    { group: "Actions", label: "Download résumé", hint: "PDF", run: () => { const a = document.createElement("a"); a.href = asset(RESUME); a.download = "Nakshatra_Garg_Resume.pdf"; a.click(); } },
    { group: "Actions", label: "Email me", hint: "opens your mail app", run: () => { window.location.href = MAILTO; } },
    { group: "Actions", label: "Open LinkedIn", hint: "linkedin.com/in/nakshatra-garg", run: () => window.open(LINKEDIN, "_blank", "noopener") },
    { group: "Actions", label: "Open GitHub", hint: "github.com/nakshatra-garg", run: () => window.open(GITHUB, "_blank", "noopener") },
  ], [goProject, goSection, router]);

  const query = q.trim().toLowerCase();
  const shown = useMemo(
    () => items.map((it) => ({ it, s: Math.max(score(query, it.label), score(query, `${it.label} ${it.hint ?? ""}`) * 0.6) }))
      .filter((r) => r.s > 0).sort((a, b) => (query ? b.s - a.s : 0)).map((r) => r.it),
    [items, query],
  );

  const show = useCallback(() => { lastFocus.current = document.activeElement; setQ(""); setActive(0); setOpen(true); }, []);
  const hide = useCallback(() => { setOpen(false); (lastFocus.current as HTMLElement | null)?.focus?.(); }, []);
  const run = (i: number) => { const it = shown[i]; if (!it) return; hide(); setTimeout(it.run, 20); };

  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (/INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (open) hide(); else show(); }
      else if (e.key === "/" && !typing && !open) { e.preventDefault(); show(); }
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-palette", onOpen); };
  }, [open, show, hide]);

  const heads = useMemo(() => shown.map((it, i) => (!query && (i === 0 || shown[i - 1].group !== it.group) ? it.group : null)), [shown, query]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] grid items-start justify-items-center px-4 pt-[max(12vh,24px)]">
      <div className="absolute inset-0 bg-black/30" onClick={hide} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Search and jump" className="relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-line bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-[0_30px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="flex min-h-14 items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="size-[18px] shrink-0 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % Math.max(1, shown.length)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + shown.length) % Math.max(1, shown.length)); }
              else if (e.key === "Enter") { e.preventDefault(); run(active); }
              else if (e.key === "Escape") { e.preventDefault(); hide(); }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={shown.length ? `pal-${active}` : undefined}
            placeholder="Jump to a section, project or action…"
            className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-line bg-fill px-1.5 font-mono text-xs text-muted">Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
          {!shown.length && <li className="px-3 py-4 text-sm text-muted">No matches. Try &quot;rag&quot;, &quot;voice&quot; or &quot;résumé&quot;.</li>}
          {shown.map((it, i) => {
            const head = heads[i];
            return (
              <li key={`${it.group}-${it.label}`} role="presentation">
                {head && <div className="px-3 pb-1 pt-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">{head}</div>}
                <div
                  id={`pal-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={() => run(i)}
                  className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-[15px] ${i === active ? "bg-accent-soft text-accent" : ""}`}
                >
                  <span className="truncate">{it.label}</span>
                  {it.hint && <small className="shrink-0 truncate text-[13px] text-muted">{it.hint}</small>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
