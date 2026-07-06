import { analyzeImage, type ImageAnalysisResult } from '@/api/analysis';
import { RISK } from '@/lib/risk';
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

export default function ImageScreen() {
  const [uris, setUris] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해주세요.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (!res.canceled && res.assets.length) {
      setUris(res.assets.map((a) => a.uri));
      setResult(null);
    }
  };

  const onAnalyze = async () => {
    if (!uris.length) {
      Alert.alert('이미지 필요', '먼저 분석할 이미지를 선택하세요.');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const r = await analyzeImage(uris);
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
        <Text style={styles.subtitle}>의심스러운 문자/캡처 이미지를 선택하세요 (여러 장 가능)</Text>

        <TouchableOpacity style={styles.pickBox} onPress={pickImages}>
          <Text style={styles.pickText}>+ 이미지 선택 {uris.length > 0 ? `(${uris.length}장)` : ''}</Text>
        </TouchableOpacity>

        {uris.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
            {uris.map((u, i) => (
              <Image key={i} source={{ uri: u }} style={styles.thumb} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

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
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    type: 'image',
                    riskLevel: result.riskLevel,
                    summary: `[이미지 진단 결과] 위험도 ${risk.label}\n유형: ${result.phishingType}\n${result.message}`,
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
  pickBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  pickText: { color: '#94A3B8', fontSize: 16 },
  thumbRow: { flexGrow: 0 },
  thumb: { width: 90, height: 90, borderRadius: 10, marginRight: 8, backgroundColor: '#1E293B' },
  btn: { backgroundColor: '#FACC15', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, gap: 10, marginTop: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
  resultType: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 4 },
  detailLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  detail: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  chatBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FACC15',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chatBtnText: { color: '#FACC15', fontSize: 15, fontWeight: '600' },
});
