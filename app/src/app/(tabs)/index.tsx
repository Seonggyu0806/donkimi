import { useAuth } from '@/contexts/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;

function ActionCard({ icon, label, desc, onPress }: { icon: IconName; label: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={26} color="#FACC15" />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

export default function HomeTab() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>🛡️ 돈킴이</Text>
        <Text style={styles.greeting}>안녕하세요, {user?.nickname}님! 👋</Text>
        <Text style={styles.sub}>의심스러운 링크·문자·통화를 AI로 진단하세요.</Text>

        <View style={styles.grid}>
          <ActionCard icon="link-outline" label="URL 진단" desc="의심 링크 검사" onPress={() => router.push('/url')} />
          <ActionCard icon="image-outline" label="이미지 진단" desc="스미싱 캡처 분석" onPress={() => router.push('/image')} />
          <ActionCard icon="mic-outline" label="음성 진단" desc="보이스피싱 판별" onPress={() => router.push('/voice')} />
          <ActionCard icon="call-outline" label="전화번호 조회" desc="신고 이력 확인" onPress={() => router.push('/phone')} />
          <ActionCard icon="chatbubbles-outline" label="AI 챗봇" desc="궁금한 점 상담" onPress={() => router.push('/chat')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 24, gap: 6 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  greeting: { fontSize: 18, color: '#E2E8F0', marginTop: 8 },
  sub: { fontSize: 14, color: '#94A3B8', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  cardLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 6 },
  cardDesc: { color: '#94A3B8', fontSize: 12 },
});
