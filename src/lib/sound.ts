import { assetPath } from "./assetPath";
import type { SoundKey } from "./gameTypes";

const SOUND_PATHS: Record<SoundKey, string> = {
  dialogueNext: assetPath("/assets/sounds/dialogue-next.mp3"),
  manTalk: assetPath("/assets/sounds/man-talk.mp3"),
  writeNote: assetPath("/assets/sounds/write-note.mp3"),
  drawGun: assetPath("/assets/sounds/draw-gun.mp3"),
  gunShot: assetPath("/assets/sounds/gun-shot.mp3"),
  end: assetPath("/assets/sounds/end.mp3"),
  closeNote: assetPath("/assets/sounds/close-note.mp3"),
  openNote: assetPath("/assets/sounds/open-note.mp3"),
  wrongAnswer: assetPath("/assets/sounds/wrong-answer.mp3"),
};

const SOUND_VOLUMES: Partial<Record<SoundKey, number>> = {
  end: 0.8,
  closeNote: 0.7,
  openNote: 0.7,
};

const AUDIO_POOL_SIZE = 3;

type AudioPoolEntry = {
  audio: HTMLAudioElement;
  isPlaying: boolean;
  startedAt: number;
};

const audioPools = new Map<SoundKey, AudioPoolEntry[]>();

function createAudio(key: SoundKey): AudioPoolEntry {
  const audio = new Audio(SOUND_PATHS[key]);
  audio.volume = SOUND_VOLUMES[key] ?? 0.8;
  audio.preload = "auto";
  const entry = { audio, isPlaying: false, startedAt: 0 };
  audio.addEventListener("ended", () => {
    entry.isPlaying = false;
  });
  return entry;
}

function getAudioPool(key: SoundKey) {
  let pool = audioPools.get(key);

  if (!pool) {
    pool = Array.from({ length: AUDIO_POOL_SIZE }, () => createAudio(key));
    audioPools.set(key, pool);
  }

  return pool;
}

export function preloadSounds() {
  if (typeof Audio === "undefined") return;

  (Object.keys(SOUND_PATHS) as SoundKey[]).forEach((key) => {
    getAudioPool(key).forEach(({ audio }) => {
      try {
        audio.load();
      } catch {
        // 先読みできない音源があってもゲームの起動は止めない。
      }
    });
  });
}

export function playSound(key: SoundKey) {
  if (typeof Audio === "undefined") return;

  const pool = getAudioPool(key);
  const entry =
    pool.find(({ audio, isPlaying }) => !isPlaying || audio.ended) ??
    pool.reduce((oldest, candidate) =>
      candidate.startedAt < oldest.startedAt ? candidate : oldest,
    );
  const { audio } = entry;

  audio.volume = SOUND_VOLUMES[key] ?? 0.8;
  entry.isPlaying = true;
  entry.startedAt = Date.now();

  try {
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {
      entry.isPlaying = false;
      // ブラウザの自動再生制限などで失敗しても進行は止めない。
    });
  } catch {
    entry.isPlaying = false;
    // 読込前のシークなどが失敗してもゲーム進行は止めない。
  }
}

export function playButtonPressSound() {
  playSound("dialogueNext");
}
