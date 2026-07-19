import type { CSSProperties } from "react";
import { GAME_CONFIG } from "@/lib/gameConfig";
import type { ResultStatus } from "@/lib/gameTypes";
import styles from "./CutsceneScreen.module.css";

type CutsceneScreenProps = {
  type: ResultStatus;
  step: number;
};

const SCENE_TEXT: Record<ResultStatus, readonly [string, string, string]> = {
  gameOver: ["男が銃を抜く", "男が銃をこちらに向ける", "撃たれて暗転"],
  clear: ["男が銃を抜く", "男が銃を自分に向ける", "撃って暗転"],
};

export function CutsceneScreen({ type, step }: CutsceneScreenProps) {
  const text = SCENE_TEXT[type][step] ?? "";
  const isDark = step >= 2;

  const style = {
    "--shot-flash-duration": `${GAME_CONFIG.shotFlashMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={`${styles.screen} ${isDark ? styles.dark : ""}`}
      style={style}
    >
      <p className={styles.text}>{text}</p>
      {step === 2 ? (
        <div className={styles.shotFlash} aria-hidden="true" />
      ) : null}
    </div>
  );
}
