import React, { useState } from 'react'
import { Search } from 'lucide-react'

export const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 8px',
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        marginBottom: '8px',
      }}>
        <Search size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="搜索笔记..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
          }}
        />
      </div>

      {query ? (
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '20px' }}>
          暂无匹配结果
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
          输入关键词搜索<br />所有笔记的标题和内容
        </div>
      )}
    </div>
  )
}
