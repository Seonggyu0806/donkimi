import { getBlockedNumbersApi, addBlockedNumberApi } from '@/api/blocklist';
import { addBlockedNumber, getBlockedNumbers } from '@/native/callblock';

// 기기 로컬 차단 목록(실시간 통화 차단용)과 계정 서버 목록(백업/복원용)을 합친다.
// - 서버에만 있는 번호 → 기기에 반영 (재설치/새 기기 복원)
// - 기기에만 있는 번호 → 서버에 반영 (계정에 백업)
// 반환값은 합쳐진 뒤의 최종 로컬 목록.
export async function syncBlockedNumbers(): Promise<string[]> {
  const [local, server] = await Promise.all([getBlockedNumbers(), getBlockedNumbersApi()]);
  const localSet = new Set(local);
  const serverSet = new Set(server);

  const onlyOnServer = server.filter((n) => !localSet.has(n));
  const onlyOnDevice = local.filter((n) => !serverSet.has(n));

  // 기기 저장소(SharedPreferences)는 읽기→수정→쓰기라 동시에 호출하면 서로를 덮어써
  // 마지막 하나만 남는다. 반드시 순차로 추가할 것.
  for (const n of onlyOnServer) {
    await addBlockedNumber(n);
  }

  // 서버는 번호마다 독립 요청이라 병렬로 보내도 안전
  await Promise.all(onlyOnDevice.map((n) => addBlockedNumberApi(n)));

  return onlyOnServer.length > 0 ? await getBlockedNumbers() : local;
}
