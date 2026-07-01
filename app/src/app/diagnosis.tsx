import { analyzeUrl, type UrlAnalysisResult } from '@/api/analysis';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 위험도 → 색상/한글 라벨
const RISK: Record<string, { color: string; label: string }> = {
  SAFE: { color: '#22C55E', label: '안전' },
  LOW: { color: '#84CC16', label: '낮음' },
  MEDIUM: { color: '#FACC15', label: '중간' },
  HIGH: { color: '#F97316', label: '주의' },
  CRITICAL: { color: '#EF4444', label: '위험' },
};

export default function DiagnosisScreen() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);

  const onAnalyze = async () => {
    if (!url.trim()) {
      Alert.alert('입력 필요', '분석할 URL을 입력하세요.');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await analyzeUrl(url.trim());
      setResult(r);
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? '분석에 실패했습니다.')
        : '분석에 실패했습니다.';
      Alert.alert('분석 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  const risk = result ? (RISK[result.riskLevel] ?? RISK.MEDIUM) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🔗 URL 진단</Text>
        <Text style={styles.subtitle}>의심스러운 링크를 붙여넣고 분석하세요</Text>

        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          keyboardType="url"
          value={url}
          onChangeText={setUrl}
        />
        <TouchableOpacity style={styles.btn} onPress={onAnalyze} disabled={busy}>
          {busy ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnText}>분석하기</Text>}
        </TouchableOpacity>

        {result && risk && (
          <View style={styles.resultCard}>
            <View style={[styles.badge, { backgroundColor: risk.color }]}>
              <Text style={styles.badgeText}>
                {risk.label} · {result.riskScore}점
              </Text>
            </View>
            <Text style={styles.resultType}>유형: {result.phishingType}</Text>
            <Text style={styles.resultRec}>{result.recommendation}</Text>
            <View style={styles.divider} />
            <Text style={styles.resultDetailLabel}>AI 분석</Text>
            <Text style={styles.resultDetail}>{result.detectedKeywords}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 24, gap: 14 },
  back: { color: '#94A3B8', fontSize: 15, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  btn: { backgroundColor: '#FACC15', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, gap: 10, marginTop: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
  resultType: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  resultRec: { color: '#FACC15', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 4 },
  resultDetailLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  resultDetail: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
});
