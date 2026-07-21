# Noto Sans Mende Kikakui 暗号フォント仕様

作成日: 2026-07-17
対象: UI・絵担当、実装担当
最終決定: @ly(らい) / PM
最終更新: 2026-07-20
ステータス: 仕様承認済み・実装未完了
承認日: 2026-07-20

## 1. 目的

暗号表示へ`Noto Sans Mende Kikakui`を採用し、フォント配置、Unicode文字の割り当て、Next.js実装、Figma利用、確認方法を定義する。

対象フォント:

https://fonts.google.com/noto/specimen/Noto+Sans+Mende+Kikakui?preview.script=Mend&preview.lang=men_Mend

## 2. 採用方針

- `Noto Sans Mende Kikakui`をゲーム内の暗号表示に使用する。
- Google Fontsへの実行時通信には依存せず、フォントをプロジェクト内へ配置する。
- `next/font/local`で読み込み、静的出力と授業サーバの`basePath`に対応する。
- Private Use Areaや仮英字は使わず、Mende Kikakuiの実際のUnicode文字を使用する。
- 暗号の内部ID、日本語の正解、画面表示用文字列は別データとして管理する。
- 通常会話、日本語訳、ボタン、リザルトにはこのフォントを適用しない。

## 3. フォント情報

| 項目 | 内容 |
| --- | --- |
| フォント名 | `Noto Sans Mende Kikakui` |
| 文字範囲 | `U+1E800`から`U+1E8DF` |
| 追加収録 | `U+25CC` |
| 文字方向 | 右から左 |
| Web用形式 | WOFF2 |
| Figma用形式 | TTFまたはOTF |
| ライセンス | SIL Open Font License 1.1 |

SIL Open Font License 1.1では、フォントの利用、埋め込み、再配布が許可されている。ただし、フォントと一緒に著作権表示とライセンスを保管・配布する。

## 4. 注意事項

- Mende Kikakuiは架空文字ではなく、実在する文字体系である。
- ゲーム内では「存在しない言語」ではなく「メンデ文字を用いた暗号表記」として扱う。
- Unicode文字をコピーまたは調査すると、使用している文字体系を特定できる。
- ゲーム中の誤操作防止のため、暗号を含むプレイヤー画面全体へ`user-select: none`を設定し、左クリックやドラッグによる範囲選択を発生させない。これは暗号秘匿の手段ではなく、Unicode文字列とアクセシビリティ用ラベルはDOM上に維持する。
- フォントを改変する場合は、SIL Open Font Licenseの予約名称と再配布条件を再確認する。
- テスト版ではフォントを改変せず、そのまま利用することを推奨する。

## 5. 推奨ファイル構成

```text
src/
  app/
    fonts.ts
    layout.tsx
  assets/
    fonts/
      NotoSansMendeKikakui-Regular.woff2
  components/
    CipherText.tsx
    CipherText.module.css
  data/
    cipherGlyphs.ts
  lib/
    loadCipherFont.ts
public/
  licenses/
    NotoSansMendeKikakui-OFL.txt
```

## 6. フォントの入手と配置

1. Google Fontsの対象ページからフォントをダウンロードする。
2. Figma用のTTFまたはOTFをUI担当のPCへインストールする。
3. Web用のMende Kikakui文字を収録したWOFF2を用意する。
4. WOFF2を`src/assets/fonts/NotoSansMendeKikakui-Regular.woff2`へ配置する。
5. `OFL.txt`を`public/licenses/NotoSansMendeKikakui-OFL.txt`へ配置する。
6. フォントファイルとライセンスを同じPull Requestへ含める。

Google Fontsが現在配信しているCSS APIは以下である。

```text
https://fonts.googleapis.com/css2?family=Noto+Sans+Mende+Kikakui&display=swap
```

CSS APIはMende Kikakui用WOFF2の取得確認に使用できる。ただし、アプリからこのURLを毎回参照する構成にはしない。

## 7. Next.jsでの読み込み

### `src/app/fonts.ts`

```ts
import localFont from "next/font/local";

export const mendeCipherFont = localFont({
  src: "../assets/fonts/NotoSansMendeKikakui-Regular.woff2",
  display: "block",
  preload: true,
  adjustFontFallback: false,
  variable: "--font-mende-cipher",
});
```

