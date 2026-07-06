// 위험도(riskLevel) → 표시 색상/한글 라벨. URL·이미지·음성·전화번호·이력 화면에서 공용으로 사용.
export const RISK: Record<string, { color: string; label: string }> = {
  SAFE: { color: '#22C55E', label: '안전' },
  LOW: { color: '#84CC16', label: '낮음' },
  MEDIUM: { color: '#FACC15', label: '중간' },
  HIGH: { color: '#F97316', label: '주의' },
  CRITICAL: { color: '#EF4444', label: '위험' },
};
