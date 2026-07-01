import { getAnalysisHistory, type AnalysisHistoryItem } from '@/api/analysis';
import { getChatSessions, type ChatSessionItem } from '@/api/chat';
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

const RISK: Record<string, { color: string; label: string }> = {
  SAFE: { color: '#22C55E', label: '안전' },
  LOW: { color: '#84CC16', label: '낮음' },
  MEDIUM: { color: '#FACC15', label: '중간' },
  HIGH: { color: '#F97316', label: '주의' },
  CRITICAL: { color: '#EF4444', label: '위험' },
};

const TYPE_LABEL: Record<string, string> = { URL: 'URL', IMAGE: '이미지', VOICE: '음성' };

function RiskBadge({ level }: { level: string }) {
  const r = RISK[level] ?? RISK.MEDIUM;
  return (
    <View style={[styles.badge, { backgroundColor: r.color }]}>
      <Text style={styles.badgeText}>{r.label}</Text>
    </View>
  );
}

export default function HistoryScreen() {
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
          <ActivityIndicator color="#FACC15" size="large" />
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
                    <RiskBadge level={item.riskLevel} />
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
              <View key={c.sessionId} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemType}>💬 상담</Text>
                  <RiskBadge level={c.riskLevel} />
                </View>
                <Text style={styles.itemTarget} numberOfLines={2}>
                  {c.preview}
                </Text>
                <Text style={styles.itemMeta}>{c.createdAt}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { color: '#94A3B8', fontSize: 15 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center' },
  tabActive: { backgroundColor: '#FACC15' },
  tabText: { color: '#94A3B8', fontWeight: '600' },
  tabTextActive: { color: '#0F172A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 10 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 15 },
  item: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, gap: 6 },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemType: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  itemTarget: { color: '#CBD5E1', fontSize: 14 },
  itemMeta: { color: '#64748B', fontSize: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#0F172A', fontWeight: 'bold', fontSize: 12 },
});
