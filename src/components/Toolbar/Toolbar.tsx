import React, { useState, useRef, useEffect } from 'react'
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  Quote, List, ListOrdered, ListTodo,
  Table, Link, Image, Minus,
  Undo2, Redo2,
  Sun, Moon, Download, FileText, Globe, Printer,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import type { Theme, FormatAction } from '../../types'

interface ToolbarProps {
  theme: Theme
  isSidebarCollapsed: boolean
  onThemeToggle: () => void
  onFormatAction: (action: FormatAction) => void
  onExport: (format: 'md' | 'html' | 'pdf') => void
  onToggleSidebar: () => void
}

interface BtnProps {
  icon: React.ReactNode
  title: string
  onClick: () => void
  label?: string
}

function ToolbarBtn({ icon, title, onClick, label }: BtnProps) {
  return (
    <button
      className="toolbar-btn"
      title={title}
      aria-label={title}
      onClick={onClick}
      style={label ? { width: 'auto', padding: '0 6px', gap: '3px', fontSize: '12px', fontWeight: 600 } : {}}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}

function Separator() {
  return <div className="toolbar-separator" />
}

export const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  isSidebarCollapsed,
  onThemeToggle,
  onFormatAction,
  onExport,
  onToggleSidebar,
}) => {
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      style={{
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: '2px',
        background: 'var(--color-bg-toolbar)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* 侧边栏折叠 */}
      <ToolbarBtn
        icon={isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        title={isSidebarCollapsed ? '展开侧边栏 (Ctrl+Shift+L)' : '折叠侧边栏 (Ctrl+Shift+L)'}
        onClick={onToggleSidebar}
      />

      <Separator />

      {/* 撤销 / 重做 */}
      <ToolbarBtn icon={<Undo2 size={16} />} title="撤销 (Ctrl+Z)" onClick={() => onFormatAction('undo')} />
      <ToolbarBtn icon={<Redo2 size={16} />} title="重做 (Ctrl+Y)" onClick={() => onFormatAction('redo')} />

      <Separator />

      {/* 标题 */}
      <ToolbarBtn icon={<Heading1 size={16} />} title="一级标题 (Ctrl+1)" onClick={() => onFormatAction('h1')} label="H1" />
      <ToolbarBtn icon={<Heading2 size={16} />} title="二级标题 (Ctrl+2)" onClick={() => onFormatAction('h2')} label="H2" />
      <ToolbarBtn icon={<Heading3 size={16} />} title="三级标题 (Ctrl+3)" onClick={() => onFormatAction('h3')} label="H3" />

      <Separator />

      {/* 内联格式 */}
      <ToolbarBtn icon={<Bold size={16} />} title="粗体 (Ctrl+B)" onClick={() => onFormatAction('bold')} />
      <ToolbarBtn icon={<Italic size={16} />} title="斜体 (Ctrl+I)" onClick={() => onFormatAction('italic')} />
      <ToolbarBtn icon={<Strikethrough size={16} />} title="删除线 (Alt+Shift+5)" onClick={() => onFormatAction('strikethrough')} />
      <ToolbarBtn icon={<Code size={16} />} title="行内代码 (Ctrl+`)" onClick={() => onFormatAction('inlineCode')} />

      <Separator />

      {/* 块级元素 */}
      <ToolbarBtn icon={<Quote size={16} />} title="引用块 (Ctrl+Shift+Q)" onClick={() => onFormatAction('blockquote')} />
      <ToolbarBtn icon={<List size={16} />} title="无序列表 (Ctrl+Shift+])" onClick={() => onFormatAction('ul')} />
      <ToolbarBtn icon={<ListOrdered size={16} />} title="有序列表 (Ctrl+Shift+[)" onClick={() => onFormatAction('ol')} />
      <ToolbarBtn icon={<ListTodo size={16} />} title="任务列表 (Ctrl+Shift+X)" onClick={() => onFormatAction('taskList')} />

      <Separator />

      {/* 插入 */}
      <ToolbarBtn icon={<Table size={16} />} title="插入表格" onClick={() => onFormatAction('table')} />
      <ToolbarBtn icon={<Link size={16} />} title="插入链接 (Ctrl+K)" onClick={() => onFormatAction('link')} />
      <ToolbarBtn icon={<Image size={16} />} title="插入图片 (Ctrl+Shift+I)" onClick={() => onFormatAction('image')} />
      <ToolbarBtn icon={<Minus size={16} />} title="分隔线" onClick={() => onFormatAction('hr')} />

      {/* 弹性空白 */}
      <div style={{ flex: 1 }} />

      {/* 主题切换 */}
      <ToolbarBtn
        icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
        onClick={onThemeToggle}
      />

      {/* 导出下拉 */}
      <div ref={exportRef} style={{ position: 'relative' }}>
        <button
          className="toolbar-btn"
          title="导出文档"
          aria-label="导出文档"
          onClick={() => setExportOpen(v => !v)}
          style={{
            width: 'auto',
            padding: '0 8px',
            gap: '4px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Download size={15} />
          <span>导出</span>
        </button>

        {exportOpen && (
          <div className="export-dropdown">
            <button
              className="export-dropdown-item"
              onClick={() => { onExport('md'); setExportOpen(false) }}
            >
              <FileText size={14} />
              导出为 Markdown
            </button>
            <button
              className="export-dropdown-item"
              onClick={() => { onExport('html'); setExportOpen(false) }}
            >
              <Globe size={14} />
              导出为 HTML
            </button>
            <button
              className="export-dropdown-item"
              onClick={() => { onExport('pdf'); setExportOpen(false) }}
            >
              <Printer size={14} />
              打印 / 导出 PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
