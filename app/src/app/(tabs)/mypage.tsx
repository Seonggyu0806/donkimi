import { useAuth } from '@/contexts/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MypageTab() {
  const { user, logout } = useAuth();

  const onLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>내 정보</Text>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#0F172A" />
          </View>
          <Text style={styles.nickname}>{user?.nickname}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/history')}>
          <Ionicons name="time-outline" size={20} color="#FACC15" />
          <Text style={styles.menuText}>분석 · 대화 이력</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/blocklist')}>
          <Ionicons name="ban-outline" size={20} color="#FACC15" />
          <Text style={styles.menuText}>차단 번호 관리</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 24, gap: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  profile: { alignItems: 'center', gap: 8, backgroundColor: '#1E293B', borderRadius: 16, padding: 28 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  nickname: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  email: { color: '#94A3B8', fontSize: 14 },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuText: { flex: 1, color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
