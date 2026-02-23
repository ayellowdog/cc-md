import { marked } from 'marked'
import type { OutlineItem } from '../types'

marked.use({
  breaks: true,
  gfm: true,
})

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string
}

export function extractOutline(content: string): OutlineItem[] {
  const lines = content.split('\n')
  const items: OutlineItem[] = []
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)/)
    if (match) {
      items.push({
        id: `outline-${index}`,
        level: match[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: match[2].trim(),
        lineNumber: index + 1,
      })
    }
  })
  return items
}

export function countWords(content: string): { words: number; chars: number } {
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_~>\[\]()]/g, '')
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const english = (text.match(/\b[a-zA-Z]+\b/g) ?? []).length
  const chars = content.replace(/\s/g, '').length
  return { words: chinese + english, chars }
}
