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
  const rootRef = useRef<HTMLDivElement>(null);
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
    const root = rootRef.current;
    let totalMs = duration;
    if (root && !reducedMotion) {
      const readSpeed = (name: string) => {
        const raw = getComputedStyle(root).getPropertyValue(name).trim();
        const speed = Number.parseFloat(raw);
        return Number.isFinite(speed) && speed > 0 ? speed : 1;
      };
      const e1Speed = readSpeed("--blink-e1-speed");
      const e2Speed = readSpeed("--blink-e2-speed");
      const e3Speed = readSpeed("--blink-e3-speed");
      // 待ち13% + 細い23%/s1 + 半分25%/s2 + 全開39%/s3（CSS と同じ式）
      totalMs =
        duration *
        (0.13 + 0.23 / e1Speed + 0.25 / e2Speed + 0.39 / e3Speed);
    }
    const fallbackId = window.setTimeout(completeOnce, totalMs + 250);
    return () => window.clearTimeout(fallbackId);
  }, [completeOnce, duration, reducedMotion]);

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.pseudoElement !== "") {
      return;
    }
    if (!event.animationName.includes("openingCompletion")) {
      return;
    }
    completeOnce();
  }

  const style = {
    "--opening-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
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
