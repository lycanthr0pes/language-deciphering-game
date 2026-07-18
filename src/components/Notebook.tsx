import type { ExampleRecord } from "@/lib/gameTypes";
import styles from "./Notebook.module.css";

type NotebookProps = {
  isOpen: boolean;
  examples: ExampleRecord[];
  page: number;
  pageCount: number;
  examplesPerPage: number;
  showNew: boolean;
};

export function Notebook({
  isOpen,
  examples,
  page,
  pageCount,
  examplesPerPage,
  showNew,
}: NotebookProps) {
  if (!isOpen) {
    return showNew ? (
      <div className={styles.newBadge} aria-label="手帳に新しい例文があります">
        <span>NEW</span>
        <span aria-hidden="true">↓</span>
      </div>
    ) : null;
  }

  const start = page * examplesPerPage;
  const visibleExamples = examples.slice(start, start + examplesPerPage);

  return (
    <section
      className={styles.overlay}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.notebook}>
        <h2>手帳</h2>

        {visibleExamples.length === 0 ? (
          <p className={styles.empty}>まだ例文はありません</p>
        ) : (
          visibleExamples.map((example, index) => (
            <article key={example.id} className={styles.example}>
              <p className={styles.cipherText}>
                {example.cipherText}
              </p>
              <p className={styles.translation}>{example.translation}</p>
              <p className={styles.exampleIndex}>
                例文 {start + index + 1}
              </p>
            </article>
          ))
        )}

        <p className={styles.pageNumber}>
          {page + 1} / {pageCount}
        </p>
      </div>
      <p className={styles.instruction}>Spaceで閉じる / A・Dでページ移動</p>
    </section>
  );
}
