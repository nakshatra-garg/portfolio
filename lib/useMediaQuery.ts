"use client";
import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query. Returns `fallback` during server rendering. */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

const noop = () => () => {};
/** "⌘" on Apple devices, "Ctrl" elsewhere (and on the server). */
export function useModKey() {
  return useSyncExternalStore(noop, () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl"), () => "Ctrl");
}
