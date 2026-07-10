import { getAnalysisHistory, getGlobalStats } from '@/api/analysis';
import { getMyReports } from '@/api/number';
import { useAuth } from '@/contexts/auth';
import { getBlockedNumbers } from '@/native/callblock';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { BannerCarousel } from '@/ui/BannerCarousel';
import { RiskGauge } from '@/ui/RiskGauge';
import { StatBars } from '@/ui/StatBars';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Styles = ReturnType<typeof createStyles>;

// 전화번호 조회는 분석 이력에 남지 않아, PHONE만 "신고 건수"로 집계한다.
const TYPES = ['URL', 'IMAGE', 'VOICE', 'PHONE'] as const;
const TYPE_LABEL: Record<string, string> = {
  URL: 'URL',
  IMAGE: '이미지',
  VOICE: '음성',
  PHONE: '전화번호',
};

type TypeCount = Record<string, number>;
const emptyCounts = (): TypeCount => ({ URL: 0, IMAGE: 0, VOICE: 0, PHONE: 0 });

function toBars(counts: TypeCount) {
  return TYPES.map((t) => ({ label: TYPE_LABEL[t], value: counts[t] ?? 0 }));
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

// 1번 배너: 진단 탭으로 유도하는 메인 진입점
function DiagnoseBanner({ styles, colors }: { styles: Styles; colors: ThemeColors }) {
  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.9} onPress={() => router.push('/diagnose')}>
      <Ionicons name="shield-checkmark" size={128} color={colors.accentText} style={styles.bannerMark} />

      <View style={styles.bannerBadge}>
        <Text style={styles.bannerBadgeText}>AI 피싱 탐지 플랫폼</Text>
      </View>

      <Text style={styles.bannerTitle}>피싱으로부터{'\n'}안전하게 지켜드려요</Text>

      <View style={styles.bannerCta}>
        <Text style={styles.bannerCtaText}>지금 진단하기</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.accent} />
      </View>
    </TouchableOpacity>
  );
}

// 2번 배너: 전체 사용자의 분야별 진단량
function GlobalStatsBanner({
  styles,
  colors,
  counts,
  total,
}: {
  styles: Styles;
  colors: ThemeColors;
  counts: TypeCount;
  total: number;
}) {
  return (
    <View style={styles.banner}>
      <Ionicons name="bar-chart" size={124} color={colors.accentText} style={styles.bannerMark} />

      <View style={styles.bannerBadge}>
        <Text style={styles.bannerBadgeText}>전체 사용자</Text>
      </View>

      <Text style={styles.statTitle}>분야별 진단량</Text>
      <StatBars data={toBars(counts)} />
      <Text style={styles.statFoot}>총 {total.toLocaleString()}건 · 전화번호는 신고 건수예요</Text>
    </View>
  );
}

// 3번 배너: 내 분야별 진단량 + 내가 차단한 번호 수
function MyStatsBanner({
  styles,
  colors,
  counts,
  blockedCount,
}: {
  styles: Styles;
  colors: ThemeColors;
  counts: TypeCount;
  blockedCount: number;
}) {
  const myTotal = TYPES.reduce((sum, t) => sum + (counts[t] ?? 0), 0);

  return (
    <View style={styles.banner}>
      <Ionicons name="person-circle" size={124} color={colors.accentText} style={styles.bannerMark} />

      <View style={styles.bannerBadge}>
        <Text style={styles.bannerBadgeText}>내 활동</Text>
      </View>

      <Text style={styles.statTitle}>내 활동 {myTotal.toLocaleString()}건</Text>
      <StatBars data={toBars(counts)} />

      <View style={styles.blockedRow}>
        <Ionicons name="ban" size={14} color={colors.accentText} />
        <Text style={styles.statFootInline}>차단한 번호 {blockedCount}개</Text>
      </View>
    </View>
  );
}

export default function HomeTab() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [globalCounts, setGlobalCounts] = useState<TypeCount>(emptyCounts);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [myCounts, setMyCounts] = useState<TypeCount>(emptyCounts);
  const [blockedCount, setBlockedCount] = useState(0);

  // 통계는 부가 정보라 실패해도 화면을 막지 않고 0으로 둔다
  useEffect(() => {
    (async () => {
      try {
        const stats = await getGlobalStats();
        setGlobalCounts({ ...emptyCounts(), ...stats.byType });
        setGlobalTotal(stats.total);
      } catch {
        // 무시
      }

      try {
        const [history, myReports] = await Promise.all([getAnalysisHistory(), getMyReports()]);
        const counts = emptyCounts();
        for (const item of history) {
          const type = (item.type ?? '').toUpperCase();
          if (type in counts) counts[type] += 1;
        }
        counts.PHONE = myReports.length; // 전화번호는 내가 신고한 건수
        setMyCounts(counts);
      } catch {
        // 무시
      }

      try {
        setBlockedCount((await getBlockedNumbers()).length);
      } catch {
        // 무시
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ShieldHero styles={styles} colors={colors} />

        <Text style={styles.logo}>돈킴이</Text>
        <Text style={styles.greeting}>안녕하세요, {user?.nickname}님! 👋</Text>

        <BannerCarousel style={styles.carousel}>
          <DiagnoseBanner styles={styles} colors={colors} />
          <GlobalStatsBanner styles={styles} colors={colors} counts={globalCounts} total={globalTotal} />
          <MyStatsBanner styles={styles} colors={colors} counts={myCounts} blockedCount={blockedCount} />
        </BannerCarousel>

        <RiskGauge
          style={styles.gauge}
          title="위험도는 이렇게 표시돼요"
          caption="진단이 끝나면 위 5단계 중 하나로 결과를 알려드려요. 주의·위험이면 링크를 누르거나 연락에 응하지 마세요."
        />
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

    carousel: { marginTop: 24 },
    // 세 배너의 내용 길이가 달라도 캐러셀 높이가 튀지 않도록 최소 높이를 맞춘다
    banner: {
      backgroundColor: c.accent,
      borderRadius: 20,
      padding: 22,
      overflow: 'hidden',
      minHeight: 196,
      justifyContent: 'center',
    },
    // 배너 우하단에 은은하게 깔리는 워터마크 아이콘
    bannerMark: { position: 'absolute', right: -16, bottom: -22, opacity: 0.15 },
    bannerBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 14,
    },
    bannerBadgeText: { color: c.accentText, fontSize: 11, fontWeight: '700' },
    bannerTitle: { color: c.accentText, fontSize: 22, fontWeight: 'bold', lineHeight: 31, marginBottom: 22 },
    bannerCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    bannerCtaText: { color: c.accent, fontSize: 14, fontWeight: 'bold' },

    statTitle: { color: c.accentText, fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
    statFoot: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 12 },
    statFootInline: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
    blockedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },

    gauge: { marginTop: 20 },
  });
}
