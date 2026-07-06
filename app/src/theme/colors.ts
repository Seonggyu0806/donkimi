export interface ThemeColors {
  background: string; // 화면 최상위 배경
  surface: string; // 카드/입력창 배경
  border: string; // 구분선/테두리
  text: string; // 제목 등 강조 텍스트
  textSecondary: string; // 본문/라벨
  textMuted: string; // 보조 설명
  textFaint: string; // placeholder, 타임스탬프
  accent: string; // 브랜드 포인트색(토스 블루)
  accentText: string; // accent 배경 위 텍스트
  danger: string;
  success: string;
  warning: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
}

// 토스(Toss) 스타일: 채도를 낮춘 블루 포인트색 + 부드러운 회색 배경
export const darkColors: ThemeColors = {
  background: '#111318',
  surface: '#1C1E24',
  border: '#2A2D33',
  text: '#F2F4F6',
  textSecondary: '#D1D6DB',
  textMuted: '#8B95A1',
  textFaint: '#5D6673',
  accent: '#4593FC',
  accentText: '#FFFFFF',
  danger: '#FF5B5B',
  success: '#2ED47A',
  warning: '#FFA53D',
  tabBarBackground: '#111318',
  tabBarBorder: '#1C1E24',
  tabActive: '#4593FC',
  tabInactive: '#5D6673',
};

export const lightColors: ThemeColors = {
  background: '#F2F4F6',
  surface: '#FFFFFF',
  border: '#E5E8EB',
  text: '#191F28',
  textSecondary: '#333D4B',
  textMuted: '#6B7684',
  textFaint: '#B0B8C1',
  accent: '#3182F6',
  accentText: '#FFFFFF',
  danger: '#F04452',
  success: '#00C471',
  warning: '#FF8A00',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E8EB',
  tabActive: '#3182F6',
  tabInactive: '#B0B8C1',
};
