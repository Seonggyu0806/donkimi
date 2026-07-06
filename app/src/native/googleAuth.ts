import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';

let configured = false;

// Google Cloud Console에서 만든 "웹 애플리케이션" OAuth 클라이언트 ID.
// 백엔드의 GOOGLE_OAUTH_WEB_CLIENT_ID 환경변수와 반드시 동일한 값이어야 함(aud 검증).
const WEB_CLIENT_ID = '181578037360-runu1lp6keo0u8oe6snmjulpolrmsfev.apps.googleusercontent.com';

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

// 구글 로그인 실행 → 성공 시 idToken 반환 (사용자가 취소하면 null)
export async function signInWithGoogle(): Promise<string | null> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices();

  // 매번 계정 선택창이 뜨도록 이전 네이티브 세션을 먼저 정리한다.
  // (안 하면 SDK가 마지막 로그인 계정을 기억해서 다른 계정으로 전환이 안 됨)
  try {
    await GoogleSignin.signOut();
  } catch {
    // 이전 세션이 없으면 에러가 날 수 있음 — 무시
  }

  const response = await GoogleSignin.signIn();

  if (isSuccessResponse(response)) {
    return response.data.idToken;
  }
  return null; // 사용자가 취소함
}

// 우리 앱에서 로그아웃할 때 구글 네이티브 세션도 함께 정리
export async function signOutGoogle(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // 구글로 로그인한 적이 없으면 에러가 날 수 있음 — 무시
  }
}

export function isGoogleCancel(e: unknown): boolean {
  const code = (e as { code?: string })?.code;
  return code === statusCodes.SIGN_IN_CANCELLED;
}
