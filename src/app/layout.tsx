import type { Metadata } from "next";
import { displayFont, japaneseUiFont, mendeCipherFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "言語解読ゲーム",
  description: "Mende Kikakui文字を使った一人称視点の暗号解読ゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${japaneseUiFont.variable} ${displayFont.variable} ${mendeCipherFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
