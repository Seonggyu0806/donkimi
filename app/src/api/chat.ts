import apiClient from './client';

export interface ChatResponse {
  sessionId: string;
  chatMessageId: number;
  reply: string;
  riskLevel: string;
}

// 대화 세션 목록 (GET /chat/sessions)
export interface ChatSessionItem {
  sessionId: string;
  type: string;
  riskLevel: string;
  preview: string;
  createdAt: string;
}

export async function getChatSessions(): Promise<ChatSessionItem[]> {
  const res = await apiClient.get('/chat/sessions');
  return (res.data.data ?? []) as ChatSessionItem[];
}

// 세션의 이전 대화 복원 (GET /chat/{sessionId}/history)
export interface ConversationMessage {
  role: string; // 'user' | 'assistant'
  content: string;
  createdAt?: string;
}
export interface ConversationHistory {
  sessionId?: string;
  riskLevel: string;
  messages: ConversationMessage[];
}
export async function getConversationHistory(sessionId: string): Promise<ConversationHistory> {
  const res = await apiClient.get(`/chat/${sessionId}/history`);
  return res.data.data as ConversationHistory;
}

// AI 챗봇 상담 (인증 필요). meta는 진단 후 첫 메시지에 진단 종류·위험도를 세션에 저장하는 용도.
export async function sendChat(
  sessionId: string,
  message: string,
  meta?: { type?: string; riskLevel?: string; preview?: string },
): Promise<ChatResponse> {
  const res = await apiClient.post('/chat', {
    sessionId,
    message,
    type: meta?.type ?? 'chat',
    riskLevel: meta?.riskLevel ?? 'MEDIUM',
    preview: meta?.preview ?? message.slice(0, 20),
  });
  return res.data.data as ChatResponse;
}
