import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "カラス被害どこマップ",
  description: "金沢市内におけるカラス二次被害防止の提案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
