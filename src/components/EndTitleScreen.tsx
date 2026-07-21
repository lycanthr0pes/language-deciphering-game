import type { AnimationEvent, CSSProperties } from "react";
import { useCallback, useEffect, useRef } from "react";
import { GAME_CONFIG } from "@/lib/gameConfig";
import type { ResultStatus } from "@/lib/gameTypes";
import { SceneCeilingLight } from "./SceneCeilingLight";
import styles from "./EndTitleScreen.module.css";

type EndTitleScreenProps = {
  status: ResultStatus;
  reducedMotion: boolean;
  onComplete: () => void;
};

export function EndTitleScreen({
  status,
  reducedMotion,
  onComplete,
}: EndTitleScreenProps) {
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const duration = reducedMotion
    ? GAME_CONFIG.reducedMotionEndTitleMs
    : status === "clear"
      ? GAME_CONFIG.gameClearTitleMs
      : GAME_CONFIG.gameOverTitleMs;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const completeOnce = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    const fallbackId = window.setTimeout(
      completeOnce,
      duration + GAME_CONFIG.animationFallbackBufferMs,
    );
    return () => window.clearTimeout(fallbackId);
  }, [completeOnce, duration]);

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.pseudoElement !== "") {
      return;
    }
    completeOnce();
  }

  const style = {
    "--end-title-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      className={styles.root}
      style={style}
      onAnimationEnd={handleAnimationEnd}
    >
      <SceneCeilingLight />
      <h1 className={status === "clear" ? styles.clearTitle : styles.gameOverTitle}>
        {status === "clear" ? "GAME CLEAR" : "GAME OVER"}
      </h1>
    </div>
  );
}
