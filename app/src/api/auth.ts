import apiClient from './client';

export interface LoginResult {
  accessToken: string;
  email: string;
  nickname: string;
}

// 회원가입 (성공 시 { success, message, data } 반환)
export async function registerApi(nickname: string, email: string, password: string) {
  const res = await apiClient.post('/users', { nickname, email, password });
  return res.data;
}

// 로그인 (성공 시 data 안에 accessToken/email/nickname)
export async function loginApi(email: string, password: string): Promise<LoginResult> {
  const res = await apiClient.post('/users/login', { email, password });
  return res.data.data as LoginResult;
}
