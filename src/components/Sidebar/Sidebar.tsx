import React, { useRef, useCallback } from 'react'
import { Files, Search, AlignLeft } from 'lucide-react'
import { FileTree } from './FileTree'
import { SearchPanel } from './SearchPanel'
import { OutlinePanel } from './OutlinePanel'
import type { FileNode, OutlineItem, SidebarTab } from '../../types'

interface SidebarProps {
  width: number
  isCollapsed: boolean
  activeTab: SidebarTab
  fileTree: FileNode[]
  activeFileId: string | null
  outlineItems: OutlineItem[]
  onTabChange: (tab: SidebarTab) => void
  onFileSelect: (id: string) => void
  onWidthChange: (width: number) => void
  onNewFile: (parentId: string | null) => void
  onNewFolder: (parentId: string | null) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string, name: string) => void
}

const TAB_CONFIG: { key: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { key: 'files', icon: <Files size={15} />, label: '文件' },
  { key: 'search', icon: <Search size={15} />, label: '搜索' },
  { key: 'outline', icon: <AlignLeft size={15} />, label: '大纲' },
]

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  isCollapsed,
  activeTab,
  fileTree,
  activeFileId,
  outlineItems,
  onTabChange,
  onFileSelect,
  onWidthChange,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}) => {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = width
    e.preventDefault()

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current) return
      const delta = ev.clientX - startX.current
      const newWidth = Math.min(400, Math.max(160, startWidth.current + delta))
      onWidthChange(newWidth)
    }

    function onMouseUp() {
      isDragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width, onWidthChange])

  if (isCollapsed) return null

  return (
    <div
      style={{
        width,
        minWidth: width,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        position: 'relative',
        flexShrink: 0,
        transition: 'width 0.1s ease',
        overflow: 'hidden',
      }}
    >
      {/* Tab 切换栏 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.key}
            className={`sidebar-tab${activeTab === tab.key ? ' active' : ''}`}
            title={tab.label}
            aria-label={tab.label}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* 面板内容 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'files' && (
          <FileTree
            nodes={fileTree}
            activeFileId={activeFileId}
            onFileSelect={onFileSelect}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
        {activeTab === 'search' && <SearchPanel />}
        {activeTab === 'outline' && <OutlinePanel items={outlineItems} />}
      </div>

      {/* 拖拽调整宽度手柄 */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 4,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
        }}
        title="拖拽调整宽度"
      />
    </div>
  )
}
