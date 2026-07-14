import { getBlockedNumbersApi } from '@/api/blocklist';
import { addBlockedNumber, getBlockedNumbers, removeBlockedNumber } from '@/native/callblock';

// 차단 번호는 계정 종속이다. 서버(계정별 목록)가 원본이고, 기기 로컬 목록은
// "지금 로그인한 계정의 목록을 그대로 반영하는 캐시"다.
// (실제 통화 차단은 OS가 기기 로컬 목록을 읽어 동작하므로 기기 캐시는 반드시 필요)
//
// 이 함수는 기기 로컬 목록을 현재 계정의 서버 목록과 "정확히 일치"시킨다(교체).
//  - 서버에 없는데 기기에 있는 번호 → 제거 (다른 계정 잔재/이전 로그인 흔적)
//  - 서버에 있는데 기기에 없는 번호 → 추가 (복원)
// 로그인·세션 복원·차단 관리 화면 진입 때 호출한다.
export async function syncBlockedNumbers(): Promise<string[]> {
  const [local, server] = await Promise.all([getBlockedNumbers(), getBlockedNumbersApi()]);
  const serverSet = new Set(server);
  const localSet = new Set(local);

  // SharedPreferences는 읽기→수정→쓰기라 순차로 처리 (동시 호출 시 유실됨)
  for (const n of local) {
    if (!serverSet.has(n)) await removeBlockedNumber(n);
  }
  for (const n of server) {
    if (!localSet.has(n)) await addBlockedNumber(n);
  }

  return server;
}
