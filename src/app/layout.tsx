import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./page.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Polices auto-hébergées (fichiers dans src/fonts) : pas de dépendance
// à Google Fonts au runtime, build reproductible hors-ligne.
const plexSans = localFont({
  src: "../fonts/ibm-plex-sans/IBMPlexSans-Variable.ttf",
  variable: "--font-plex-sans",
  weight: "100 700",
  style: "normal",
  display: "swap",
});

const plexMono = localFont({
  src: [
    {
      path: "../fonts/ibm-plex-mono/IBMPlexMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-mono/IBMPlexMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

const fraunces = localFont({
  src: [
    {
      path: "../fonts/fraunces/Fraunces-Variable.ttf",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../fonts/fraunces/Fraunces-Italic-Variable.ttf",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vancauwenberghe Emilien — AI Engineer & Amateur Astronomer",
  description:
    "Portfolio of my personal and professional projects, including my CV, contact information, and links to my social media profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body
        className={`${plexSans.variable} ${plexMono.variable} ${fraunces.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
