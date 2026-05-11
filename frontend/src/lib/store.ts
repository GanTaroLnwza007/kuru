import { create } from "zustand";
import type { ChatSourceChunk } from "./api/schemas.generated";
import type { RiasecScores } from "./riasec";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  confidenceLevel?: "high" | "medium" | "low";
  sources?: ChatSourceChunk[];
  isMock?: boolean;
  usedTcasData?: boolean;
};

type ChatSlice = {
  messages: ChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setSessionId: (sessionId: string | null) => void;
  setLoading: (loading: boolean) => void;
};

export type RiasecAnswerValue = string | number | string[];

export type RiasecResult = {
  hollandCode: string;
  confidence: "low" | "medium" | "high";
  programIds: string[];
};

type RiasecSlice = {
  sessionId: string | null;
  currentStep: number;
  totalSteps: number;
  answers: Record<string, RiasecAnswerValue>;
  result: RiasecResult | null;
  scores: RiasecScores | null;
  setSessionId: (sessionId: string | null) => void;
  setStep: (step: number) => void;
  setAnswer: (questionId: string, value: RiasecAnswerValue) => void;
  setResult: (result: RiasecResult | null) => void;
  setScores: (scores: RiasecScores | null) => void;
  resetRiasec: () => void;
};

type AppStore = {
  chat: ChatSlice;
  riasec: RiasecSlice;
};

const initialRiasecState: Pick<
  RiasecSlice,
  "sessionId" | "currentStep" | "totalSteps" | "answers" | "result" | "scores"
> = {
  sessionId: null,
  currentStep: 1,
  totalSteps: 5,
  answers: {},
  result: null,
  scores: null,
};

export const useAppStore = create<AppStore>((set) => ({
  chat: {
    messages: [],
    sessionId: null,
    isLoading: false,
    addMessage: (message) =>
      set((state) => ({
        chat: { ...state.chat, messages: [...state.chat.messages, message] },
      })),
    clearMessages: () =>
      set((state) => ({ chat: { ...state.chat, messages: [], sessionId: null } })),
    setSessionId: (sessionId) =>
      set((state) => ({ chat: { ...state.chat, sessionId } })),
    setLoading: (isLoading) =>
      set((state) => ({ chat: { ...state.chat, isLoading } })),
  },
  riasec: {
    ...initialRiasecState,
    setSessionId: (sessionId) =>
      set((state) => ({ riasec: { ...state.riasec, sessionId } })),
    setStep: (currentStep) =>
      set((state) => ({ riasec: { ...state.riasec, currentStep } })),
    setAnswer: (questionId, value) =>
      set((state) => ({
        riasec: { ...state.riasec, answers: { ...state.riasec.answers, [questionId]: value } },
      })),
    setResult: (result) =>
      set((state) => ({ riasec: { ...state.riasec, result } })),
    setScores: (scores) =>
      set((state) => ({ riasec: { ...state.riasec, scores } })),
    resetRiasec: () =>
      set((state) => ({ riasec: { ...state.riasec, ...initialRiasecState } })),
  },
}));
