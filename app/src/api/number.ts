import apiClient from './client';

export interface NumberLookupResult {
  number: string;
  reportCount: number;
  riskLevel: string;
  riskScore?: number;
  phishingType: string;
  message: string;
  hasData: boolean; // 신고 이력 존재 여부
}

export interface NumberReportResult {
  number: string;
  reportCount: number;
  message: string;
  alreadyReported: boolean; // 이미 신고한 번호면 true (계정당 1회)
}

// 전화번호 위험도 조회 (GET /reports/phone/{number})
export async function lookupNumber(phoneNumber: string): Promise<NumberLookupResult> {
  const res = await apiClient.get(`/reports/phone/${encodeURIComponent(phoneNumber)}`);
  const data = res.data.data as NumberLookupResult;
  // hasData 누락 시 reportCount로 보정 (웹과 동일 로직)
  if (data && data.hasData !== true) data.hasData = (data.reportCount ?? 0) > 0;
  return data;
}

// 전화번호 신고 (POST /reports/phone)
export async function reportNumber(number: string, phishingType?: string): Promise<NumberReportResult> {
  const body = phishingType ? { number, phishingType } : { number };
  const res = await apiClient.post('/reports/phone', body);
  return res.data.data as NumberReportResult;
}
