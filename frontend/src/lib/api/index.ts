import { mockApiClient } from "./mock-client";
import { realApiClient } from "./client";
import type { SourceChunk, ChatSourceChunk, ProgramSearchResult, ProgramDetail, ChatData, ChatRequest } from "./schemas.generated";
import type { SearchProgramsParams } from "./mock-client";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export type ClientResponse<T> = {
  data: T;
  sources: SourceChunk[];
  isMock: boolean;
};

export const apiClient = {
  async searchPrograms(params: SearchProgramsParams): Promise<ClientResponse<ProgramSearchResult>> {
    if (useMock) {
      const r = await mockApiClient.searchPrograms(params);
      return { data: r.data, sources: r.sources, isMock: true };
    }
    const data = await realApiClient.searchPrograms(params);
    return { data, sources: [], isMock: false };
  },

  async getProgramDetail(programId: string): Promise<ClientResponse<ProgramDetail>> {
    if (useMock) {
      const r = await mockApiClient.getProgramDetail(programId);
      return { data: r.data, sources: r.sources, isMock: true };
    }
    const data = await realApiClient.getProgramDetail(programId);
    return { data, sources: [], isMock: false };
  },

  async chat(payload: ChatRequest): Promise<ClientResponse<ChatData>> {
    if (useMock) {
      const r = await mockApiClient.chat(payload);
      return { data: r.data, sources: r.sources, isMock: true };
    }
    const data = await realApiClient.chat(payload);
    return { data, sources: [], isMock: false };
  },

  async chatFeedback(payload: {
    session_id: string;
    question: string;
    answer: string;
    rating: number;
  }): Promise<void> {
    if (useMock) return; // no-op: feedback not tracked in mock mode
    return realApiClient.chatFeedback(payload);
  },
};

export type { SearchProgramsParams };
export type {
  SourceChunk,
  ChatSourceChunk,
  PloItem,
  TcasRound,
  ProgramSummary,
  ProgramSearchResult,
  ProgramDetail,
  ChatRequest,
  ChatData,
} from "./schemas.generated";
export { ApiClientError } from "./client";
