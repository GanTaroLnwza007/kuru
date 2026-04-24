import type { ReactNode } from "react";
import MainNav from "./MainNav";
import TopNavBar from "./TopNavBar";
import Footer from "./Footer";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <TopNavBar>
        <MainNav />
      </TopNavBar>

      <main id="app-content-region" className="flex-1 pb-8 pt-4 sm:pt-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}