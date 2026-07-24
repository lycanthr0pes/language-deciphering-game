"use client";

import Image from "next/image";
import { assetPath } from "@/lib/assetPath";
import type { MainMenuProps } from "@/lib/gameTypes";
import { playSound } from "@/lib/sound";
import styles from "./MainMenu.module.css";

const GUIDE_LINES = [
  "暗号の例文と日本語訳を見て、問題の暗号単語へ日本語を割り当てます。",
  "暗号単語を選び、日本語候補を選んでから「解答する」を押します。",
  "解答受付中は Space で手帳を開閉できます。",
  "手帳表示中は A / D でページを移動できます。",
  "EASY は制限時間なしで、1回まで誤答しても続けられます。",
  "HARD は1問90秒の制限があり、1回の誤答でゲームオーバーになります。",
] as const;

function playMenuButtonSound() {
  playSound("dialogueNext");
}

export function MainMenu({
  view,
  selectedDifficulty,
  onOpenGuide,
  onOpenDifficulty,
  onBack,
  onSelectDifficulty,
  onStart,
}: MainMenuProps) {
  const canStart = selectedDifficulty !== null;

  return (
    <div
      className={styles.root}
      onClick={(event) => event.stopPropagation()}
    >
      {view === "root" ? (
        <div className={styles.rootPanel}>
          <div className={styles.logoWrap}>
            <Image
              className={styles.logo}
              src={assetPath("/assets/images/title-logo-the-room.png")}
              alt="The Room"
              width={720}
              height={320}
              priority
              unoptimized
            />
          </div>
          <div className={styles.rootActions}>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                playMenuButtonSound();
                onOpenDifficulty();
              }}
            >
              PLAY
            </button>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                playMenuButtonSound();
                onOpenGuide();
              }}
            >
              GUIDE
            </button>
          </div>
        </div>
      ) : null}

      {view === "guide" ? (
        <section className={styles.modal} aria-label="プレイガイド">
          <button
            type="button"
            className={styles.closeButton}
            aria-label="戻る"
            onClick={() => {
              playMenuButtonSound();
              onBack();
            }}
          >
            ×
          </button>
          <h2 className={styles.modalTitle}>GUIDE</h2>
          <ul className={styles.guideList}>
            {GUIDE_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === "difficulty" ? (
        <section className={styles.modal} aria-label="難易度選択">
          <button
            type="button"
            className={styles.closeButton}
            aria-label="戻る"
            onClick={() => {
              playMenuButtonSound();
              onBack();
            }}
          >
            ×
          </button>
          <div className={styles.difficultyList}>
            <button
              type="button"
              className={
                selectedDifficulty === "easy"
                  ? styles.difficultyOptionActive
                  : styles.difficultyOption
              }
              aria-pressed={selectedDifficulty === "easy"}
              onClick={() => {
                playMenuButtonSound();
                onSelectDifficulty("easy");
              }}
            >
              <span className={styles.difficultyName}>EASY</span>
              <span className={styles.difficultyHint}>
                制限時間なし / 誤答1回まで継続可
              </span>
            </button>
            <button
              type="button"
              className={
                selectedDifficulty === "hard"
                  ? styles.difficultyOptionActive
                  : styles.difficultyOption
              }
              aria-pressed={selectedDifficulty === "hard"}
              onClick={() => {
                playMenuButtonSound();
                onSelectDifficulty("hard");
              }}
            >
              <span className={styles.difficultyName}>HARD</span>
              <span className={styles.difficultyHint}>
                1問90秒 / 誤答1回でゲームオーバー
              </span>
            </button>
          </div>
          <button
            type="button"
            className={canStart ? styles.startButton : styles.startButtonDisabled}
            disabled={!canStart}
            onClick={() => {
              if (!canStart) return;
              playMenuButtonSound();
              onStart();
            }}
          >
            START
          </button>
        </section>
      ) : null}
    </div>
  );
}
