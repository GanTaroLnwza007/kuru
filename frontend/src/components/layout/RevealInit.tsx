"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    let obs: IntersectionObserver | null = null;

    // Small delay so the new page's DOM is fully painted before we query
    const id = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
      if (!els.length) return;

      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              obs?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      els.forEach((el) => obs!.observe(el));
    }, 50);

    return () => {
      clearTimeout(id);
      obs?.disconnect();
    };
  }, [pathname]); // re-run on every client-side navigation

  return null;
}
