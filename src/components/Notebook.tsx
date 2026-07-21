import Image from "next/image";
import { CipherText } from "./CipherText";
import cipherStyles from "./CipherText.module.css";
import { assetPath } from "@/lib/assetPath";
import { GAME_CONFIG } from "@/lib/gameConfig";
import type { ExampleRecord, NotebookSpread } from "@/lib/gameTypes";
import styles from "./Notebook.module.css";

type NotebookProps = {
  isOpen: boolean;
  spread: NotebookSpread;
  page: number;
  pageCount: number;
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
          </p>
          <p className={styles.translation}>{example.translation}</p>
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
}: NotebookProps) {
  if (!isOpen) return null;

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
        <Image
          className={styles.notebookImage}
          src={assetPath(GAME_CONFIG.sceneAssets.notebookOpenSpread)}
          alt=""
          width={1376}
          height={768}
          loading="eager"
          draggable={false}
        />

        {visibleExamples.length > 0 ? (
          <div className={styles.spread}>
            <NotebookPage examples={spread.left} side="left" />
            <NotebookPage examples={spread.right} side="right" />
          </div>
        ) : (
          <p className={styles.empty}>まだ例文がありません</p>
        )}
      </div>
      <p className={styles.pageInfo}>
        {page + 1}/{pageCount}
      </p>
      <p className={styles.hint} aria-label="手帳の操作">
        <span className={styles.hintItem}>
          <kbd>Space</kbd>
          <span>で閉じる</span>
        </span>
        <span className={styles.hintItem}>
          <kbd>A / D</kbd>
          <span>でページを移動</span>
        </span>
      </p>
    </section>
  );
}
