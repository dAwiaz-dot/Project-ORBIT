import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Ryze Agency — Sua marca sobe.",
  description:
    "Criamos experiencias digitais que transformam empresas em referencias. Sites premium, sistemas, trafego pago e branding para marcas que querem estar em outro nivel.",
  applicationName: "Ryze Agency",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png"
  },
  appleWebApp: {
    capable: true,
    title: "Ryze Agency",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050505"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
