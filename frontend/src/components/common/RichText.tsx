// AI 응답이 마크다운으로 오다 보니 별표/샵/백틱 등이 그대로 노출돼 사용자가 불편했음.
// 전체 마크다운 스펙 대신, 챗봇 답변에 실제로 나오는 문법만 가볍게 파싱해서 렌더링한다.
// (앱의 app/src/ui/RichText.tsx 와 동일한 규칙 — 표/이미지/중첩 인용 등은 미지원)
//
// 지원:
//  - 인라인: **굵게**, __굵게__, *기울임*, _기울임_, `코드`, [텍스트](URL)
//  - 블록: # 제목, - / * / • 불릿, 1. 번호목록, > 인용, --- 구분선
import type { ReactNode } from 'react'

// 굵게(**,__)를 기울임(*,_)보다 앞에 둬서 먼저 매칭되게 함.
const INLINE_RE =
  /\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*([^*\n]+)\*|_([^_\n]+)_/g

function parseInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = new RegExp(INLINE_RE)
  let last = 0
  let m: RegExpExecArray | null
  let idx = 0

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const key = `${keyBase}-i${idx++}`

    if (m[1] != null || m[2] != null) {
      nodes.push(<strong key={key} className="font-bold">{m[1] ?? m[2]}</strong>)
    } else if (m[3] != null) {
      nodes.push(
        <code key={key} className="px-1 py-0.5 mx-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[0.85em]">
          {m[3]}
        </code>,
      )
    } else if (m[4] != null) {
      nodes.push(
        <a
          key={key}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {m[4]}
        </a>,
      )
    } else if (m[6] != null || m[7] != null) {
      nodes.push(<em key={key} className="italic">{m[6] ?? m[7]}</em>)
    }
    last = re.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export default function RichText({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <>
      {lines.map((line, i) => {
        const key = `l${i}`

        // 구분선: ---, ***, ___ (3개 이상)
        if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
          return <hr key={key} className="my-2 border-slate-200" />
        }

        // 제목: # ~ ######
        const heading = line.match(/^\s*(#{1,6})\s+(.*)$/)
        if (heading) {
          return (
            <div key={key} className="font-bold text-base mt-1">
              {parseInline(heading[2], key)}
            </div>
          )
        }

        // 인용: > 텍스트
        const quote = line.match(/^\s*>\s?(.*)$/)
        if (quote) {
          return (
            <div key={key} className="border-l-2 border-slate-300 pl-2 text-slate-500">
              {parseInline(quote[1], key)}
            </div>
          )
        }

        // 불릿: -, *, •
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/)
        if (bullet) {
          return (
            <div key={key} className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{parseInline(bullet[1], key)}</span>
            </div>
          )
        }

        // 번호목록: 1. 텍스트
        const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/)
        if (numbered) {
          return (
            <div key={key} className="flex gap-2">
              <span className="shrink-0">{numbered[1]}.</span>
              <span>{parseInline(numbered[2], key)}</span>
            </div>
          )
        }

        // 빈 줄은 간격만
        if (line.trim() === '') return <div key={key} className="h-2" />

        // 일반 문단
        return <div key={key}>{parseInline(line, key)}</div>
      })}
    </>
  )
}
