import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./page.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Police auto-hébergée : pas de dépendance à Google Fonts au runtime.
const abcDiatype = localFont({
  src: [
    {
      path: "../fonts/abc-diatype/ABCDiatype-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/abc-diatype/ABCDiatype-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/abc-diatype/ABCDiatype-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-abc-diatype",
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
    <html lang="fr" className={abcDiatype.variable}>
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
