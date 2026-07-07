import { useTheme } from '@/theme/ThemeContext';
import type { ReactNode } from 'react';
import { Linking, Platform, Text, type TextStyle } from 'react-native';

// AI 응답이 마크다운으로 오다 보니 별표/샵/백틱 등이 그대로 노출돼 사용자가 불편했음.
// 전체 마크다운 스펙 대신, 챗봇 답변에 실제로 나오는 문법만 가볍게 파싱해서 렌더링한다.
// (표/이미지/중첩 인용 등은 AI가 쓰지 않으므로 처리하지 않음)
//
// 지원:
//  - 인라인: **굵게**, __굵게__, *기울임*, _기울임_, `코드`, [텍스트](URL)
//  - 블록: # 제목, - / * / • 불릿, 1. 번호목록, > 인용, --- 구분선

const CODE_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// 인라인 문법을 한 번에 스캔. 굵게(**,__)를 기울임(*,_)보다 앞에 둬서 먼저 매칭되게 함.
const INLINE_RE =
  /\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*([^*\n]+)\*|_([^_\n]+)_/g;

interface InlineColors {
  code: string;
  codeBg: string;
  link: string;
}

function parseInline(text: string, keyBase: string, c: InlineColors): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(INLINE_RE); // lastIndex를 0으로 초기화한 새 인스턴스
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyBase}-i${idx++}`;

    if (m[1] != null || m[2] != null) {
      nodes.push(
        <Text key={key} style={{ fontWeight: 'bold' }}>
          {m[1] ?? m[2]}
        </Text>,
      );
    } else if (m[3] != null) {
      nodes.push(
        <Text key={key} style={{ fontFamily: CODE_FONT, color: c.code, backgroundColor: c.codeBg }}>
          {' '}
          {m[3]}{' '}
        </Text>,
      );
    } else if (m[4] != null) {
      const url = m[5];
      nodes.push(
        <Text key={key} style={{ color: c.link }} onPress={() => Linking.openURL(url).catch(() => {})}>
          {m[4]}
        </Text>,
      );
    } else if (m[6] != null || m[7] != null) {
      nodes.push(
        <Text key={key} style={{ fontStyle: 'italic' }}>
          {m[6] ?? m[7]}
        </Text>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ children, style }: { children: string; style?: TextStyle | TextStyle[] }) {
  const { colors } = useTheme();
  const inlineColors: InlineColors = { code: colors.text, codeBg: colors.border, link: colors.accent };

  const lines = children.split('\n');
  const rendered: ReactNode[] = [];

  lines.forEach((line, i) => {
    if (i > 0) rendered.push('\n');
    const key = `l${i}`;

    // 구분선: ---, ***, ___ (3개 이상)
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      rendered.push(
        <Text key={key} style={{ color: colors.textFaint }}>
          ────────────
        </Text>,
      );
      return;
    }

    // 제목: # ~ ###### → 굵게 + 살짝 큰 글씨
    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (heading) {
      rendered.push(
        <Text key={key} style={{ fontWeight: 'bold', fontSize: 17 }}>
          {parseInline(heading[2], key, inlineColors)}
        </Text>,
      );
      return;
    }

    // 인용: > 텍스트
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      rendered.push(
        <Text key={key} style={{ color: colors.textMuted }}>
          ▏ {parseInline(quote[1], key, inlineColors)}
        </Text>,
      );
      return;
    }

    // 불릿: -, *, • → 가운뎃점으로 통일
    const bullet = line.match(/^(\s*)[-*•]\s+(.*)$/);
    if (bullet) {
      rendered.push(
        <Text key={key}>
          {bullet[1]}
          {'•  '}
          {parseInline(bullet[2], key, inlineColors)}
        </Text>,
      );
      return;
    }

    // 번호목록: 1. 텍스트 (번호는 그대로 유지)
    const numbered = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numbered) {
      rendered.push(
        <Text key={key}>
          {numbered[1]}
          {numbered[2]}. {parseInline(numbered[3], key, inlineColors)}
        </Text>,
      );
      return;
    }

    // 일반 문단
    rendered.push(...parseInline(line, key, inlineColors));
  });

  return <Text style={style}>{rendered}</Text>;
}
