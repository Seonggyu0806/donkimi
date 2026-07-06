export interface ThemeColors {
  background: string; // 화면 최상위 배경
  surface: string; // 카드/입력창 배경
  border: string; // 구분선/테두리
  text: string; // 제목 등 강조 텍스트
  textSecondary: string; // 본문/라벨
  textMuted: string; // 보조 설명
  textFaint: string; // placeholder, 타임스탬프
  accent: string; // 브랜드 포인트색(노랑)
  accentText: string; // accent 배경 위 텍스트
  danger: string;
  success: string;
  warning: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
}

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  text: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  accent: '#FACC15',
  accentText: '#0F172A',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F97316',
  tabBarBackground: '#0F172A',
  tabBarBorder: '#1E293B',
  tabActive: '#FACC15',
  tabInactive: '#64748B',
};

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  accent: '#EAB308',
  accentText: '#0F172A',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#EA580C',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabActive: '#CA8A04',
  tabInactive: '#94A3B8',
};
