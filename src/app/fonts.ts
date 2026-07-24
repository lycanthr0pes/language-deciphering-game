import { Inter, Noto_Sans_JP, Noto_Serif } from "next/font/google";
import localFont from "next/font/local";

export const japaneseUiFont = Noto_Sans_JP({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-japanese-ui",
});

export const displayFont = Inter({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const notoSerifFont = Noto_Serif({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-serif",
});

export const mendeCipherFont = localFont({
  src: "../assets/fonts/NotoSansMendeKikakui-Regular.woff2",
  display: "block",
  preload: true,
  adjustFontFallback: false,
  variable: "--font-mende-cipher",
});
