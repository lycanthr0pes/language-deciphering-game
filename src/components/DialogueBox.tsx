import { CipherText } from "./CipherText";
import cipherStyles from "./CipherText.module.css";
import type { DialogueLine } from "@/lib/gameTypes";
import styles from "./DialogueBox.module.css";

type DialogueBoxProps = {
  line: DialogueLine;
  instruction: string;
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

export function DialogueBox({ line, instruction }: DialogueBoxProps) {
  const content =
    line.type === "cipher" ? (
      <CipherDialogueText text={line.text} />
    ) : (
      line.text
    );

  return (
    <div className={styles.box}>
      <p className={`${styles.text} ${styles[line.type]}`}>
        {line.speaker === "man" ? <>男「{content}」</> : content}
      </p>
      <p className={styles.instruction}>{instruction}</p>
    </div>
  );
}
