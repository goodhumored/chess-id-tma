import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "../components/TelegramProvider";
import { AuthProvider } from "../components/AuthProvider";
import AppBar from "../components/layout/AppBar";
import BackButtonHandler from "../components/BackButtonHandler";

const jakartaSans = Plus_Jakarta_Sans({
  // subsets: ["cyrillic-ext"],
  variable: "--font-jakarta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ChessID",
  description: "ChessID",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    // { media: "(prefers-color-scheme: light)", color: "#F3E8D2" },
    // { media: "(prefers-color-scheme: dark)", color: "#F3E8D2" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={jakartaSans.className}>
      <head>
        <script defer src="https://telegram.org/js/telegram-web-app.js?59"></script>
      </head>
      <body
        className={`antialiased bg-background! flex flex-col justify-between pb-24! `}
      >
        <TelegramProvider>
          <AuthProvider>
            <BackButtonHandler />
            {children}
            <AppBar />
          </AuthProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
