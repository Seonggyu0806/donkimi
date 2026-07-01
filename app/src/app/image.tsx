import { analyzeImage, type ImageAnalysisResult } from '@/api/analysis';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function ImageScreen() {
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해주세요.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const onAnalyze = async () => {
    if (!uri) {
      Alert.alert('이미지 필요', '먼저 분석할 이미지를 선택하세요.');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await analyzeImage(uri);
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

        <Text style={styles.title}>🖼️ 이미지 진단</Text>
        <Text style={styles.subtitle}>의심스러운 문자/캡처 이미지를 분석하세요</Text>

        <TouchableOpacity style={styles.pickBox} onPress={pickImage}>
          {uri ? (
            <Image source={{ uri }} style={styles.preview} resizeMode="contain" />
          ) : (
            <Text style={styles.pickText}>+ 이미지 선택</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={onAnalyze} disabled={busy}>
          {busy ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.btnText}>분석하기</Text>}
        </TouchableOpacity>

        {result && risk && (
          <View style={styles.resultCard}>
            <View style={[styles.badge, { backgroundColor: risk.color }]}>
              <Text style={styles.badgeText}>{risk.label}</Text>
            </View>
            <Text style={styles.resultType}>유형: {result.phishingType}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>추출된 텍스트</Text>
            <Text style={styles.detail}>{result.extractedText}</Text>
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
  pickBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  pickText: { color: '#64748B', fontSize: 16 },
  preview: { width: '100%', height: '100%' },
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
