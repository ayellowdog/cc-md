import React from 'react'
import { CheckCircle2, Loader2, Circle } from 'lucide-react'
import type { SaveStatus } from '../../types'

interface StatusBarProps {
  wordCount: number
  charCount: number
  line: number
  col: number
  saveStatus: SaveStatus
  activeFileName: string | null
}

export const StatusBar: React.FC<StatusBarProps> = ({
  wordCount,
  charCount,
  line,
  col,
  saveStatus,
  activeFileName,
}) => {
  const saveConfig = {
    saved: { icon: <CheckCircle2 size={11} />, text: '已保存', color: 'var(--color-text-muted)' },
    saving: { icon: <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />, text: '保存中...', color: 'var(--color-text-muted)' },
    unsaved: { icon: <Circle size={11} />, text: '未保存', color: '#f59e0b' },
  }[saveStatus]

  return (
    <div
      style={{
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '12px',
        background: 'var(--color-bg-statusbar)',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        userSelect: 'none',
        flexShrink: 0,
        gap: '8px',
      }}
    >
      {/* 左侧：保存状态 + 文件名 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: saveConfig.color, flexShrink: 0 }}>
          {saveConfig.icon}
          <span>{saveConfig.text}</span>
        </span>

        {activeFileName && (
          <>
            <span style={{ color: 'var(--color-border)', flexShrink: 0 }}>|</span>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--color-text-muted)',
            }}>
              {activeFileName}
            </span>
          </>
        )}
      </div>

      {/* 右侧：统计信息 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <span>字数：{wordCount.toLocaleString()}</span>
        <span>字符：{charCount.toLocaleString()}</span>
        <span>行 {line}，列 {col}</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
