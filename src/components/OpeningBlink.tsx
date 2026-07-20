import type { AnimationEvent, CSSProperties } from "react";
import { useCallback, useEffect, useRef } from "react";
import { GAME_CONFIG } from "@/lib/gameConfig";
import styles from "./OpeningBlink.module.css";

type OpeningBlinkProps = {
  reducedMotion: boolean;
  onComplete: () => void;
};

export function OpeningBlink({ reducedMotion, onComplete }: OpeningBlinkProps) {
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const duration = reducedMotion
    ? GAME_CONFIG.reducedMotionOpeningMs
    : GAME_CONFIG.openingBlinkMs;

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
    "--opening-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      className={styles.root}
      style={style}
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    >
      <div className={styles.topLid} />
      <div className={styles.bottomLid} />
    </div>
  );
}
