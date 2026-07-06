import { analyzeUrl, type UrlAnalysisResult } from '@/api/analysis';
import { RISK, RISK_TEXT } from '@/lib/risk';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useAlert } from '@/ui/AlertProvider';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UrlScreen() {
  const { colors } = useTheme();
  const showAlert = useAlert();
  const styles = createStyles(colors);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);

  const onAnalyze = async () => {
    if (!url.trim()) {
      showAlert('입력 필요', '분석할 URL을 입력하세요.', undefined, { variant: 'warning' });
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
      showAlert('분석 실패', msg, undefined, { variant: 'danger' });
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
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          keyboardType="url"
          value={url}
          onChangeText={setUrl}
        />
        <TouchableOpacity style={styles.btn} onPress={onAnalyze} disabled={busy}>
          {busy ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.btnText}>분석하기</Text>}
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
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    type: 'url',
                    riskLevel: result.riskLevel,
                    summary: `[URL 진단 결과] 위험도 ${risk.label} (${result.riskScore}점)\n유형: ${result.phishingType}\n${result.recommendation}`,
                  },
                })
              }
            >
              <Text style={styles.chatBtnText}>💬 이 결과 챗봇에게 물어보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { padding: 24, gap: 14 },
    back: { color: c.textMuted, fontSize: 15, marginBottom: 4 },
    title: { fontSize: 28, fontWeight: 'bold', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginBottom: 8 },
    input: {
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: c.text,
      fontSize: 15,
    },
    btn: { backgroundColor: c.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    btnText: { color: c.accentText, fontSize: 16, fontWeight: 'bold' },
    resultCard: { backgroundColor: c.surface, borderRadius: 16, padding: 20, gap: 10, marginTop: 8 },
    badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
    badgeText: { color: RISK_TEXT, fontWeight: 'bold', fontSize: 15 },
    resultType: { color: c.textSecondary, fontSize: 15, fontWeight: '600' },
    resultRec: { color: c.accent, fontSize: 14 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
    resultDetailLabel: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
    resultDetail: { color: c.textSecondary, fontSize: 14, lineHeight: 21 },
    chatBtn: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: c.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    chatBtnText: { color: c.accent, fontSize: 15, fontWeight: '600' },
  });
}