### `src/app/layout.tsx`

```tsx
import type { ReactNode } from "react";
import { mendeCipherFont } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={mendeCipherFont.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`next/font/local`が`@font-face`を生成するため、手動の`@font-face`は追加しない。

## 8. 暗号文字の割り当て

### 基本方針

既存の`語幹 + 語尾`による推理構造を維持する。

- 内部カテゴリごとに1文字を割り当てる。
- 候補1と候補2に共通の文字を1文字ずつ割り当てる。
- 1つの暗号単語は`カテゴリ文字 + 候補文字`の2文字で構成する。
- 文字の見た目から、カテゴリと候補番号の共通規則を推測できるようにする。

必要な文字数は以下の8文字である。

| 用途 | 必要数 |
| --- | --- |
| 色 | 1 |
| 性質 | 1 |
| 数量 | 1 |
| 動詞 | 1 |
| 人系名詞 | 1 |
| 動物系名詞 | 1 |
| 候補1 | 1 |
| 候補2 | 1 |

### 承認済みコードポイント

テスト版では以下の割り当てを使用する。変更する場合はFigma、実装、Unicode対応表、テストを同じ変更単位で更新し、PM承認を得る。

| 用途 | コードポイント |
| --- | --- |
| 色 | `U+1E865` |
| 性質 | `U+1E822` |
| 数量 | `U+1E8A3` |
| 動詞 | `U+1E83D` |
| 人系名詞 | `U+1E845` |
| 動物系名詞 | `U+1E83A` |
| 候補1 | `U+1E854` |
| 候補2 | `U+1E827` |

### `src/data/cipherGlyphs.ts`

```ts
import type {
  CandidateIndex,
  CipherGlyphEntry,
  CipherId,
  InternalCategory,
} from "@/lib/gameTypes";

const CATEGORY_CODE_POINTS: Record<InternalCategory, number> = {
  color: 0x1e865,
  quality: 0x1e822,
  quantity: 0x1e8a3,
  verb: 0x1e83d,
  humanNoun: 0x1e845,
  animalNoun: 0x1e83a,
};

const CANDIDATE_CODE_POINTS: Record<CandidateIndex, number> = {
  1: 0x1e854,
  2: 0x1e827,
};

function createGlyphText(
  category: InternalCategory,
  candidateIndex: CandidateIndex,
) {
  return String.fromCodePoint(
    CATEGORY_CODE_POINTS[category],
    CANDIDATE_CODE_POINTS[candidateIndex],
  );
}

export const CIPHER_GLYPHS = {
  "color-1": { cipherId: "color-1", glyphText: createGlyphText("color", 1) },
  "color-2": { cipherId: "color-2", glyphText: createGlyphText("color", 2) },
  "quality-1": { cipherId: "quality-1", glyphText: createGlyphText("quality", 1) },
  "quality-2": { cipherId: "quality-2", glyphText: createGlyphText("quality", 2) },
  "quantity-1": { cipherId: "quantity-1", glyphText: createGlyphText("quantity", 1) },
  "quantity-2": { cipherId: "quantity-2", glyphText: createGlyphText("quantity", 2) },
  "verb-1": { cipherId: "verb-1", glyphText: createGlyphText("verb", 1) },
  "verb-2": { cipherId: "verb-2", glyphText: createGlyphText("verb", 2) },
  "humanNoun-1": { cipherId: "humanNoun-1", glyphText: createGlyphText("humanNoun", 1) },
  "humanNoun-2": { cipherId: "humanNoun-2", glyphText: createGlyphText("humanNoun", 2) },
  "animalNoun-1": { cipherId: "animalNoun-1", glyphText: createGlyphText("animalNoun", 1) },
  "animalNoun-2": { cipherId: "animalNoun-2", glyphText: createGlyphText("animalNoun", 2) },
} satisfies Record<CipherId, CipherGlyphEntry>;

export const REQUIRED_MENDE_GLYPHS =
  Object.values(CIPHER_GLYPHS).map((entry) => entry.glyphText).join("") + " ";

