import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import all available fonts for AI usage
import "../lib/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "O Canto do Açaí - Açaí Premium em Poço Fundo",
  description: "O melhor açaí premium de Poço Fundo - MG. Açaí tradicional e linha zero, milk shakes cremosos e entrega rápida. Peça já pelo WhatsApp!",
  keywords: "açaí, poço fundo, milk shake, delivery, açaí premium, linha zero",
  authors: [{ name: "O Canto do Açaí" }],
  openGraph: {
    title: "O Canto do Açaí - Açaí Premium em Poço Fundo",
    description: "O melhor açaí premium de Poço Fundo - MG. Açaí tradicional e linha zero, milk shakes cremosos e entrega rápida.",
    type: "website",
    locale: "pt_BR",
    siteName: "O Canto do Açaí"
  },
  twitter: {
    card: "summary_large_image",
    title: "O Canto do Açaí - Açaí Premium em Poço Fundo",
    description: "O melhor açaí premium de Poço Fundo - MG. Açaí tradicional e linha zero, milk shakes cremosos e entrega rápida."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}