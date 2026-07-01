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

// 이미지(스미싱 캡처) 진단 — 여러 장 multipart 업로드 (백엔드가 List로 받음)
export async function analyzeImage(uris: string[]): Promise<ImageAnalysisResult> {
  const form = new FormData();
  uris.forEach((uri, i) => {
    const name = uri.split('/').pop() || `image_${i}.jpg`;
    const ext = name.split('.').pop()?.toLowerCase();
    const type = ext === 'png' ? 'image/png' : 'image/jpeg';
    form.append('file', { uri, name, type } as any); // 파라미터명 'file' 반복 = List
  });

  const res = await apiClient.post('/analysis/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return res.data.data as ImageAnalysisResult;
}

// 분석 이력 항목 (GET /analysis/history)
export interface AnalysisHistoryItem {
  id: number;
  type?: string; // URL | IMAGE | VOICE
  target?: string;
  riskScore?: number;
  riskLevel: string;
  phishingType?: string;
  analyzedAt: string;
}

export async function getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
  const res = await apiClient.get('/analysis/history');
  return (res.data.data ?? []) as AnalysisHistoryItem[];
}

export interface VoiceAnalysisResult {
  convertedText: string; // STT로 변환된 텍스트
  riskLevel: string;
  phishingType: string;
  message: string; // AI 분석 상세
}

// 음성(통화 녹음) 진단 — 오디오 파일을 multipart 업로드 (STT + AI)
// 음성(통화 녹음 파일) 진단 — 여러 오디오 파일 multipart 업로드
export async function analyzeVoice(files: { uri: string; name: string }[]): Promise<VoiceAnalysisResult> {
  const form = new FormData();
  files.forEach((f, i) => {
    const name = f.name || `audio_${i}.m4a`;
    const ext = name.split('.').pop()?.toLowerCase();
    const type =
      ext === 'wav' ? 'audio/wav' : ext === 'mp3' ? 'audio/mpeg' : ext === 'm4a' ? 'audio/m4a' : 'audio/*';
    form.append('file', { uri: f.uri, name, type } as any);
  });

  const res = await apiClient.post('/analysis/voice', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // STT 변환은 시간이 걸릴 수 있음
  });
  return res.data.data as VoiceAnalysisResult;
}
