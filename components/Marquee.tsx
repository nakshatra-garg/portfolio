import { ticker } from "@/lib/content";

export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ticker.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          <span className="display-md text-[clamp(1.25rem,2.4vw,1.9rem)] uppercase text-muted">{t}</span>
          <span className="mx-6 size-2 rounded-full bg-gradient-to-br from-accent to-tint" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee mt-20 overflow-hidden border-y border-line py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-label="Tools I work with">
      <div className="marquee-track flex w-max">{row(false)}{row(true)}</div>
    </div>
  );
}
