"use client";
import { useEffect, useRef } from "react";
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (!media.matches || !ref.current) return;
      cancelAnimationFrame(frame);
      const { clientX: x, clientY: y } = event;
      frame = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transform = `translate3d(${x - 18}px,${y - 18}px,0)`;
          ref.current.style.opacity = "1";
        }
      });
    };
    const hide = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
    };
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
