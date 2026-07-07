import apiClient from './client';

export interface LoginResult {
  accessToken: string;
  email: string;
  nickname: string;
  provider: string; // LOCAL | GOOGLE 등
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

// 구글 소셜 로그인 (idToken은 앱의 Google Sign-In에서 발급받은 것)
export async function googleLoginApi(idToken: string): Promise<LoginResult> {
  const res = await apiClient.post('/users/oauth/google', { idToken });
  return res.data.data as LoginResult;
}
