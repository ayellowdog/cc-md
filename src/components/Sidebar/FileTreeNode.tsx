import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronRight, ChevronDown,
  Folder, FolderOpen, FileText, MoreHorizontal,
} from 'lucide-react'
import type { FileNode } from '../../types'

interface FileTreeNodeProps {
  node: FileNode
  depth: number
  activeFileId: string | null
  expandedFolders: Set<string>
  onFileSelect: (id: string) => void
  onToggleFolder: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string, name: string) => void
  onNewFile: (parentId: string | null) => void
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '5px 10px',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  activeFileId,
  expandedFolders,
  onFileSelect,
  onToggleFolder,
  onRename,
  onDelete,
  onNewFile,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isExpanded = expandedFolders.has(node.id)
  const isActive = node.id === activeFileId
  const isFolder = node.type === 'folder'

  const handleClick = () => {
    if (isFolder) onToggleFolder(node.id)
    else onFileSelect(node.id)
  }

  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const displayName = isFolder ? node.name : node.name.replace(/\.md$/, '')

  return (
    <>
      <div
        className="file-tree-node"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={displayName}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          paddingLeft: `${8 + depth * 14}px`,
          cursor: 'pointer',
          borderRadius: '4px',
          margin: '1px 4px',
          background: isActive ? 'var(--color-bg-active)' : 'transparent',
          color: isActive ? 'var(--color-text-accent)' : 'var(--color-text-secondary)',
          fontSize: '13px',
          userSelect: 'none',
          transition: 'background 0.1s, color 0.1s',
          position: 'relative',
        }}
      >
        {/* 展开/折叠箭头 */}
        <span style={{ width: 14, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {isFolder ? (
            isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
          ) : null}
        </span>

        {/* 图标 */}
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: isFolder ? '#e8a44a' : undefined }}>
          {isFolder
            ? (isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />)
            : <FileText size={14} />
          }
        </span>

        {/* 名称 */}
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {displayName}
        </span>

        {/* 悬停操作按钮 */}
        {(isHovered || showMenu) && (
          <span
            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '1px 3px',
              borderRadius: '3px',
              color: 'var(--color-text-muted)',
              position: 'relative',
            }}
          >
            <MoreHorizontal size={13} />

            {/* 下拉菜单 */}
            {showMenu && (
              <div
                ref={menuRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 200,
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                  padding: '4px',
                  minWidth: '120px',
                }}
              >
                {isFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onNewFile(node.id)
                    }}
                    style={menuItemStyle}
                  >
                    新建笔记
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onRename(node.id, node.name)
                  }}
                  style={menuItemStyle}
                >
                  重命名
                </button>
                <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '3px 6px' }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete(node.id, node.name)
                  }}
                  style={{ ...menuItemStyle, color: '#ef4444' }}
                >
                  删除
                </button>
              </div>
            )}
          </span>
        )}
      </div>

      {/* 子节点 */}
      {isFolder && isExpanded && node.children?.map(child => (
        <FileTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activeFileId={activeFileId}
          expandedFolders={expandedFolders}
          onFileSelect={onFileSelect}
          onToggleFolder={onToggleFolder}
          onRename={onRename}
          onDelete={onDelete}
          onNewFile={onNewFile}
        />
      ))}
    </>
  )
}
