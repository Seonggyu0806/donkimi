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

// AI 챗봇 상담 (인증 필요 — 로그인 토큰 자동 첨부)
export async function sendChat(sessionId: string, message: string): Promise<ChatResponse> {
  const res = await apiClient.post('/chat', {
    sessionId,
    message,
    type: 'chat',
    riskLevel: 'MEDIUM',
    preview: message.slice(0, 20),
  });
  return res.data.data as ChatResponse;
}
