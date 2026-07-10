// 국내 전화번호 자동 하이픈 포매팅.
// 서버(ReportsService)와 네이티브(CallBlockStore)가 숫자만 남겨 정규화하므로,
// 하이픈이 섞인 문자열을 그대로 보내도 안전하다.

/** 입력에서 숫자만 남기고 최대 11자리로 제한 */
function digitsOnly(raw: string): string {
  return raw.replace(/[^0-9]/g, '').slice(0, 11);
}

/**
 * 입력 중인 번호에 하이픈을 붙인다. 자릿수가 덜 찬 상태에서도 자연스럽게 동작한다.
 * - 02 (서울): 02-123-4567 / 02-1234-5678
 * - 15xx·16xx·18xx (대표번호): 1588-1234
 * - 그 외(010, 031 등): 010-1234-5678 / 031-123-4567
 */
export function formatPhone(raw: string): string {
  const d = digitsOnly(raw);
  if (d.length === 0) return '';

  // 서울 지역번호는 2자리
  if (d.startsWith('02')) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }

  // 8자리 대표번호(1588-1234 등)는 지역번호가 없다
  if (/^1[5-9]/.test(d)) {
    if (d.length <= 4) return d;
    return `${d.slice(0, 4)}-${d.slice(4, 8)}`;
  }

  // 나머지는 3자리 국번(휴대폰/지역번호)
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}
