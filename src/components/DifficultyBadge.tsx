import type { DifficultyBadgeProps } from "@/lib/gameTypes";
import styles from "./DifficultyBadge.module.css";

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <p className={styles.badge} aria-label={`難易度 ${difficulty.toUpperCase()}`}>
      {difficulty.toUpperCase()}
    </p>
  );
}
