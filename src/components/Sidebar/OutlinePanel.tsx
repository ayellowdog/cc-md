import React from 'react'
import { Hash } from 'lucide-react'
import type { OutlineItem } from '../../types'

interface OutlinePanelProps {
  items: OutlineItem[]
}

export const OutlinePanel: React.FC<OutlinePanelProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 12px',
        color: 'var(--color-text-muted)',
        fontSize: '12px',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        暂无大纲<br />
        使用 # ## ### 创建标题
      </div>
    )
  }

  const FONT_SIZES = { 1: 13, 2: 13, 3: 12, 4: 12, 5: 12, 6: 12 }
  const FONT_WEIGHTS = { 1: 600, 2: 500, 3: 400, 4: 400, 5: 400, 6: 400 }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
      <div style={{
        padding: '4px 8px 6px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--color-border-subtle)',
        marginBottom: '4px',
      }}>
        大纲
      </div>
      {items.map(item => (
        <div
          key={item.id}
          className="outline-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            paddingLeft: `${8 + (item.level - 1) * 10}px`,
            cursor: 'pointer',
            fontSize: FONT_SIZES[item.level],
            color: item.level === 1
              ? 'var(--color-text-primary)'
              : item.level === 2
              ? 'var(--color-text-secondary)'
              : 'var(--color-text-muted)',
            fontWeight: FONT_WEIGHTS[item.level],
          }}
        >
          <Hash size={9} style={{ flexShrink: 0, opacity: 0.4 }} />
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  )
}
