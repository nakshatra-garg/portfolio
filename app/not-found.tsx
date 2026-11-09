import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-3xl content-center gap-6 px-5 sm:px-8">
      <span className="eyebrow">Error 404</span>
      <h1 className="display text-[clamp(3rem,12vw,7rem)] uppercase">Call <span className="grad-text">dropped.</span></h1>
      <p className="max-w-md text-lg text-muted">This page doesn&apos;t exist. Even the smart router couldn&apos;t find a backend for it.</p>
      <Link href="/" className="inline-flex min-h-12 w-max items-center rounded-full bg-accent px-6 font-medium text-on-accent">Back to the homepage →</Link>
    </div>
  );
}
