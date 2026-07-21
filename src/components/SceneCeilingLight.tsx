import Image from "next/image";
import { assetPath } from "@/lib/assetPath";
import { GAME_CONFIG } from "@/lib/gameConfig";
import styles from "./SceneCeilingLight.module.css";

type SceneCeilingLightProps = {
  preload?: boolean;
};

export function SceneCeilingLight({
  preload = false,
}: SceneCeilingLightProps) {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.asset}>
        <Image
          className={styles.image}
          src={assetPath(GAME_CONFIG.sceneAssets.ceilingLight)}
          alt=""
          fill
          sizes="30.9vw"
          preload={preload}
          unoptimized
        />
      </div>
    </div>
  );
}
