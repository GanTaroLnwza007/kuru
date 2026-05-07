import { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TrustedBar from "@/components/landing/TrustedBar";
import TrendingSection from "@/components/landing/TrendingSection";
import WhySection from "@/components/landing/WhySection";
import CtaBannerSection from "@/components/landing/CtaBannerSection";

export const metadata: Metadata = {
  title: "KUru — เลือกคณะอย่างมั่นใจ ด้วย AI",
  description:
    "AI-powered academic pathway advisor สำหรับนักเรียน ม.6 ค้นหาคณะ KU ที่เหมาะกับคุณโดยอิงจาก RIASEC และข้อมูล มคอ.2 จริง",
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <TrustedBar />
      <TrendingSection />
      <WhySection />
      <CtaBannerSection />
    </>
  );
}
