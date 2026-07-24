import { formatTime } from "@/utils/formatTime";
import styles from "./TimerDisplay.module.css";

type TimerDisplayProps = {
  timeLeft?: number | null;
  warningTime?: number | null;
  mistakesRemaining?: number | null;
};

export function TimerDisplay({
  timeLeft = null,
  warningTime = null,
  mistakesRemaining = null,
}: TimerDisplayProps) {
  const showTimer = timeLeft !== null;
  const showMistakes = mistakesRemaining !== null;
  const isWarning =
    showTimer && warningTime !== null && timeLeft <= warningTime;
  const isDanger = showMistakes && mistakesRemaining <= 0;

  if (!showTimer && !showMistakes) return null;

  const mistakesClassName = isDanger
    ? styles.warning
    : showTimer
      ? styles.subText
      : styles.normal;

  return (
    <div className={styles.timer}>
      {showTimer ? (
        <p className={isWarning ? styles.warning : styles.normal}>
          残り時間 {formatTime(timeLeft)}
        </p>
      ) : null}
      {showMistakes ? (
        <p className={mistakesClassName}>間違い可能 {mistakesRemaining}</p>
      ) : null}
    </div>
  );
}
