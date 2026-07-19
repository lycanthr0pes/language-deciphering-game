import type { ReactNode } from "react";
import styles from "./CipherText.module.css";

type CipherTextProps = {
  children: ReactNode;
  ariaLabel: string;
};

export function CipherText({ children, ariaLabel }: CipherTextProps) {
  return (
    <span
      className={styles.cipherWord}
      lang="men-Mend"
      dir="rtl"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
