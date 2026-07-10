"use client";

import { useEffect, useState } from "react";
import { DialogueBox } from "./DialogueBox";
import styles from "./GameScreen.module.css";

const introDialogues = [
  "ここは・・・？",
  "目を覚ますと、知らない場所にいた。",
  "どうやら、椅子に縛られて動けないようだ。",
  "目の前の机には手帳とペンが置いてあり、その奥には仮面を付けた男が座っている。",
  "男が話しかけてきた・・・",
];

export function GameScreen() {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const currentDialogue = introDialogues[dialogueIndex];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        event.preventDefault();
        console.log("あとで手帳を開閉する");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleNextDialogue() {
    const nextIndex = dialogueIndex + 1;

    if (nextIndex < introDialogues.length) {
      setDialogueIndex(nextIndex);
    }
  }

  return (
    <main className={styles.screen} onClick={handleNextDialogue}>
      <DialogueBox
        text={currentDialogue}
        instruction="左クリックで進む"
      />
    </main>
  );
}
