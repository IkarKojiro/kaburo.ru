import type { Metadata } from "next";
import { Russo_One, Manrope } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-russo",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "KABURO - Streetwear магазин",
  description: "Российский бренд уличной одежды KABURO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${russoOne.variable} ${manrope.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
