import { create } from 'zustand';

export interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
  timestamp?: Date;
}

interface SessionState {
  sessionId: string | null;
  sessionName: string;
  chatHistory: ChatMessage[];
  jsxCode: string;
  cssCode: string;
  setSession: (data: Partial<Omit<SessionState, 'setSession'>>) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  sessionName: '',
  chatHistory: [],
  jsxCode: '',
  cssCode: '',
  setSession: (data) => set((state) => ({ ...state, ...data })),
  resetSession: () =>
    set({
      sessionId: null,
      sessionName: '',
      chatHistory: [],
      jsxCode: '',
      cssCode: '',
    }),
}));
