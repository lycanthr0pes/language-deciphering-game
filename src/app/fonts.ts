import localFont from "next/font/local";

export const mendeCipherFont = localFont({
  src: "../assets/fonts/NotoSansMendeKikakui-Regular.woff2",
  display: "block",
  preload: true,
  variable: "--font-mende-cipher",
});
