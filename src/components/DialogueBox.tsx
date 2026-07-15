import type { DialogueLine } from "@/lib/gameTypes";
import styles from "./DialogueBox.module.css";

type DialogueBoxProps = {
  line: DialogueLine;
  instruction: string;
};

export function DialogueBox({ line, instruction }: DialogueBoxProps) {
  return (
    <div className={styles.box}>
      <p className={`${styles.text} ${styles[line.type]}`}>{line.text}</p>
      <p className={styles.instruction}>{instruction}</p>
    </div>
  );
}
