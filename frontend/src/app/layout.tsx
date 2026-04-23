import type { Metadata } from "next";
import { Inter, Sarabun } from "next/font/google";
import { cn } from "@/lib/cn";
import "@/lib/env";
import "./globals.css";

const thaiFont = Sarabun({
  variable: "--font-kuru-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const enFont = Inter({
  variable: "--font-kuru-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KUru - ที่ปรึกษาเส้นทางการเรียน",
    template: "%s | KUru",
  },
  description:
    "ผู้ช่วยแนะแนวการศึกษาสำหรับนักเรียนไทย ค้นหาเส้นทางการเรียนต่อและอาชีพจากข้อมูล KU อย่างมีแหล่งอ้างอิง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn(thaiFont.variable, enFont.variable, "h-full antialiased")}
    >
      <body className="min-h-full bg-background text-foreground">
        <div id="app-providers" className="min-h-full">
          <div id="app-shell" className="flex min-h-full flex-col">
            <main id="app-content" className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}