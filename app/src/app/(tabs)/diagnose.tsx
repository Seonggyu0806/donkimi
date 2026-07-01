import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;

function DiagnoseRow({ icon, label, desc, onPress }: { icon: IconName; label: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={24} color="#FACC15" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </TouchableOpacity>
  );
}

export default function DiagnoseTab() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>피싱 진단</Text>
        <Text style={styles.sub}>진단할 유형을 선택하세요</Text>

        <View style={styles.list}>
          <DiagnoseRow icon="link-outline" label="URL 진단" desc="의심스러운 링크의 위험도 분석" onPress={() => router.push('/url')} />
          <DiagnoseRow icon="image-outline" label="이미지 진단" desc="스미싱 문자 캡처에서 글자 추출·분석" onPress={() => router.push('/image')} />
          <DiagnoseRow icon="mic-outline" label="음성 진단" desc="통화 녹음으로 보이스피싱 판별" onPress={() => router.push('/voice')} />
          <DiagnoseRow icon="call-outline" label="전화번호 조회" desc="번호의 신고 이력·위험도 확인 및 신고" onPress={() => router.push('/phone')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 24, gap: 6 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  sub: { fontSize: 14, color: '#94A3B8', marginBottom: 16 },
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  rowDesc: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
});
