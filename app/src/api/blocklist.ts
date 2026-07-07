import apiClient from './client';

// 계정에 저장된 차단 번호 목록 조회 (GET /blocklist)
export async function getBlockedNumbersApi(): Promise<string[]> {
  const res = await apiClient.get('/blocklist');
  const list = res.data.data as { number: string }[];
  return list.map((b) => b.number);
}

// 계정에 차단 번호 등록 (POST /blocklist)
export async function addBlockedNumberApi(number: string): Promise<void> {
  await apiClient.post('/blocklist', { number });
}

// 계정에서 차단 번호 삭제 (DELETE /blocklist/{number})
export async function removeBlockedNumberApi(number: string): Promise<void> {
  await apiClient.delete(`/blocklist/${encodeURIComponent(number)}`);
}
