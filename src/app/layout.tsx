import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generative Art Gallery",
  description: "A collection of interactive generative art pieces built with p5.js and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-zinc-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
