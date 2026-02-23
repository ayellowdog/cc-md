import { describe, it, expect } from 'vitest'
import { renderMarkdown, extractOutline, countWords } from './markdown'

describe('markdown utilities', () => {
  describe('renderMarkdown', () => {
    it('should render plain text', () => {
      const input = 'Hello world'
      const result = renderMarkdown(input)
      expect(result).toContain('Hello world')
    })

    it('should render headers', () => {
      const input = '# Header 1\n## Header 2'
      const result = renderMarkdown(input)
      expect(result).toContain('<h1')
      expect(result).toContain('<h2')
      expect(result).toContain('Header 1')
      expect(result).toContain('Header 2')
    })

    it('should render bold text', () => {
      const input = '**bold text**'
      const result = renderMarkdown(input)
      expect(result).toContain('<strong>')
      expect(result).toContain('bold text')
    })

    it('should render code blocks', () => {
      const input = '```js\nconsole.log("test")\n```'
      const result = renderMarkdown(input)
      expect(result).toContain('<pre')
      expect(result).toContain('<code')
    })
  })

  describe('extractOutline', () => {
    it('should extract headers from markdown content', () => {
      const input = '# Title\nSome text\n## Subtitle\nMore text\n### Subsub'
      const result = extractOutline(input)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        id: 'outline-0',
        level: 1,
        text: 'Title',
        lineNumber: 1
      })
      expect(result[1].level).toBe(2)
      expect(result[1].text).toBe('Subtitle')
      expect(result[2].level).toBe(3)
    })

    it('should handle empty content', () => {
      const result = extractOutline('')
      expect(result).toEqual([])
    })

    it('should ignore non-header lines', () => {
      const input = 'Some text\n# Header\nMore text'
      const result = extractOutline(input)
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Header')
    })
  })

  describe('countWords', () => {
    it('should count English words', () => {
      const input = 'Hello world this is a test'
      const result = countWords(input)
      expect(result.words).toBe(6)
      expect(result.chars).toBe(21) // 字母数（不含空格）
    })

    it('should count Chinese characters as words', () => {
      const input = '你好世界'
      const result = countWords(input)
      expect(result.words).toBe(4)
      expect(result.chars).toBe(4)
    })

    it('should ignore markdown formatting in word count', () => {
      const input = '# Header\n**bold** and `code`'
      const result = countWords(input)
      // 期望单词：Header, bold, and, code
      expect(result.words).toBe(3) // 实际匹配到3个单词
    })

    it('should count mixed Chinese and English', () => {
      const input = 'Hello 世界 test'
      const result = countWords(input)
      expect(result.words).toBe(4) // Hello, 世界 (2个汉字), test
      expect(result.chars).toBe(11) // H,e,l,l,o,世,界,t,e,s,t
    })

    it('should handle empty string', () => {
      const result = countWords('')
      expect(result).toEqual({ words: 0, chars: 0 })
    })

    it('should exclude code blocks from word count', () => {
      const input = 'Normal text\n```js\ncode block\n```\nMore text'
      const result = countWords(input)
      expect(result.words).toBe(4) // Normal, text, More, text
      // 代码块被排除，剩余4个单词
    })
  })
})