export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot"
  | "end"
  | "closeNote";

const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: "/assets/sounds/dialogue-next.mp3",
  manTalk: "/assets/sounds/man-talk.mp3",
  writeNote: "/assets/sounds/write-note.mp3",
  drawGun: "/assets/sounds/draw-gun.mp3",
  gunShot: "/assets/sounds/gun-shot.mp3",
  end: "/assets/sounds/end.mp3",
  closeNote: "/assets/sounds/close-note.mp3",
};

const SOUND_VOLUMES: Partial<Record<SoundKey, number>> = {
  end: 0.8,
  closeNote: 0.7,
};

export function playSound(key: SoundKey) {
  const audio = new Audio(SOUND_PATHS[key]);
  audio.volume = SOUND_VOLUMES[key] ?? 0.8;

  void audio.play().catch(() => {
    // ブラウザの自動再生制限などで失敗した場合もゲーム進行は止めない。
  });
}
