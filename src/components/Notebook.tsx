import type { CSSProperties } from "react";
import type { ExampleRecord } from "@/lib/gameTypes";
import styles from "./Notebook.module.css";

type NotebookProps = {
  isOpen: boolean;
  examples: ExampleRecord[];
  page: number;
  pageCount: number;
  examplesPerPage: number;
  newAnimationHalfCycleMs: number;
  showNew: boolean;
};

export function Notebook({
  isOpen,
  examples,
  page,
  pageCount,
  examplesPerPage,
  newAnimationHalfCycleMs,
  showNew,
}: NotebookProps) {
  if (!isOpen) {
    if (!showNew) {
      return null;
    }

    const newBadgeStyle = {
      "--new-animation-half-cycle": `${newAnimationHalfCycleMs}ms`,
    } as CSSProperties;

    return (
      <div
        className={styles.newBadge}
        style={newBadgeStyle}
        aria-label="手帳に新しい例文があります"
      >
        <span>NEW</span>
        <span aria-hidden="true">↓</span>
      </div>
    );
  }

  const start = page * examplesPerPage;
  const visibleExamples = examples.slice(start, start + examplesPerPage);

  return (
    <section
      className={styles.overlay}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.notebook}>
        <h2 className={styles.title}>手帳</h2>

        {visibleExamples.length > 0 ? (
          visibleExamples.map((example) => (
            <article key={example.id} className={styles.exampleItem}>
              <p className={styles.cipher}>男「{example.cipherText}」</p>
              <p className={styles.translation}>男「{example.translation}」</p>
            </article>
          ))
        ) : (
          <p className={styles.empty}>まだ例文がありません</p>
        )}

        <p className={styles.pageInfo}>
          {page + 1} / {pageCount}
        </p>
        <p className={styles.hint}>
          Spaceで閉じる
          {pageCount > 1 ? " / A・Dでページ移動" : ""}
        </p>
      </div>
    </section>
  );
}
