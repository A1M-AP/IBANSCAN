"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Progressive enhancement for motion. Content is fully visible without JavaScript and with
 * reduced motion: the inline head script only adds `motion` to <html> when animation is welcome.
 * - [data-reveal] elements fade up once they enter the viewport (children stagger via --i).
 * - [data-count] numbers count up from zero when revealed.
 * - .spotlight cards get a soft light that follows the pointer.
 */
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    if (!motion.matches) {
      root.classList.remove("motion");
      return;
    }
    root.classList.add("motion");
    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target) || el.dataset.counted) return;
      el.dataset.counted = "1";
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / 1100, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("revealed");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]:not(.revealed)").forEach((el) => {
      Array.from(el.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
      observer.observe(el);
    });
    let frame = 0;
    const spot = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(".spotlight");
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - box.left}px`);
        card.style.setProperty("--my", `${event.clientY - box.top}px`);
      });
    };
    document.addEventListener("pointermove", spot, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", spot);
    };
  }, [pathname]);
  return null;
}
