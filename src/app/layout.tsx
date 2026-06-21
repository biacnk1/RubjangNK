import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { LiffProvider } from "@/components/LiffProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "rubjangNK - หาช่างและแม่บ้านหนองคาย",
  description: "แพลตฟอร์มหาช่างและแม่บ้านในหนองคาย ฟรี ไม่มีค่าคอมมิชชั่น",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <LiffProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </LiffProvider>
      </body>
    </html>
  );
}
