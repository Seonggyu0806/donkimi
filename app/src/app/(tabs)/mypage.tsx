import { useAuth } from '@/contexts/auth';
import { useTheme, type ThemePreference } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: '시스템', icon: 'phone-portrait-outline' },
  { value: 'light', label: '라이트', icon: 'sunny-outline' },
  { value: 'dark', label: '다크', icon: 'moon-outline' },
];

export default function MypageTab() {
  const { user, logout } = useAuth();
  const { colors, preference, setPreference } = useTheme();
  const styles = createStyles(colors);

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
            <Ionicons name="person" size={32} color={colors.accentText} />
          </View>
          <Text style={styles.nickname}>{user?.nickname}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.themeCard}>
          <Text style={styles.themeLabel}>화면 테마</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => setPreference(opt.value)}
                >
                  <Ionicons name={opt.icon} size={18} color={active ? colors.accentText : colors.textMuted} />
                  <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/history')}>
          <Ionicons name="time-outline" size={20} color={colors.accent} />
          <Text style={styles.menuText}>분석 · 대화 이력</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/blocklist')}>
          <Ionicons name="ban-outline" size={20} color={colors.accent} />
          <Text style={styles.menuText}>차단 번호 관리</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 24, gap: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: c.text },
    profile: { alignItems: 'center', gap: 8, backgroundColor: c.surface, borderRadius: 16, padding: 28 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    nickname: { color: c.text, fontSize: 20, fontWeight: 'bold' },
    email: { color: c.textMuted, fontSize: 14 },
    themeCard: { backgroundColor: c.surface, borderRadius: 12, padding: 16, gap: 10 },
    themeLabel: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
    themeRow: { flexDirection: 'row', gap: 8 },
    themeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: c.background,
    },
    themeOptionActive: { backgroundColor: c.accent },
    themeOptionText: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
    themeOptionTextActive: { color: c.accentText },
    menuBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    menuText: { flex: 1, color: c.textSecondary, fontSize: 16, fontWeight: '600' },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: c.danger,
      borderRadius: 12,
      paddingVertical: 14,
    },
    logoutText: { color: c.danger, fontSize: 16, fontWeight: '600' },
  });
}
