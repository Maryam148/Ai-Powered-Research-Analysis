import type { Metadata } from "next";
import { Inter, Bungee } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NotificationProvider } from "@/components/ui/notifications";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });
const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });

export const metadata: Metadata = {
  title: "ReSearch Flow - AI Research Assistant",
  description: "AI-powered academic research assistant for discovering papers, generating summaries, and literature reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${bungee.variable}`}>
        <NotificationProvider>
          <Providers>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </Providers>
        </NotificationProvider>
      </body>
    </html>
  );
}
