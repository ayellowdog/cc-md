import React, { useState } from 'react'
import { FileTreeNode } from './FileTreeNode'
import { FilePlus, FolderPlus } from 'lucide-react'
import type { FileNode } from '../../types'

interface FileTreeProps {
  nodes: FileNode[]
  activeFileId: string | null
  onFileSelect: (id: string) => void
  onNewFile: (parentId: string | null) => void
  onNewFolder: (parentId: string | null) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string, name: string) => void
}

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  activeFileId,
  onFileSelect,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['folder-work', 'folder-personal'])
  )

  const handleToggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* 文件树操作栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px 4px',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          文件
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            className="toolbar-btn"
            title="新建笔记 (Ctrl+N)"
            style={{ width: 22, height: 22 }}
            onClick={() => onNewFile(null)}
          >
            <FilePlus size={13} />
          </button>
          <button
            className="toolbar-btn"
            title="新建文件夹"
            style={{ width: 22, height: 22 }}
            onClick={() => onNewFolder(null)}
          >
            <FolderPlus size={13} />
          </button>
        </div>
      </div>

      {/* 文件节点列表 */}
      <div style={{ padding: '4px 0' }}>
        {nodes.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '12px',
            lineHeight: 1.6,
          }}>
            <div style={{ marginBottom: 8 }}>暂无笔记</div>
            <div>点击上方 <strong>+</strong> 新建笔记</div>
          </div>
        ) : (
          nodes.map(node => (
            <FileTreeNode
              key={node.id}
              node={node}
              depth={0}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onToggleFolder={handleToggleFolder}
              onRename={onRename}
              onDelete={onDelete}
              onNewFile={onNewFile}
            />
          ))
        )}
      </div>
    </div>
  )
}