export function getCipherGlyph(cipherId: CipherId) {
  return CIPHER_GLYPHS[cipherId];
}
```

## 9. 文字方向の制御

Mende Kikakui文字の双方向カテゴリは`Right To Left`である。暗号文全体へ単純にRTLを指定すると、問題内の単語順まで逆転する可能性がある。

以下の方向制御を採用する。

- 暗号文全体の単語順は左から右にする。
- 各暗号単語の内部は右から左にする。
- 各暗号単語を`unicode-bidi: isolate`で独立させる。
- Reactの配列順は正解となる日本語の語順と一致させる。

### `src/components/CipherText.tsx`

```tsx
import type { ReactNode } from "react";
import styles from "./CipherText.module.css";

type CipherTextProps = {
  children: ReactNode;
  ariaLabel: string;
};

export function CipherText({ children, ariaLabel }: CipherTextProps) {
  return (
    <span
      className={styles.cipherWord}
      lang="men-Mend"
      dir="rtl"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
```

### 暗号文の表示例

```tsx
<div className={styles.cipherSentence} dir="ltr">
  {tokens.map((token, index) => (
    <button key={token.id} type="button">
      <CipherText ariaLabel={`暗号単語${index + 1}`}>
        {token.glyphText}
      </CipherText>
    </button>
  ))}
</div>
```

### `src/components/CipherText.module.css`

```css
.cipherSentence {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  direction: ltr;
}

.cipherWord {
  direction: rtl;
  unicode-bidi: isolate;
  font-family: var(--font-mende-cipher);
  font-size: 42px;
  letter-spacing: 0.12em;
}
```

## 10. フォント読み込み確認

`src/lib/loadCipherFont.ts`

```ts
import { REQUIRED_MENDE_GLYPHS } from "@/data/cipherGlyphs";

export async function loadMendeCipherFont() {
  if (typeof document === "undefined") return false;

  await document.fonts.ready;
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-mende-cipher")
    .trim();
  if (!fontFamily) return false;

  const loaded = await document.fonts.load(
    `16px ${fontFamily}`,
    REQUIRED_MENDE_GLYPHS,
  );

  return loaded.some((fontFace) => fontFace.status === "loaded");
}
```

`GameScreen`では`loading`、`ready`、`error`を管理する。

```tsx
const [fontStatus, setFontStatus] = useState<
  "loading" | "ready" | "error"
>("loading");

useEffect(() => {
  let cancelled = false;

  void loadMendeCipherFont()
    .then((loaded) => {
      if (!cancelled) setFontStatus(loaded ? "ready" : "error");
    })
    .catch(() => {
      if (!cancelled) setFontStatus("error");
    });

  return () => {
    cancelled = true;
  };
}, []);

if (fontStatus === "error") {
  return <p role="alert">暗号フォントを読み込めません。再読み込みしてください。</p>;
}

if (fontStatus !== "ready") {
  return <p>読み込み中...</p>;
}
```

フォント読み込みに失敗した場合、仮英字へフォールバックしてゲームを続行しない。

## 11. Figmaでの利用

### 11.1 フォントのインストール

1. Google FontsからTTFまたはOTFをダウンロードする。
2. Windowsではフォントファイルを右クリックし、`すべてのユーザーに対してインストール`を選ぶ。
3. macOSではフォントファイルをダブルクリックし、Font Bookの`フォントをインストール`を選ぶ。
4. Figma Desktopを完全に終了してから再起動する。
5. Figmaのフォント選択欄で`Noto Sans Mende Kikakui`を検索する。

Figmaブラウザ版を使う場合は、Figma Font InstallerまたはFigma Font Serviceをインストールし、ブラウザを再起動する。ローカルフォントを安定して使うため、制作時はFigma Desktopを推奨する。

### 11.2 文字の入力方法

Mende Kikakui文字は通常の日本語キーボードから直接入力しない。本書のコピー用文字、または承認済み文字対応表から実際のUnicode文字をコピーして、Figmaのテキストレイヤーへ貼り付ける。

1. Figmaで`T`キーを押してテキストレイヤーを作る。
2. フォントを`Noto Sans Mende Kikakui`へ変更する。
3. 下のコピー用一覧から`入力文字`をコピーする。
4. Figmaのテキストレイヤーへ貼り付ける。
5. フォントサイズを初期案の`42px`にする。
6. Letter spacingを初期案の`12%`にする。
7. テキストレイヤー名を`color-1`などの`cipherId`へ変更する。

`U+1E865`や`\u{1E865}`という文字列をFigmaへ入力しても字形には変換されない。必ず実際のMende Kikakui文字をコピーして貼り付ける。

### 11.3 単体文字のコピー用一覧

| 用途 | コードポイント | コピーする文字 |
| --- | --- | --- |
| 色 | `U+1E865` | `𞡥` |
| 性質 | `U+1E822` | `𞠢` |
| 数量 | `U+1E8A3` | `𞢣` |
| 動詞 | `U+1E83D` | `𞠽` |
| 人系名詞 | `U+1E845` | `𞡅` |
| 動物系名詞 | `U+1E83A` | `𞠺` |
| 候補1 | `U+1E854` | `𞡔` |
| 候補2 | `U+1E827` | `𞠧` |

### 11.4 暗号単語のコピー用一覧

各入力文字列は、内部データ上で`カテゴリ文字 + 候補文字`の順に並んでいる。Mende Kikakuiは右から左の文字なので、Figma上の見た目では入力順と左右が逆に見える場合がある。

| `cipherId` | 対応する日本語 | コードポイント列 | Figmaへ貼る入力文字 |
| --- | --- | --- | --- |
| `color-1` | 赤い | `U+1E865 U+1E854` | `𞡥𞡔` |
| `color-2` | 青い | `U+1E865 U+1E827` | `𞡥𞠧` |
| `quality-1` | 大きな | `U+1E822 U+1E854` | `𞠢𞡔` |
| `quality-2` | 小さな | `U+1E822 U+1E827` | `𞠢𞠧` |
| `quantity-1` | いくつかの | `U+1E8A3 U+1E854` | `𞢣𞡔` |
| `quantity-2` | たくさんの | `U+1E8A3 U+1E827` | `𞢣𞠧` |
| `verb-1` | 見る | `U+1E83D U+1E854` | `𞠽𞡔` |
| `verb-2` | 追う | `U+1E83D U+1E827` | `𞠽𞠧` |
| `humanNoun-1` | 男 | `U+1E845 U+1E854` | `𞡅𞡔` |
| `humanNoun-2` | 女 | `U+1E845 U+1E827` | `𞡅𞠧` |
| `animalNoun-1` | 犬 | `U+1E83A U+1E854` | `𞠺𞡔` |
| `animalNoun-2` | 猫 | `U+1E83A U+1E827` | `𞠺𞠧` |

### 11.5 暗号文の組み方

文章全体を1つのテキストレイヤーへ貼ると、右から左の文字方向によって単語順まで変わる可能性がある。そのため、Figmaでは1暗号単語につき1テキストレイヤーを作る。

1. 問題文用の横方向Auto Layoutを作る。
2. Auto Layoutの並び方向を左から右にする。
3. 暗号単語ごとに別のテキストレイヤーを作る。
4. 正解となる日本語の語順に合わせ、テキストレイヤーをAuto Layout内へ並べる。
5. 各レイヤーには上の一覧から2文字を貼り付ける。
6. 単語間のgapは初期案として`20px`にする。
7. 2単語、3単語、Lv8の5単語でレイアウトを確認する。

例として`青い 女`を表す場合、Auto Layout内のレイヤー順は以下とする。

```text
1. color-2      入力文字: 𞡥𞠧
2. humanNoun-2  入力文字: 𞡅𞠧
```

Figma上で字形の左右が想定と異なって見えても、見た目だけを合わせるために文字列を逆順へ変更しない。コードポイント列を正本として、ブラウザ実装と比較する。

### 11.6 Figmaコンポーネント

以下のコンポーネントを作成する。

- `CipherWord / Default`
- `CipherWord / Hover`
- `CipherWord / Selected`
- `CipherWord / Answered`

コンポーネント内の文字はアウトライン化しない。アウトライン化すると、実装担当がUnicode文字を確認・コピーできなくなる。

### 11.7 表示されない場合

| 症状 | 確認すること |
| --- | --- |
| フォント一覧に出ない | Figmaを完全終了して再起動する |
| ブラウザ版だけ出ない | Figma Font Installerを入れ、ブラウザを再起動する |
| 四角い豆腐文字になる | テキストレイヤーのフォントが`Noto Sans Mende Kikakui`か確認する |
| 貼り付けても空に見える | レイヤーのフォントサイズ、色、不透明度を確認する |
| 単語順が逆になる | 文章を1レイヤーにせず、単語別レイヤーと横Auto Layoutを使う |
| 実装と見た目が違う | レイヤー名とコードポイント列を対応表と照合する |

### 11.8 UI担当の完了条件

- Figmaで`Noto Sans Mende Kikakui`を選択できる。
- 8個の単体文字をすべて表示できる。
- 12個の暗号単語をコピー入力できる。
- 暗号単語を1レイヤーずつ管理している。
- 2単語、3単語、5単語の暗号文を左から右の順で配置できる。
- テキストをアウトライン化していない。
- Figmaとブラウザで同じコードポイント列を使っている。

## 12. 担当者

| 作業 | 主担当 | 確認者 |
| --- | --- | --- |
| フォント仕様の変更承認 | @ly(らい) | 全員 |
| ライセンス確認 | @ly(らい) | @ほっそー |
| 使用する8文字の選定 | @ささかまぼこ。 | @ly(らい) |
| Figmaへのフォント適用 | @ささかまぼこ。 | @ly(らい) |
| Unicode対応表の作成 | @ほっそー | @ささかまぼこ。 |
| フォントファイル配置 | @ほっそー | @ly(らい) |
| `next/font/local`の実装 | @ほっそー | @かまぼこ(本物) |
| 暗号生成への接続 | @ほっそー | @かまぼこ(本物) |
| 解答UIへの接続 | @かまぼこ(本物) | @ほっそー |
| 授業サーバでの確認 | @かまぼこ(本物) | @ほっそー |
| 最終表示確認 | @ly(らい) | 全員 |

## 13. 動作確認

| 確認項目 | 期待結果 |
| --- | --- |
| ローカル起動 | フォント読込エラーが出ない |
| 暗号例文 | Mende Kikakuiの字形で表示される |
| 問題文 | 仮英字が表示されない |
| 手帳 | 問題画面と同じ字形で表示される |
| 解答UI | 暗号単語ごとのクリック範囲が正しい |
| 文字方向 | 単語順は左から右、単語内部は右から左になる |
| Lv8 | 5単語の境界と順序を判別できる |
| Figma比較 | Figmaとブラウザで同じ字形になる |
| 静的ビルド | `npm run build`が成功する |
| 授業サーバ | フォントファイルがHTTP 200で取得できる |
| Network | フォントの404がない |
| 読込失敗 | エラーを表示し、仮英字で続行しない |

## 14. 承認内容

| ID | 決定項目 | 承認値 | PM決定 |
| --- | --- | --- | --- |
| M01 | フォント採用 | `Noto Sans Mende Kikakui`を採用 | 承認 |
| M02 | 配信方法 | ローカル配置と`next/font/local` | 承認 |
| M03 | 使用文字数 | カテゴリ6文字、候補2文字の合計8文字 | 承認 |
| M04 | 文字構造 | `カテゴリ文字 + 候補文字` | 承認 |
| M05 | 単語内部の方向 | 右から左 | 承認 |
| M06 | 問題内の単語順 | 左から右 | 承認 |
| M07 | コードポイント | `U+1E865`、`U+1E822`、`U+1E8A3`、`U+1E83D`、`U+1E845`、`U+1E83A`、`U+1E854`、`U+1E827` | 承認 |
| M08 | ゲーム内表現 | メンデ文字を用いた暗号表記 | 承認 |

## 15. 完了条件

- WOFF2、TTFまたはOTF、`OFL.txt`が用意されている。
- PMが使用する8文字を承認している。
- Figmaと実装で同じUnicode対応表を使っている。
- 仮英字とPrivate Use Areaがプレイヤー画面で使われていない。
- 暗号文全体と各単語の文字方向が仕様どおりである。
- フォント読み込み失敗時のエラー処理がある。
- ローカルと授業サーバの両方で表示確認が完了している。
- @ly(らい)が最終表示を承認している。
