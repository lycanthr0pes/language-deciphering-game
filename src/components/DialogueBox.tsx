import styles from "./DialogueBox.module.css";

type DialogueBoxProps = {
  text: string;
  instruction: string;
};

export function DialogueBox({ text, instruction }: DialogueBoxProps) {
  return (
    <div className={styles.box}>
      <p className={styles.text}>{text}</p>
      <p className={styles.instruction}>{instruction}</p>
    </div>
  );
}
