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

export interface ImageAnalysisResult {
  extractedText: string; // OCR로 추출된 텍스트
  riskLevel: string;
  phishingType: string;
  message: string; // AI 분석 상세
}

// 이미지(스미싱 문자 캡처) 진단 — 사진 URI를 multipart 업로드
export async function analyzeImage(uri: string): Promise<ImageAnalysisResult> {
  const name = uri.split('/').pop() || 'image.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';

  const form = new FormData();
  // 백엔드 파라미터명은 'file'
  form.append('file', { uri, name, type } as any);

  const res = await apiClient.post('/analysis/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data as ImageAnalysisResult;
}

export interface VoiceAnalysisResult {
  convertedText: string; // STT로 변환된 텍스트
  riskLevel: string;
  phishingType: string;
  message: string; // AI 분석 상세
}

// 음성(통화 녹음) 진단 — 오디오 파일을 multipart 업로드 (STT + AI)
export async function analyzeVoice(uri: string): Promise<VoiceAnalysisResult> {
  const name = uri.split('/').pop() || 'audio.m4a';
  const ext = name.split('.').pop()?.toLowerCase();
  const type = ext === 'wav' ? 'audio/wav' : ext === 'mp3' ? 'audio/mpeg' : 'audio/m4a';

  const form = new FormData();
  form.append('file', { uri, name, type } as any);

  const res = await apiClient.post('/analysis/voice', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // STT 변환은 시간이 걸릴 수 있음
  });
  return res.data.data as VoiceAnalysisResult;
}
