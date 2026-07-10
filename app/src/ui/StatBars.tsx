import { StyleSheet, Text, View } from 'react-native';

export interface StatBar {
  label: string;
  value: number;
}

/**
 * 배너 안에 들어가는 간단한 가로 막대 그래프.
 * 배너 배경이 accent(파란색)라 색은 흰색 계열로 고정한다.
 */
export function StatBars({ data }: { data: StatBar[] }) {
  // 0으로 나누는 것을 막고, 전부 0이어도 막대가 사라지지 않게 최소 1로 둔다
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={styles.wrap}>
      {data.map((d) => (
        <View key={d.label} style={styles.row}>
          <Text style={styles.label}>{d.label}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(d.value / max) * 100}%` }]} />
          </View>
          <Text style={styles.value}>{d.value.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 58, color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  value: { minWidth: 34, textAlign: 'right', color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
