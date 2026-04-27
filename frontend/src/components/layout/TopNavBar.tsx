import type { ReactNode } from "react";
import styles from "./TopNavBar.module.css";

type TopNavBarProps = {
  children: ReactNode;
};

export default function TopNavBar({ children }: TopNavBarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>{children}</div>
    </header>
  );
}