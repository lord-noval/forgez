import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { WorldProvider } from "@/components/providers/world-provider";
import { PWAProvider } from "@/components/pwa";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "FORGE-Z - Forge Your Future",
  description:
    "An RPG-style career exploration platform. Complete quests, discover industries, build skills, and forge your path to the future.",
  keywords: [
    "career exploration",
    "skills",
    "RPG",
    "gamification",
    "space tech",
    "robotics",
    "energy",
    "hackathons",
    "learning",
  ],
  authors: [{ name: "FORGE-Z" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FORGE-Z",
  },
  openGraph: {
    title: "FORGE-Z - Forge Your Future",
    description:
      "Complete quests, discover industries, build skills, and forge your path to the future.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F97316",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" data-world="forgez">
      <body className="antialiased min-h-screen bg-[var(--background)]">
        <NextIntlClientProvider messages={messages}>
          <WorldProvider>
            <ToastProvider>
              <PWAProvider>{children}</PWAProvider>
            </ToastProvider>
          </WorldProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
