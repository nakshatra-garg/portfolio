import type { IconName } from "@/lib/content";

type Name = IconName | "mail" | "linkedin" | "github" | "download" | "search" | "chat" | "send" | "arrow" | "play" | "arrowDown";

const stroke: Partial<Record<Name, React.ReactNode>> = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.8 7 8.2 6 8.2-6" /></>,
  download: <path d="M12 3.5v11m0 0-4.5-4.5m4.5 4.5 4.5-4.5M4.5 19.5h15" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  chat: <><path d="M20 12a7.5 7.5 0 0 1-11.1 6.6L4 20l1.4-4.6A7.5 7.5 0 1 1 20 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></>,
  send: <path d="M5 12h13M13 6l6 6-6 6" />,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  arrowDown: <path d="M12 5v14m0 0-6-6m6 6 6-6" />,
  server: <><rect x="3.5" y="4" width="17" height="6.5" rx="1.8" /><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.8" /><path d="M7.5 7.25h.01M7.5 16.75h.01M11 7.25h6M11 16.75h6" /></>,
  language: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.3-3.6-8.5s1.2-6 3.6-8.5z" /></>,
  shield: <><path d="M12 3.2 19 6v5.6c0 4.2-2.9 7.9-7 9.2-4.1-1.3-7-5-7-9.2V6z" /><path d="m9 12 2.1 2.1L15.2 10" /></>,
  rag: <><path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h4.5M13.5 3.5l5 5V11" /><path d="M8.5 9h4M8.5 12.5h2.5" /><circle cx="16.2" cy="16.2" r="3" /><path d="m18.4 18.4 2.4 2.4" /></>,
  tune: <><path d="M4 7h9.5M18 7h2M4 17h4.5M13 17h7" /><circle cx="15.75" cy="7" r="2.25" /><circle cx="10.75" cy="17" r="2.25" /></>,
  mic: <><rect x="9" y="3" width="6" height="11.5" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></>,
  cache: <><ellipse cx="12" cy="6" rx="7" ry="2.6" /><path d="M5 6v12c0 1.45 3.13 2.6 7 2.6s7-1.15 7-2.6V6M5 12c0 1.45 3.13 2.6 7 2.6s7-1.15 7-2.6" /></>,
  idcard: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.6-1.3 1.7-2 3-2s2.4.7 3 2M14.5 10h4M14.5 13h3" /></>,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13" />,
  chart: <path d="M5 19.5V11M10 19.5V5.5M15 19.5V13M20 19.5V8.5M3 20.5h18" />,
};

const fill: Partial<Record<Name, React.ReactNode>> = {
  linkedin: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.55 4.77 5.86V21h-4v-5.2c0-1.24-.03-2.84-1.8-2.84-1.8 0-2.08 1.35-2.08 2.75V21h-4z" />,
  github: <path d="M12 .8C5.8.8.8 5.8.8 12a11.2 11.2 0 0 0 7.66 10.63c.56.1.77-.24.77-.54v-1.9c-3.12.68-3.78-1.33-3.78-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.94.1-.73.39-1.22.71-1.5-2.49-.28-5.11-1.25-5.11-5.54 0-1.22.44-2.22 1.15-3.01-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.62 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.79 1.15 1.79 1.15 3.01 0 4.3-2.62 5.25-5.12 5.53.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 23.2 12C23.2 5.8 18.2.8 12 .8z" />,
  play: <path d="M7 4.5v15l12-7.5z" />,
};

export function Icon({ name, className = "size-5" }: { name: Name; className?: string }) {
  const isFill = name in fill;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...(isFill
        ? { fill: "currentColor" }
        : { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const })}
    >
      {isFill ? fill[name] : stroke[name]}
    </svg>
  );
}
