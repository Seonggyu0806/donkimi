import { Stack } from 'expo-router';

export default function RootLayout() {
  // 우선 단순한 스택 네비게이션으로 시작 (헤더 숨김)
  return <Stack screenOptions={{ headerShown: false }} />;
}
