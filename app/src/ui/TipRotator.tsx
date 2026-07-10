import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, type ViewStyle } from 'react-native';

/**
 * 알아두면 좋은 안내를 하나씩 번갈아 보여주는 작은 툴팁 영역.
 * 문구가 바뀔 때 살짝 페이드되도록 해서 갑자기 튀지 않게 한다.
 */
export function TipRotator({
  tips,
  intervalMs = 4000,
  style,
}: {
  tips: string[];
  intervalMs?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (tips.length <= 1) return;

    const timer = setInterval(() => {
      // 사라진 뒤에 문구를 바꾸고 다시 나타나게 한다
      Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setIndex((prev) => (prev + 1) % tips.length);
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [tips.length, intervalMs, fade]);

  if (tips.length === 0) return null;

  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name="bulb-outline" size={14} color={colors.textFaint} />
      <Animated.Text style={[styles.text, { opacity: fade }]} numberOfLines={2}>
        {tips[index]}
      </Animated.Text>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 4, minHeight: 36 },
    text: { flex: 1, color: c.textFaint, fontSize: 12, lineHeight: 17 },
  });
}
