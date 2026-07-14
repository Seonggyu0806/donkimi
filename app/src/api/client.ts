import axios from 'axios';

// 라이브 백엔드 (Render 배포 · DB는 TiDB Serverless)
const BASE_URL = 'https://donkimi-backend.onrender.com/api/v1';

// 로그인 후 토큰을 메모리에 보관 (요청마다 자동 첨부)
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

// 토큰 만료(401) 시 호출할 콜백. AuthProvider가 로그아웃 처리를 등록한다.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 토큰 만료/무효 → 세션 정리 후 로그인 화면으로
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
