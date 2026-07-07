import apiClient from './client';

export interface MyInfo {
  email: string;
  nickname: string;
  provider: string; // LOCAL | GOOGLE 등
}

// 내 정보 조회 (GET /users/me) — 앱 시작 시 캐시된 세션의 provider 등을 최신화하는 데 사용
export async function getMyInfoApi(): Promise<MyInfo> {
  const res = await apiClient.get('/users/me');
  return res.data.data as MyInfo;
}

// 회원 탈퇴 (LOCAL 계정은 password 필요, 소셜 계정은 생략 가능)
export async function withdrawApi(password?: string): Promise<void> {
  await apiClient.delete('/users/me', { data: password ? { password } : {} });
}
