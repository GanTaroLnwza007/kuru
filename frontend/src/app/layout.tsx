import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { Inter, Sarabun } from "next/font/google";
import { Providers } from "@/app/providers";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/cn";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(thaiFont.variable, enFont.variable, "h-full antialiased")}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}