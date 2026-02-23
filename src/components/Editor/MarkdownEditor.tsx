import React, { useState, useRef, useCallback, useEffect } from 'react'
import { renderMarkdown } from '../../utils/markdown'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onCursorChange: (line: number, col: number) => void
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  onCursorChange,
}) => {
  const [isEditing, setIsEditing] = useState(true)
  const [renderedHtml, setRenderedHtml] = useState(() => renderMarkdown(content))
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 当外部 content 变化时（切换文件），重新渲染
  useEffect(() => {
    setRenderedHtml(renderMarkdown(content))
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [content])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setRenderedHtml(renderMarkdown(val))
      setIsEditing(false)
    }, 600)
  }, [onChange])

  const handleSelect = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const textBefore = ta.value.substring(0, ta.selectionStart)
    const lines = textBefore.split('\n')
    onCursorChange(lines.length, lines[lines.length - 1].length + 1)
  }, [onCursorChange])

  const handlePreviewClick = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [])

  const handleFocus = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsEditing(true)
  }, [])

  return (
    <div
      className="editor-container"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {/* 编辑层（textarea） */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onSelect={handleSelect}
        onFocus={handleFocus}
        className="editor-textarea"
        spellCheck={false}
        placeholder="开始写作...&#10;&#10;支持 Markdown 语法，停止输入后自动渲染预览。"
        style={{
          display: isEditing ? 'block' : 'none',
          flex: 1,
        }}
      />

      {/* 渲染层（markdown-body） */}
      {!isEditing && (
        <div
          className="markdown-body"
          onClick={handlePreviewClick}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          style={{ flex: 1, minHeight: '100%' }}
        />
      )}
    </div>
  )
}
