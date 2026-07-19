export type SoundKey =
  | "dialogueNext"
  | "manTalk"
  | "writeNote"
  | "drawGun"
  | "gunShot"
  | "end"
  | "closeNote"
  | "openNote"
  | "wrongAnswer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: `${BASE_PATH}/assets/sounds/dialogue-next.mp3`,
  manTalk: `${BASE_PATH}/assets/sounds/man-talk.mp3`,
  writeNote: `${BASE_PATH}/assets/sounds/write-note.mp3`,
  drawGun: `${BASE_PATH}/assets/sounds/draw-gun.mp3`,
  gunShot: `${BASE_PATH}/assets/sounds/gun-shot.mp3`,
  end: `${BASE_PATH}/assets/sounds/end.mp3`,
  closeNote: `${BASE_PATH}/assets/sounds/close-note.mp3`,
  openNote: `${BASE_PATH}/assets/sounds/open-note.mp3`,
  wrongAnswer: `${BASE_PATH}/assets/sounds/wrong-answer.mp3`,
};

const SOUND_VOLUMES: Partial<Record<SoundKey, number>> = {
  end: 0.8,
  closeNote: 0.7,
  openNote: 0.7,
};

const audioCache = new Map<SoundKey, HTMLAudioElement>();

function getAudio(key: SoundKey) {
  let audio = audioCache.get(key);
  if (!audio) {
    audio = new Audio(SOUND_PATHS[key]);
    audio.volume = SOUND_VOLUMES[key] ?? 0.8;
    audio.preload = "auto";
    audioCache.set(key, audio);
  }
  return audio;
}

export function playSound(key: SoundKey) {
  const source = getAudio(key);
  const audio =
    source.paused || source.ended
      ? source
      : (source.cloneNode() as HTMLAudioElement);

  audio.volume = SOUND_VOLUMES[key] ?? 0.8;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // ブラウザの自動再生制限などで失敗した場合もゲーム進行は止めない。
  });
}
