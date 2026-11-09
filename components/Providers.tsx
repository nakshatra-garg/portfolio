"use client";
import { MotionConfig } from "motion/react";

/** Honour the visitor's Reduce Motion setting for every motion component. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
