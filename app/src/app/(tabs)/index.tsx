import { useAuth } from '@/contexts/auth';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;
type Styles = ReturnType<typeof createStyles>;

function ActionCard({
  icon,
  label,
  desc,
  onPress,
  styles,
  accent,
}: {
  icon: IconName;
  label: string;
  desc: string;
  onPress: () => void;
  styles: Styles;
  accent: string;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={26} color={accent} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

// 살아있는 느낌을 주는 방패 로고 - 은은하게 숨쉬듯 커졌다 작아지는 glow
function ShieldHero({ styles, colors }: { styles: Styles; colors: ThemeColors }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.05] });

  return (
    <View style={styles.heroWrap}>
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: colors.accent, transform: [{ scale: glowScale }], opacity: glowOpacity },
        ]}
      />
      <View style={styles.shieldCircle}>
        <Ionicons name="shield-checkmark" size={38} color={colors.accentText} />
      </View>
    </View>
  );
}

export default function HomeTab() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ShieldHero styles={styles} colors={colors} />

        <Text style={styles.logo}>돈킴이</Text>
        <Text style={styles.greeting}>안녕하세요, {user?.nickname}님! 👋</Text>
        <Text style={styles.sub}>의심스러운 링크·문자·통화를 AI로 진단하세요.</Text>

        <View style={styles.grid}>
          <ActionCard styles={styles} accent={colors.accent} icon="link-outline" label="URL 진단" desc="의심 링크 검사" onPress={() => router.push('/url')} />
          <ActionCard styles={styles} accent={colors.accent} icon="image-outline" label="이미지 진단" desc="스미싱 캡처 분석" onPress={() => router.push('/image')} />
          <ActionCard styles={styles} accent={colors.accent} icon="mic-outline" label="음성 진단" desc="보이스피싱 판별" onPress={() => router.push('/voice')} />
          <ActionCard styles={styles} accent={colors.accent} icon="call-outline" label="전화번호 조회" desc="신고 이력 확인" onPress={() => router.push('/phone')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 24, gap: 6, alignItems: 'stretch' },
    heroWrap: {
      alignSelf: 'center',
      width: 96,
      height: 96,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    glow: {
      position: 'absolute',
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    shieldCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: { fontSize: 26, fontWeight: 'bold', color: c.text, textAlign: 'center' },
    greeting: { fontSize: 18, color: c.textSecondary, marginTop: 10, textAlign: 'center' },
    sub: { fontSize: 14, color: c.textMuted, marginBottom: 24, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      width: '47%',
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 18,
      gap: 6,
    },
    cardLabel: { color: c.text, fontSize: 16, fontWeight: 'bold', marginTop: 6 },
    cardDesc: { color: c.textMuted, fontSize: 12 },
  });
}
