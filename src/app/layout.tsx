import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { THEME_INIT_SCRIPT } from "@/components/homestead/theme-toggle";
import "./globals.css";

// Paper Desktop typography (ADR-0007 §3): the app reads in a humanist sans;
// monospace is the data-and-chrome texture. IBM Plex isn't a variable font, so
// weights are listed explicitly.
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MyAcres",
  description: "Offline-first homestead management.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyAcres",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#9C4A2E" },
    { media: "(prefers-color-scheme: dark)", color: "#211913" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-flash theme init: set .dark before paint (ADR-0007 §2.4). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased bg-canvas text-ink`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
