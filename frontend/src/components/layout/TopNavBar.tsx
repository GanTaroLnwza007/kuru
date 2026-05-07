"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./TopNavBar.module.css";

type TopNavBarProps = {
  children: ReactNode;
};

export default function TopNavBar({ children }: TopNavBarProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const onScroll = () => header.classList.toggle(styles.scrolled, window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={ref} className={styles.header}>
      <div className={styles.content}>{children}</div>
    </header>
  );
}
