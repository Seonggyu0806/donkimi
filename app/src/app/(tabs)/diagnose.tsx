import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;
type Styles = ReturnType<typeof createStyles>;

function DiagnoseRow({
  icon,
  label,
  desc,
  onPress,
  styles,
  colors,
}: {
  icon: IconName;
  label: string;
  desc: string;
  onPress: () => void;
  styles: Styles;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={24} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
    </TouchableOpacity>
  );
}

export default function DiagnoseTab() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>피싱 진단</Text>
        <Text style={styles.sub}>진단할 유형을 선택하세요</Text>

        <View style={styles.list}>
          <DiagnoseRow styles={styles} colors={colors} icon="link-outline" label="URL 진단" desc="의심스러운 링크의 위험도 분석" onPress={() => router.push('/url')} />
          <DiagnoseRow styles={styles} colors={colors} icon="image-outline" label="이미지 진단" desc="스미싱 문자 캡처에서 글자 추출·분석" onPress={() => router.push('/image')} />
          <DiagnoseRow styles={styles} colors={colors} icon="mic-outline" label="음성 진단" desc="통화 녹음으로 보이스피싱 판별" onPress={() => router.push('/voice')} />
          <DiagnoseRow styles={styles} colors={colors} icon="call-outline" label="전화번호 조회" desc="번호의 신고 이력·위험도 확인 및 신고" onPress={() => router.push('/phone')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 24, gap: 6 },
    title: { fontSize: 26, fontWeight: 'bold', color: c.text },
    sub: { fontSize: 14, color: c.textMuted, marginBottom: 16 },
    list: { gap: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 18,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: { color: c.text, fontSize: 16, fontWeight: 'bold' },
    rowDesc: { color: c.textMuted, fontSize: 12, marginTop: 2 },
  });
}
