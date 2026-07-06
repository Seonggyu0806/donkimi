import { analyzeVoice, type VoiceAnalysisResult } from '@/api/analysis';
import { RISK, RISK_TEXT } from '@/lib/risk';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useAlert } from '@/ui/AlertProvider';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoiceScreen() {
  const { colors } = useTheme();
  const showAlert = useAlert();
  const styles = createStyles(colors);
  const [files, setFiles] = useState<{ uri: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);

  const pickFiles = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!res.canceled && res.assets?.length) {
      setFiles(res.assets.map((a) => ({ uri: a.uri, name: a.name })));
      setResult(null);
    }
  };

  const onAnalyze = async () => {
    if (!files.length) {
      showAlert('파일 필요', '먼저 통화 녹음 파일을 선택하세요.', undefined, { variant: 'warning' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await analyzeVoice(files);
      setResult(r);
    } catch (e) {
      let msg = '분석에 실패했습니다.';
      if (axios.isAxiosError(e)) {
        const status = e.response?.status ?? '네트워크';
        const body = e.response?.data?.message ?? e.message;
        msg = `[${status}] ${body}`;
      }
      showAlert('분석 실패', msg, undefined, { variant: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  const risk = result ? (RISK[result.riskLevel] ?? RISK.MEDIUM) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎙️ 음성 진단</Text>
        <Text style={styles.subtitle}>통화 녹음 파일을 선택해 보이스피싱을 판별하세요 (여러 개 가능)</Text>

        <TouchableOpacity style={styles.pickBox} onPress={pickFiles}>
          <Text style={styles.pickText}>+ 녹음 파일 선택 {files.length > 0 ? `(${files.length}개)` : ''}</Text>
        </TouchableOpacity>

        {files.length > 0 && (
          <View style={styles.fileList}>
            {files.map((f, i) => (
              <Text key={i} style={styles.fileName} numberOfLines={1}>
                🎵 {f.name}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={onAnalyze} disabled={busy || !files.length}>
          {busy ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.btnText}>분석하기</Text>}
        </TouchableOpacity>

        {result && risk && (
          <View style={styles.resultCard}>
            <View style={[styles.badge, { backgroundColor: risk.color }]}>
              <Text style={styles.badgeText}>{risk.label}</Text>
            </View>
            <Text style={styles.resultType}>유형: {result.phishingType}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>변환된 통화 내용</Text>
            <Text style={styles.detail}>{result.convertedText}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>AI 분석</Text>
            <Text style={styles.detail}>{result.message}</Text>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    type: 'voice',
                    riskLevel: result.riskLevel,
                    summary: `[음성 진단 결과] 위험도 ${risk.label}\n유형: ${result.phishingType}\n${result.message}`,
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
    pickBox: {
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
      borderStyle: 'dashed',
    },
    pickText: { color: c.textMuted, fontSize: 16 },
    fileList: { gap: 6, backgroundColor: c.surface, borderRadius: 12, padding: 14 },
    fileName: { color: c.textSecondary, fontSize: 14 },
    btn: { backgroundColor: c.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    btnText: { color: c.accentText, fontSize: 16, fontWeight: 'bold' },
    resultCard: { backgroundColor: c.surface, borderRadius: 16, padding: 20, gap: 10, marginTop: 8 },
    badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
    badgeText: { color: RISK_TEXT, fontWeight: 'bold', fontSize: 15 },
    resultType: { color: c.textSecondary, fontSize: 15, fontWeight: '600' },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
    detailLabel: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
    detail: { color: c.textSecondary, fontSize: 14, lineHeight: 21 },
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
