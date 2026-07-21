import Image from "next/image";
import type { CSSProperties } from "react";
import { assetPath } from "@/lib/assetPath";
import { GAME_CONFIG } from "@/lib/gameConfig";
import type { ResultStatus } from "@/lib/gameTypes";
import { SceneCeilingLight } from "./SceneCeilingLight";
import styles from "./CutsceneScreen.module.css";

type CutsceneScreenProps = {
  type: ResultStatus;
  step: number;
};

const SCENE_LABEL: Record<ResultStatus, readonly [string, string, string]> = {
  gameOver: ["男が銃を抜く", "男が銃をこちらに向ける", "発砲して暗転"],
  clear: ["男が銃を抜く", "男が銃を自分に向ける", "発砲して暗転"],
};

export function CutsceneScreen({ type, step }: CutsceneScreenProps) {
  const isDark = step >= 2;
  const posePath =
    step === 0
      ? GAME_CONFIG.sceneAssets.maskedManDraw
      : type === "gameOver"
        ? GAME_CONFIG.sceneAssets.maskedManAimPlayer
        : GAME_CONFIG.sceneAssets.maskedManAimSelf;

  const style = {
    "--shot-flash-duration": `${GAME_CONFIG.shotFlashMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={`${styles.screen} ${isDark ? styles.dark : ""}`}
      style={style}
      role="img"
      aria-label={SCENE_LABEL[type][step] ?? "終了演出"}
    >
      <div className={styles.scene} aria-hidden="true">
        <SceneCeilingLight />
        <div className={styles.character}>
          <Image
            className={styles.sceneImage}
            src={assetPath(posePath)}
            alt=""
            width={1254}
            height={1254}
            loading="eager"
          />
        </div>
        <div className={styles.desk}>
          <Image
            className={styles.sceneImage}
            src={assetPath(GAME_CONFIG.sceneAssets.deskNotebookPen)}
            alt=""
            width={1291}
            height={617}
            loading="eager"
          />
        </div>
        <div className={styles.vignette} />
      </div>
      {step === 2 ? (
        <div className={styles.shotFlash} aria-hidden="true" />
      ) : null}
    </div>
  );
}
