import type { CSSProperties } from "react";
import { CipherText } from "./CipherText";
import cipherStyles from "./CipherText.module.css";
import type { ExampleRecord, NotebookSpread } from "@/lib/gameTypes";
import styles from "./Notebook.module.css";

type NotebookProps = {
  isOpen: boolean;
  spread: NotebookSpread;
  page: number;
  pageCount: number;
  newAnimationHalfCycleMs: number;
  showNew: boolean;
};

function NotebookPage({
  examples,
  side,
}: {
  examples: ExampleRecord[];
  side: "left" | "right";
}) {
  return (
    <section
      className={`${styles.page} ${side === "left" ? styles.leftPage : styles.rightPage}`}
      aria-label={side === "left" ? "左ページ" : "右ページ"}
    >
      {examples.map((example) => (
        <article key={example.id} className={styles.exampleItem}>
          <p className={styles.cipher}>
            男「
            <span className={cipherStyles.cipherSentence} dir="ltr">
              {example.tokens.map((token, index) => (
                <CipherText
                  key={token.id}
                  ariaLabel={`暗号単語${index + 1}`}
                >
                  {token.glyphText}
                </CipherText>
              ))}
            </span>
            」
          </p>
          <p className={styles.translation}>男「{example.translation}」</p>
        </article>
      ))}
    </section>
  );
}

export function Notebook({
  isOpen,
  spread,
  page,
  pageCount,
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

  const visibleExamples = [...spread.left, ...spread.right];
  const isCompact =
    visibleExamples.length >= 5 ||
    visibleExamples.some((example) => example.tokens.length >= 5);

  return (
    <section
      className={styles.overlay}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={`${styles.notebook} ${isCompact ? styles.compact : ""}`}
      >
        <h2 className={styles.title}>手帳</h2>

        {visibleExamples.length > 0 ? (
          <div className={styles.spread}>
            <NotebookPage examples={spread.left} side="left" />
            <NotebookPage examples={spread.right} side="right" />
          </div>
        ) : (
          <p className={styles.empty}>まだ例文がありません</p>
        )}

        <p className={styles.pageInfo}>
          見開き {page + 1} / {pageCount}
        </p>
        <p className={styles.hint}>
          Spaceで閉じる
          {pageCount > 1 ? " / A・Dで見開き移動" : ""}
        </p>
      </div>
    </section>
  );
}
