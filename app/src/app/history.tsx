import { getAnalysisHistory, type AnalysisHistoryItem } from '@/api/analysis';
import { getChatSessions, type ChatSessionItem } from '@/api/chat';
import { RISK } from '@/lib/risk';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TYPE_LABEL: Record<string, string> = { URL: 'URL', IMAGE: '이미지', VOICE: '음성' };

type Styles = ReturnType<typeof createStyles>;

function RiskBadge({ level, styles, accentText }: { level: string; styles: Styles; accentText: string }) {
  const r = RISK[level] ?? RISK.MEDIUM;
  return (
    <View style={[styles.badge, { backgroundColor: r.color }]}>
      <Text style={[styles.badgeText, { color: accentText }]}>{r.label}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [tab, setTab] = useState<'analysis' | 'chat'>('analysis');
  const [analysis, setAnalysis] = useState<AnalysisHistoryItem[]>([]);
  const [chats, setChats] = useState<ChatSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, c] = await Promise.all([getAnalysisHistory(), getChatSessions()]);
        setAnalysis(a);
        setChats(c);
      } catch {
        // 무시 (빈 목록 표시)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>이력</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'analysis' && styles.tabActive]}
          onPress={() => setTab('analysis')}
        >
          <Text style={[styles.tabText, tab === 'analysis' && styles.tabTextActive]}>분석 이력</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'chat' && styles.tabActive]}
          onPress={() => setTab('chat')}
        >
          <Text style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>대화 이력</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {tab === 'analysis' ? (
            analysis.length === 0 ? (
              <Text style={styles.empty}>아직 분석 이력이 없어요.</Text>
            ) : (
              analysis.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={styles.itemTop}>
                    <Text style={styles.itemType}>{TYPE_LABEL[item.type ?? 'URL'] ?? item.type}</Text>
                    <RiskBadge level={item.riskLevel} styles={styles} accentText={colors.accentText} />
                  </View>
                  <Text style={styles.itemTarget} numberOfLines={1}>
                    {item.target ?? '-'}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.phishingType ?? '기타'} · {item.analyzedAt}
                  </Text>
                </View>
              ))
            )
          ) : chats.length === 0 ? (
            <Text style={styles.empty}>아직 대화 이력이 없어요.</Text>
          ) : (
            chats.map((c) => (
              <TouchableOpacity
                key={c.sessionId}
                style={styles.item}
                onPress={() => router.push({ pathname: '/chat', params: { sessionId: c.sessionId } })}
              >
                <View style={styles.itemTop}>
                  <Text style={styles.itemType}>💬 상담</Text>
                  <RiskBadge level={c.riskLevel} styles={styles} accentText={colors.accentText} />
                </View>
                <Text style={styles.itemTarget} numberOfLines={2}>
                  {c.preview}
                </Text>
                <Text style={styles.itemMeta}>{c.createdAt} · 탭하면 대화 이어보기 ›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    back: { color: c.textMuted, fontSize: 15 },
    title: { color: c.text, fontSize: 18, fontWeight: 'bold' },
    tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: c.surface, alignItems: 'center' },
    tabActive: { backgroundColor: c.accent },
    tabText: { color: c.textMuted, fontWeight: '600' },
    tabTextActive: { color: c.accentText },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { padding: 16, gap: 10 },
    empty: { color: c.textFaint, textAlign: 'center', marginTop: 40, fontSize: 15 },
    item: { backgroundColor: c.surface, borderRadius: 12, padding: 16, gap: 6 },
    itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    itemType: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
    itemTarget: { color: c.textSecondary, fontSize: 14 },
    itemMeta: { color: c.textFaint, fontSize: 12 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
    badgeText: { fontWeight: 'bold', fontSize: 12 },
  });
}
