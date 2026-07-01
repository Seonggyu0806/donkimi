import apiClient from './client';

export interface UrlAnalysisResult {
  riskScore: number;
  riskLevel: string; // SAFE | LOW | MEDIUM | HIGH | CRITICAL
  phishingType: string;
  recommendation: string;
  detectedKeywords: string; // AI 분석 상세 텍스트
}

// URL 피싱 진단 (인증 불필요하지만 토큰 있으면 이력 저장됨)
export async function analyzeUrl(url: string): Promise<UrlAnalysisResult> {
  const res = await apiClient.post('/analysis/url', { url });
  return res.data.data as UrlAnalysisResult;
}
