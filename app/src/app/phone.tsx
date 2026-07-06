import { lookupNumber, reportNumber, type NumberLookupResult } from '@/api/number';
import { addBlockedNumber, callBlockAvailable, isRoleHeld, requestRole } from '@/native/callblock';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HIGH_RISK_LEVELS = new Set(['HIGH', 'CRITICAL']);

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
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<NumberLookupResult | null>(null);

  const onLookup = async () => {
    const n = number.trim();
    if (!n) {
      Alert.alert('입력 필요', '조회할 전화번호를 입력하세요.');
      return;
    }
    setBusy(true);
    setResult(null);
    setBlocked(false);
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

  // 이 번호를 기기에서 실제로 차단 (안드로이드 네이티브 기능, dev build 전용)
  const onBlock = async () => {
    if (!callBlockAvailable) {
      Alert.alert(
        '지원하지 않는 환경',
        Platform.OS === 'android'
          ? 'Expo Go에서는 통화 차단을 쓸 수 없어요. 개발 빌드(dev build)에서만 동작합니다.'
          : '통화 차단은 안드로이드에서만 지원돼요.',
      );
      return;
    }
    setBlocking(true);
    try {
      const held = await isRoleHeld();
      if (!held) {
        const granted = await requestRole();
        if (!granted) {
          Alert.alert(
            '권한 필요',
            '전화 수신 시 차단하려면 "통화 스크리닝 앱"으로 돈킴이를 지정해야 해요. 다시 시도해주세요.',
          );
          setBlocking(false);
          return;
        }
      }
      await addBlockedNumber(number.trim());
      setBlocked(true);
      Alert.alert('차단 완료', '이제 이 번호로 걸려오는 전화는 자동으로 거절돼요. 🚫');
    } catch {
      Alert.alert('차단 실패', '번호 차단 중 문제가 발생했습니다.');
    } finally {
      setBlocking(false);
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

            {blocked ? (
              <View style={styles.blockedBadge}>
                <Text style={styles.blockedBadgeText}>🚫 차단된 번호예요</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.blockBtn,
                  HIGH_RISK_LEVELS.has(result.riskLevel) && styles.blockBtnUrgent,
                ]}
                onPress={onBlock}
                disabled={blocking}
              >
                {blocking ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <Text style={styles.blockBtnText}>
                    🚫 이 번호 전화 차단하기{HIGH_RISK_LEVELS.has(result.riskLevel) ? ' (권장)' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    type: 'phone',
                    riskLevel: result.riskLevel,
                    summary: `[전화번호 진단] ${result.number}\n위험도 ${risk.label}, 누적 신고 ${result.reportCount}회\n${result.message}`,
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
  blockBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  blockBtnUrgent: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  blockBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  blockedBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  blockedBadgeText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  chatBtn: {
    borderWidth: 1,
    borderColor: '#FACC15',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chatBtnText: { color: '#FACC15', fontSize: 15, fontWeight: '600' },
});
