import { useTheme } from '@/theme/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

/**
 * 배너를 좌우로 넘겨보는 캐러셀. 일정 간격으로 자동 전환되고, 손으로 스와이프할 수도 있다.
 * 슬라이드 폭은 컨테이너 실제 폭(onLayout)에 맞춰 잡는다.
 */
export function BannerCarousel({
  children,
  intervalMs = 3000,
  style,
}: {
  children: ReactNode[];
  intervalMs?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const count = children.length;

  // 폭이 잡히기 전(0)에는 스크롤 위치를 계산할 수 없으므로 자동 전환을 시작하지 않는다
  useEffect(() => {
    if (width === 0 || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % count;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [width, count, intervalMs]);

  return (
    <View style={style} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          if (width > 0) setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        // 모든 슬라이드가 가장 높은 슬라이드에 맞춰 늘어나도록(내용이 짧은 배너도 같은 높이)
        contentContainerStyle={{ alignItems: 'stretch' }}
      >
        {children.map((child, i) => (
          <View key={i} style={{ width }}>
            {child}
          </View>
        ))}
      </ScrollView>

      {count > 1 && (
        <View style={styles.dots}>
          {children.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.border },
    dotActive: { width: 18, backgroundColor: c.accent },
  });
}
