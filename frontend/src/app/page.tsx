import { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PopularProgramsSection from "@/components/landing/PopularProgramsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CtaBannerSection from "@/components/landing/CtaBannerSection";

export const metadata: Metadata = {
  title: "KUru - ค้นหาคณะที่ใช่สำหรับคุณ",
  description:
    "เครื่องมือแนะแนวการศึกษา AI สำหรับนักเรียน ม.6 ค้นหาคณะ KU ที่เหมาะกับคุณโดยอิงจาก RIASEC และข้อมูล มคอ.2 จริง",
};

export default async function LandingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <div className="flex flex-col gap-20 md:gap-28 py-8">
        <HeroSection />
        <FeaturesSection />
        <PopularProgramsSection />
        <HowItWorksSection />
        <CtaBannerSection />
      </div>
    </div>
  );
}
