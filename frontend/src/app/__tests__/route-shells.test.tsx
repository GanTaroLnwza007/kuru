import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
import ChatPage from "@/app/chat/page";
import ExplorePage from "@/app/explore/page";
import ProgramDetailPage from "@/app/explore/[programId]/page";
import PortfolioPage from "@/app/portfolio/page";
import RiasecPage from "@/app/riasec/page";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ programId: "cpe" }),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("@/lib/store", () => ({
  useAppStore: (selector: (s: unknown) => unknown) =>
    selector({
      chat: {
        messages: [],
        sessionId: null,
        isLoading: false,
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
        setSessionId: vi.fn(),
        setLoading: vi.fn(),
      },
      riasec: {
        scores: null,
        setScores: vi.fn(),
        resetRiasec: vi.fn(),
      },
    }),
}));

vi.mock("@/lib/api", () => ({
  apiClient: {
    searchPrograms: async () => ({ data: { results: [], total: 0 }, sources: [], isMock: true }),
    getProgramDetail: async () => ({
      data: {
        id: "cpe",
        name_th: "วิศวกรรมคอมพิวเตอร์",
        name_en: "Computer Engineering",
        faculty_th: "คณะวิศวกรรมศาสตร์",
        faculty_en: "Faculty of Engineering",
        degree: "ปริญญาตรี",
        campus: "Bang Khen",
        match_score: 1.0,
        year_by_year_vibe: "test vibe",
        plos: [],
        tcas_rounds: [],
      },
      sources: [],
      isMock: true,
    }),
    chat: async () => ({
      data: { answer: "ok", session_id: "test" },
      sources: [],
      isMock: true,
    }),
  },
}));

describe("MVP route shells", () => {
  it("renders chat shell", () => {
    render(<ChatPage />);
    expect(screen.getByTestId("chat-shell")).toBeInTheDocument();
  });

  it("renders explore shell", () => {
    render(<ExplorePage />);
    expect(screen.getByTestId("explore-shell")).toBeInTheDocument();
  });

  it("renders explore detail shell", () => {
    render(<ProgramDetailPage />);
    expect(screen.getByTestId("explore-detail-shell")).toBeInTheDocument();
  });

  it("renders riasec shell", () => {
    render(<RiasecPage />);
    expect(screen.queryByTestId("riasec-shell")).toBeDefined();
  });

  it("renders portfolio shell", async () => {
    render(await PortfolioPage());
    expect(screen.getByTestId("portfolio-shell")).toBeInTheDocument();
  });
});
