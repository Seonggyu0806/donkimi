import axios from 'axios';

// 라이브 백엔드 (Railway 배포)
const BASE_URL = 'https://donkimi.up.railway.app/api/v1';

// 로그인 후 토큰을 메모리에 보관 (요청마다 자동 첨부)
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default apiClient;
