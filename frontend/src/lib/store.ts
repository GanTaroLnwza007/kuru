import { create } from "zustand";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type ChatSlice = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
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
  setSessionId: (sessionId: string | null) => void;
  setStep: (step: number) => void;
  setAnswer: (questionId: string, value: RiasecAnswerValue) => void;
  setResult: (result: RiasecResult | null) => void;
  resetRiasec: () => void;
};

type AppStore = {
  chat: ChatSlice;
  riasec: RiasecSlice;
};

const initialRiasecState: Pick<
  RiasecSlice,
  "sessionId" | "currentStep" | "totalSteps" | "answers" | "result"
> = {
  sessionId: null,
  currentStep: 1,
  totalSteps: 5,
  answers: {},
  result: null,
};

export const useAppStore = create<AppStore>((set) => ({
  chat: {
    messages: [],
    addMessage: (message) =>
      set((state) => ({
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, message],
        },
      })),
    clearMessages: () =>
      set((state) => ({
        chat: {
          ...state.chat,
          messages: [],
        },
      })),
  },
  riasec: {
    ...initialRiasecState,
    setSessionId: (sessionId) =>
      set((state) => ({
        riasec: {
          ...state.riasec,
          sessionId,
        },
      })),
    setStep: (currentStep) =>
      set((state) => ({
        riasec: {
          ...state.riasec,
          currentStep,
        },
      })),
    setAnswer: (questionId, value) =>
      set((state) => ({
        riasec: {
          ...state.riasec,
          answers: {
            ...state.riasec.answers,
            [questionId]: value,
          },
        },
      })),
    setResult: (result) =>
      set((state) => ({
        riasec: {
          ...state.riasec,
          result,
        },
      })),
    resetRiasec: () =>
      set((state) => ({
        riasec: {
          ...state.riasec,
          ...initialRiasecState,
        },
      })),
  },
}));