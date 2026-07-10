import { RISK, RISK_ORDER } from '@/lib/risk';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

/**
 * 진단 결과가 어떤 5단계로 표시되는지 미리 보여주는 계기판 범례.
 * 홈·진단 화면에서 공용으로 쓰며, 색과 라벨은 lib/risk.ts 단일 출처를 따른다.
 * (측정값을 나타내는 게 아니라 눈금 설명이므로 바늘은 그리지 않는다)
 */

const CX = 110;
const CY = 104;
const R = 74; // 호의 반지름 (중심선 기준)
const STROKE = 16;
const LABEL_R = R + 17; // 라벨은 호 바깥쪽에 배치
const GAP_DEG = 2.5; // 세그먼트 사이 간격
const SPAN = 180 / RISK_ORDER.length; // 세그먼트당 각도 = 36°

// 각도(왼쪽 180° → 오른쪽 0°)를 화면 좌표로. y축이 아래로 향하므로 sin을 뺀다.
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
}

// 왼쪽(a1)에서 오른쪽(a2)으로 위쪽을 지나는 호. sweep=1이 화면 기준 시계방향(=위로).
function arc(a1: number, a2: number) {
  const s = polar(a1, R);
  const e = polar(a2, R);
  return `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`;
}

export function RiskGauge({
  title,
  caption,
  style,
}: {
  title?: string;
  caption?: string;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.gaugeWrap}>
        <Svg width="100%" height={132} viewBox="0 0 220 132">
          {RISK_ORDER.map((level, i) => {
            const start = 180 - i * SPAN - GAP_DEG / 2;
            const end = 180 - (i + 1) * SPAN + GAP_DEG / 2;
            const mid = polar(180 - (i + 0.5) * SPAN, LABEL_R);
            return (
              <G key={level}>
                <Path
                  d={arc(start, end)}
                  stroke={RISK[level].color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  fill="none"
                />
                <SvgText
                  x={mid.x}
                  y={mid.y + 4}
                  fontSize={11}
                  fontWeight="bold"
                  fill={RISK[level].color}
                  textAnchor="middle"
                >
                  {RISK[level].label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 16, gap: 8 },
    title: { color: c.text, fontSize: 14, fontWeight: 'bold' },
    gaugeWrap: { alignItems: 'center' },
    caption: { color: c.textMuted, fontSize: 12, lineHeight: 17 },
  });
}
