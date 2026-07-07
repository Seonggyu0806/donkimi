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

  await Promise.all([
    ...onlyOnServer.map((n) => addBlockedNumber(n)),
    ...onlyOnDevice.map((n) => addBlockedNumberApi(n)),
  ]);

  return onlyOnServer.length > 0 ? await getBlockedNumbers() : local;
}
