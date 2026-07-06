import { analyzeImage, type ImageAnalysisResult } from '@/api/analysis';
import { RISK, RISK_TEXT } from '@/lib/risk';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useAlert } from '@/ui/AlertProvider';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImageScreen() {
  const { colors } = useTheme();
  const showAlert = useAlert();
  const styles = createStyles(colors);
  const [uris, setUris] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert('권한 필요', '사진 접근 권한을 허용해주세요.', undefined, { variant: 'warning' });
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
      showAlert('이미지 필요', '먼저 분석할 이미지를 선택하세요.', undefined, { variant: 'warning' });
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
          {busy ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.btnText}>분석하기</Text>}
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
    thumbRow: { flexGrow: 0 },
    thumb: { width: 90, height: 90, borderRadius: 10, marginRight: 8, backgroundColor: c.surface },
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
