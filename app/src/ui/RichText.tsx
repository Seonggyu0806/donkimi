import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';

// AI 응답에 섞여 나오는 마크다운 굵게(**text**) 표시만 최소 파싱해서 렌더링한다.
// (전체 마크다운 렌더러를 쓰기엔 과함 — 챗봇 답변에 실제로 나오는 건 굵게 표시뿐)
export function RichText({ children, style }: { children: string; style?: TextStyle | TextStyle[] }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);

  const nodes: ReactNode[] = parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    if (!match) return part;
    return (
      <Text key={i} style={{ fontWeight: 'bold' }}>
        {match[1]}
      </Text>
    );
  });

  return <Text style={style}>{nodes}</Text>;
}
