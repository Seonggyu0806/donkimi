import { lookupNumber, reportNumber, type NumberLookupResult } from '@/api/number';
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

const RISK: Record<string, { color: string; label: string }> = {
  SAFE: { color: '#22C55E', label: '안전' },
  LOW: { color: '#84CC16', label: '낮음' },
  MEDIUM: { color: '#FACC15', label: '중간' },
  HIGH: { color: '#F97316', label: '주의' },
  CRITICAL: { color: '#EF4444', label: '위험' },
};

export default function PhoneScreen() {
  const [number, setNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [result, setResult] = useState<NumberLookupResult | null>(null);

  const onLookup = async () => {
    const n = number.trim();
    if (!n) {
      Alert.alert('입력 필요', '조회할 전화번호를 입력하세요.');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await lookupNumber(n);
      setResult(r);
    } catch (e) {
      const msg = axios.isAxiosError(e) ? (e.response?.data?.message ?? '조회 실패') : '조회 실패';
      Alert.alert('조회 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  const onReport = async () => {
    const n = number.trim();
    setReporting(true);
    try {
      const r = await reportNumber(n);
      Alert.alert(
        r.alreadyReported ? '이미 신고함' : '신고 완료',
        `${r.message}\n누적 신고 ${r.reportCount}회`,
      );
      // 신고 후 다시 조회해 최신 상태 반영
      const updated = await lookupNumber(n);
      setResult(updated);
    } catch (e) {
      const msg = axios.isAxiosError(e) ? (e.response?.data?.message ?? '신고 실패') : '신고 실패';
      Alert.alert('신고 실패', msg);
    } finally {
      setReporting(false);
    }
  };

  const risk = result ? (RISK[result.riskLevel] ?? RISK.MEDIUM) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📞 전화번호 조회</Text>
        <Text style={styles.subtitle}>의심스러운 번호의 신고 이력을 확인하세요</Text>

        <TextInput
          style={styles.input}
          placeholder="010-1234-5678"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={number}
          onChangeText={setNumber}
        />
        <TouchableOpacity style={styles.btn} onPress={onLookup} disabled={busy}>
          {busy ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnText}>조회하기</Text>}
        </TouchableOpacity>

        {result && risk && (
          <View style={styles.resultCard}>
            {result.hasData ? (
              <>
                <View style={[styles.badge, { backgroundColor: risk.color }]}>
                  <Text style={styles.badgeText}>{risk.label}</Text>
                </View>
                <Text style={styles.resultType}>유형: {result.phishingType || '기타'}</Text>
                <Text style={styles.resultCount}>누적 신고 {result.reportCount}회</Text>
                <Text style={styles.resultMsg}>{result.message}</Text>
              </>
            ) : (
              <>
                <Text style={styles.noData}>신고 이력이 없는 번호예요.</Text>
                <Text style={styles.resultMsg}>의심스러운 번호라면 신고해 다른 사람을 보호하세요.</Text>
              </>
            )}

            <TouchableOpacity style={styles.reportBtn} onPress={onReport} disabled={reporting}>
              {reporting ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <Text style={styles.reportText}>🚨 이 번호 신고하기</Text>
              )}
            </TouchableOpacity>
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
  resultCount: { color: '#FACC15', fontSize: 14, fontWeight: '600' },
  resultMsg: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  noData: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  reportBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  reportText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
