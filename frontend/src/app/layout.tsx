import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { IBM_Plex_Sans_Thai, Inter, Plus_Jakarta_Sans, Sarabun, Source_Serif_4 } from "next/font/google";
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

const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const serifFont = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const thaiDisplayFont = IBM_Plex_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
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
      className={cn(thaiFont.variable, enFont.variable, displayFont.variable, serifFont.variable, thaiDisplayFont.variable, "h-full antialiased")}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}