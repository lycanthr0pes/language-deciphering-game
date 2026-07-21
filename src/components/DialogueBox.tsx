import { CipherText } from "./CipherText";
import cipherStyles from "./CipherText.module.css";
import type { DialogueLine } from "@/lib/gameTypes";
import styles from "./DialogueBox.module.css";

type DialogueBoxProps = {
  line: DialogueLine;
  instruction: string;
  actionCue: "next→" | "answer→";
};

function CipherDialogueText({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span className={cipherStyles.cipherSentence} dir="ltr">
      {words.map((word, index) => (
        <CipherText key={`${word}-${index}`} ariaLabel={`暗号単語${index + 1}`}>
          {word}
        </CipherText>
      ))}
    </span>
  );
}

export function DialogueBox({
  line,
  instruction,
  actionCue,
}: DialogueBoxProps) {
  const content =
    line.type === "cipher" ? (
      <CipherDialogueText text={line.text} />
    ) : (
      line.text
    );

  return (
    <>
      <div className={styles.box}>
        <p className={`${styles.text} ${styles[line.type]}`}>
          {content}
        </p>
        <p className={styles.actionCue} aria-hidden="true">
          {actionCue}
        </p>
      </div>
      <p className={styles.instruction}>{instruction}</p>
    </>
  );
}
