import apiClient from './client';

// 회원 탈퇴 (LOCAL 계정은 password 필요, 소셜 계정은 생략 가능)
export async function withdrawApi(password?: string): Promise<void> {
  await apiClient.delete('/users/me', { data: password ? { password } : {} });
}
