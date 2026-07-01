import { useAuth } from '@/contexts/auth';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FACC15" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🛡️ 돈킴이</Text>
        <Text style={styles.subtitle}>AI 피싱 탐지 플랫폼</Text>
      </View>

      {user ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>환영합니다, {user.nickname}님! 👋</Text>
          <Text style={styles.cardText}>{user.email}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/diagnosis')}>
            <Text style={styles.btnText}>🔗 URL 진단하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/image')}>
            <Text style={styles.btnText}>🖼️ 이미지 진단하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/voice')}>
            <Text style={styles.btnText}>🎙️ 음성 진단하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/chat')}>
            <Text style={styles.btnText}>💬 AI 챗봇 상담</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={logout}>
            <Text style={styles.btnOutlineText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>시작하기</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.btnOutlineText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, justifyContent: 'center', gap: 32 },
  center: { alignItems: 'center' },
  hero: { alignItems: 'center', gap: 8 },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#94A3B8' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, gap: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FACC15', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#CBD5E1', lineHeight: 22 },
  btn: { backgroundColor: '#FACC15', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#475569' },
  btnOutlineText: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
});
