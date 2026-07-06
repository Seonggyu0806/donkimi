// 위험도(riskLevel) → 표시 색상/한글 라벨. URL·이미지·음성·전화번호·이력 화면에서 공용으로 사용.
// 토스 스타일에 맞춰 채도를 살짝 낮춘 톤.
export const RISK: Record<string, { color: string; label: string }> = {
  SAFE: { color: '#00C471', label: '안전' },
  LOW: { color: '#3DD9A4', label: '낮음' },
  MEDIUM: { color: '#FFB020', label: '중간' },
  HIGH: { color: '#FF8A00', label: '주의' },
  CRITICAL: { color: '#F04452', label: '위험' },
};

// 위험도 뱃지는 배경색이 테마와 무관하게 고정돼 있으므로, 뱃지 위 텍스트도 테마 색과 분리된 고정값을 쓴다.
// (accentText는 테마별로 흰색/어두운색이 바뀔 수 있어 뱃지 배경(초록~빨강)과 대비가 깨질 수 있음)
export const RISK_TEXT = '#171B21';
