import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🛡️ 돈킴이</Text>
        <Text style={styles.subtitle}>AI 피싱 탐지 플랫폼</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>앱 개발 시작! 🎉</Text>
        <Text style={styles.cardText}>
          곧 여기에 로그인 · URL/이미지/음성 진단 · AI 챗봇 화면이 들어옵니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FACC15',
  },
  cardText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
  },
});
