import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./page.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Geist auto-hébergée : pas de dépendance à Google Fonts au runtime.
const geist = localFont({
  src: [
    {
      path: "../fonts/geist/Geist-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/geist/Geist-Italic-VariableFont_wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://emilien-vancau.github.io"),
    title: "Vancauwenberghe Emilien — AI Engineer & Amateur Astronomer",
    description:
      "Portfolio of my personal and professional projects, including my CV, contact information, and links to my social media profiles.",
    openGraph: {
      title: "Vancauwenberghe Emilien — AI Engineer & Amateur Astronomer",
      description:
        "Portfolio of my personal and professional projects, including my CV, contact information, and links to my social media profiles.",
      url: "/",
      type: "website",
    },
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
