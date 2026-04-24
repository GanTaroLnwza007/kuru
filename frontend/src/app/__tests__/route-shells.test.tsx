import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChatPage from "@/app/chat/page";
import ExplorePage from "@/app/explore/page";
import ProgramDetailPage from "@/app/explore/[programId]/page";
import PortfolioPage from "@/app/portfolio/page";
import RiasecPage from "@/app/riasec/page";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

describe("MVP route shells", () => {
  it("renders chat shell", async () => {
    render(await ChatPage());
    expect(screen.getByTestId("chat-shell")).toBeInTheDocument();
  });

  it("renders explore shell", async () => {
    render(await ExplorePage());
    expect(screen.getByTestId("explore-shell")).toBeInTheDocument();
  });

  it("renders explore detail shell", async () => {
    render(await ProgramDetailPage({ params: Promise.resolve({ programId: "sample-program" }) }));
    expect(screen.getByTestId("explore-detail-shell")).toBeInTheDocument();
  });

  it("renders riasec shell", async () => {
    render(await RiasecPage());
    expect(screen.getByTestId("riasec-shell")).toBeInTheDocument();
  });

  it("renders portfolio shell", async () => {
    render(await PortfolioPage());
    expect(screen.getByTestId("portfolio-shell")).toBeInTheDocument();
  });
});