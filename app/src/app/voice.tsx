import { analyzeVoice, type VoiceAnalysisResult } from '@/api/analysis';
import axios from 'axios';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function VoiceScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('권한 필요', '마이크 접근 권한을 허용해주세요.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  const startRec = async () => {
    setUri(null);
    setResult(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRec = async () => {
    await recorder.stop();
    setUri(recorder.uri);
  };

  const onAnalyze = async () => {
    if (!uri) {
      Alert.alert('녹음 필요', '먼저 통화/음성을 녹음하세요.');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await analyzeVoice(uri);
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎙️ 음성 진단</Text>
        <Text style={styles.subtitle}>의심스러운 통화를 녹음해 보이스피싱을 판별하세요</Text>

        <View style={styles.recBox}>
          <Text style={styles.timer}>{fmt(state.durationMillis ?? 0)}</Text>
          {state.isRecording ? (
            <TouchableOpacity style={[styles.recBtn, styles.recStop]} onPress={stopRec}>
              <Text style={styles.recBtnText}>■ 녹음 중지</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.recBtn, styles.recStart]} onPress={startRec}>
              <Text style={styles.recBtnText}>● 녹음 시작</Text>
            </TouchableOpacity>
          )}
          {uri && !state.isRecording && <Text style={styles.recDone}>✓ 녹음 완료</Text>}
        </View>

        <TouchableOpacity style={styles.btn} onPress={onAnalyze} disabled={busy || !uri}>
          {busy ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnText}>분석하기</Text>}
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
  recBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  timer: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  recBtn: { borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14 },
  recStart: { backgroundColor: '#EF4444' },
  recStop: { backgroundColor: '#64748B' },
  recBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  recDone: { color: '#22C55E', fontSize: 14 },
  btn: { backgroundColor: '#FACC15', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, gap: 10, marginTop: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
  resultType: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 4 },
  detailLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  detail: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
});
