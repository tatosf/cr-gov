import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GobiernoCR — Transparencia del Estado Costarricense",
    template: "%s | GobiernoCR",
  },
  description:
    "Visualiza la estructura, presupuesto y actividad del gobierno de Costa Rica. Datos abiertos, actualizados y accesibles para todos.",
  keywords: [
    "Costa Rica",
    "gobierno",
    "transparencia",
    "presupuesto",
    "datos abiertos",
    "asamblea legislativa",
    "contrataciones públicas",
  ],
  openGraph: {
    title: "GobiernoCR — Transparencia del Estado Costarricense",
    description:
      "Visualiza la estructura, presupuesto y actividad del gobierno de Costa Rica. Datos abiertos, actualizados y accesibles para todos.",
    locale: "es_CR",
    type: "website",
    siteName: "GobiernoCR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GobiernoCR — Transparencia del Estado Costarricense",
    description:
      "Visualiza la estructura, presupuesto y actividad del gobierno de Costa Rica.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
