import apiClient from './client';

export interface ChatResponse {
  sessionId: string;
  chatMessageId: number;
  reply: string;
  riskLevel: string;
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
