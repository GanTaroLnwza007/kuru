import { randomUUID } from "crypto";
import type { ChatData, ChatRequest, ProgramDetail, ProgramSearchResult } from "./schemas.generated";
import {
  getMockProgramById,
  MOCK_CHAT_SOURCES,
  MOCK_SEARCH_SOURCES,
  MOCK_SOURCES,
  searchMockPrograms,
} from "./mock-data";

const SIMULATED_DELAY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return randomUUID();
}

export type SearchProgramsParams = {
  q?: string;
  faculty?: string;
  limit?: number;
};

export type MockApiClient = {
  searchPrograms(params: SearchProgramsParams): Promise<{
    data: ProgramSearchResult;
    sources: typeof MOCK_SEARCH_SOURCES;
    isMock: true;
  }>;
  getProgramDetail(programId: string): Promise<{
    data: ProgramDetail;
    sources: typeof MOCK_SOURCES;
    isMock: true;
  }>;
  chat(payload: ChatRequest): Promise<{
    data: ChatData;
    sources: never[];
    isMock: true;
  }>;
};

export const mockApiClient: MockApiClient = {
  async searchPrograms({ q = "", faculty, limit = 20 }) {
    await delay(SIMULATED_DELAY_MS);

    const results = searchMockPrograms(q, faculty).slice(0, limit);

    return {
      data: { results, total: results.length },
      sources: MOCK_SEARCH_SOURCES,
      isMock: true,
    };
  },

  async getProgramDetail(programId) {
    await delay(SIMULATED_DELAY_MS);

    const program = getMockProgramById(programId);

    if (!program) {
      throw new Error(`Program not found: ${programId}`);
    }

    return {
      data: program,
      sources: MOCK_SOURCES,
      isMock: true,
    };
  },

  async chat({ message, program_context_id, session_id }) {
    await delay(SIMULATED_DELAY_MS * 2);

    const program = program_context_id ? getMockProgramById(program_context_id) : null;

    let answer: string;

    if (program) {
      answer =
        `สำหรับ${program.name_th} (${program.name_en}) ที่${program.faculty_th} — ` +
        `${program.year_by_year_vibe ?? "เป็นหลักสูตรที่น่าสนใจมากครับ"} ` +
        `หากมีคำถามเพิ่มเติมเกี่ยวกับหลักสูตรนี้ สามารถถามได้เลยครับ`;
    } else {
      const greetings = [
        `ขอบคุณสำหรับคำถามครับ! "${message}" — ` +
          `KUru กำลังอยู่ในโหมดทดสอบ ข้อมูลจริงจากฐานข้อมูลจะพร้อมใช้งานเร็วๆ นี้ครับ`,
        `คำถามที่ดีมากครับ! สำหรับ "${message}" — ` +
          `ขณะนี้ KUru ยังอยู่ในโหมด Demo ข้อมูลหลักสูตรจริงกำลังถูกประมวลผลอยู่ครับ`,
      ];
      answer = greetings[Math.floor(Math.random() * greetings.length)];
    }

    return {
      data: {
        answer,
        session_id: session_id ?? uuid(),
        confidence_level: "high" as const,
        sources: MOCK_CHAT_SOURCES,
        used_tcas_data: false,
      },
      sources: [],
      isMock: true,
    };
  },
};
