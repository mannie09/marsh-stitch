"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Palette } from "@/lib/tokens";
import { IconBtn } from "./ui";

const EASE = [0.2, 0, 0, 1] as const;

/** An icon button with a small menu anchored to it. `side` is where the menu opens. */
export function Popover({
  p,
  icon,
  title,
  side = "down",
  size = 40,
  children,
}: {
  p: Palette;
  icon: string;
  title: string;
  side?: "down" | "right";
  size?: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const anchor: React.CSSProperties =
    side === "down"
      ? { top: size + 8, right: 0, transformOrigin: "top right" }
      : { left: size + 8, bottom: 0, transformOrigin: "bottom left" };
  const hidden = side === "down" ? { opacity: 0, y: -6, scale: 0.96 } : { opacity: 0, x: -6, scale: 0.96 };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconBtn icon={icon} p={p} on={open} onClick={() => setOpen((o) => !o)} title={title} size={size} />
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={hidden}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={hidden}
            transition={{ duration: 0.16, ease: EASE }}
            style={{
              position: "absolute",
              padding: 6,
              borderRadius: 18,
              background: p.surfaceContainerLow,
              boxShadow: "0 6px 20px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)",
              zIndex: 60,
              ...anchor,
            }}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
