import React from 'react'
import { MarkdownEditor } from './MarkdownEditor'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onCursorChange: (line: number, col: number) => void
}

export const Editor: React.FC<EditorProps> = ({ content, onChange, onCursorChange }) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--color-bg-primary)',
      }}
    >
      <MarkdownEditor
        content={content}
        onChange={onChange}
        onCursorChange={onCursorChange}
      />
    </div>
  )
}
