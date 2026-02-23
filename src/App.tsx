import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Toolbar } from './components/Toolbar/Toolbar'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Editor } from './components/Editor/Editor'
import { StatusBar } from './components/StatusBar/StatusBar'
import { setTheme, getInitialTheme } from './utils/theme'
import { extractOutline, countWords } from './utils/markdown'
import { db, buildFileTree, findFirstFileId, deleteRecursive, initDb } from './db'
import type { Theme, SidebarTab, SaveStatus, FormatAction, FileNode } from './types'

function findFileName(nodes: FileNode[], id: string | null): string | null {
  if (!id) return null
  for (const node of nodes) {
    if (node.id === id) return node.name
    if (node.children) {
      const found = findFileName(node.children, id)
      if (found) return found
    }
  }
  return null
}

const nowISO = () => new Date().toISOString()

export default function App() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('files')
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const [isLoading, setIsLoading] = useState(true)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeFileIdRef = useRef<string | null>(null)
  const contentRef = useRef<string>('')
  activeFileIdRef.current = activeFileId
  contentRef.current = content

  const { words, chars } = useMemo(() => countWords(content), [content])
  const outlineItems = useMemo(() => extractOutline(content), [content])
  const activeFileName = useMemo(() => findFileName(fileTree, activeFileId), [fileTree, activeFileId])

  const refreshFileTree = useCallback(async () => {
    const records = await db.notes.toArray()
    const tree = buildFileTree(records)
    setFileTree(tree)
    return tree
  }, [])

  useEffect(() => {
    initDb().then(async () => {
      const tree = await refreshFileTree()
      const firstFileId = findFirstFileId(tree)
      if (firstFileId) {
        const note = await db.notes.get(firstFileId)
        setActiveFileId(firstFileId)
        setContent(note?.content ?? '')
      }
      setIsLoading(false)
    })
  }, [refreshFileTree])

  const handleThemeToggle = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setThemeState(next)
    setTheme(next)
  }, [theme])

  const handleFileSelect = useCallback(async (fileId: string) => {
    // Flush any pending save before switching files
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
      const currentId = activeFileIdRef.current
      if (currentId) {
        await db.notes.update(currentId, { content: contentRef.current, updatedAt: nowISO() })
      }
    }
    const note = await db.notes.get(fileId)
    if (!note || note.type === 'folder') return
    setActiveFileId(fileId)
    setContent(note.content)
    setSaveStatus('saved')
  }, [])

  const handleContentChange = useCallback((val: string) => {
    setContent(val)
    setSaveStatus('unsaved')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      const id = activeFileIdRef.current
      if (id) {
        await db.notes.update(id, { content: val, updatedAt: nowISO() })
        setSaveStatus('saved')
      }
    }, 2000)
  }, [])

  const handleFormatAction = useCallback((_action: FormatAction) => {
    // 格式化操作将在后续实现 CodeMirror 时接入
  }, [])

  const handleExport = useCallback((format: 'md' | 'html' | 'pdf') => {
    const name = (activeFileName ?? 'note').replace(/\.md$/, '')
    if (format === 'md') {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.md`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'html') {
      const html = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="UTF-8"><title>${name}</title></head>\n<body>\n${content}\n</body>\n</html>`
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.html`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      window.print()
    }
  }, [content, activeFileName])

  const handleNewFile = useCallback(async (parentId: string | null) => {
    const name = window.prompt('笔记名称：', '新建笔记')
    if (!name?.trim()) return
    const finalName = name.trim().endsWith('.md') ? name.trim() : `${name.trim()}.md`
    const id = crypto.randomUUID()
    await db.notes.add({
      id,
      name: finalName,
      type: 'file',
      parentId,
      content: '',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    })
    await refreshFileTree()
    await handleFileSelect(id)
  }, [refreshFileTree, handleFileSelect])

  const handleNewFolder = useCallback(async (parentId: string | null) => {
    const name = window.prompt('文件夹名称：', '新建文件夹')
    if (!name?.trim()) return
    const id = crypto.randomUUID()
    await db.notes.add({
      id,
      name: name.trim(),
      type: 'folder',
      parentId,
      content: '',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    })
    await refreshFileTree()
  }, [refreshFileTree])

  const handleRename = useCallback(async (nodeId: string, currentName: string) => {
    const name = window.prompt('重命名为：', currentName)
    if (!name?.trim() || name.trim() === currentName) return
    await db.notes.update(nodeId, { name: name.trim(), updatedAt: nowISO() })
    await refreshFileTree()
  }, [refreshFileTree])

  const handleDelete = useCallback(async (nodeId: string, nodeName: string) => {
    if (!window.confirm(`确认删除「${nodeName.replace(/\.md$/, '')}」？此操作不可撤销。`)) return
    await deleteRecursive(nodeId)
    const tree = await refreshFileTree()
    const currentId = activeFileIdRef.current
    if (currentId) {
      const stillExists = await db.notes.get(currentId)
      if (!stillExists) {
        const firstFileId = findFirstFileId(tree)
        if (firstFileId) {
          await handleFileSelect(firstFileId)
        } else {
          setActiveFileId(null)
          setContent('')
        }
      }
    }
  }, [refreshFileTree, handleFileSelect])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-muted)',
        fontSize: '14px',
      }}>
        加载中...
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* 顶部工具栏 */}
      <Toolbar
        theme={theme}
        isSidebarCollapsed={isSidebarCollapsed}
        onThemeToggle={handleThemeToggle}
        onFormatAction={handleFormatAction}
        onExport={handleExport}
        onToggleSidebar={() => setIsSidebarCollapsed(v => !v)}
      />

      {/* 主体区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          width={sidebarWidth}
          isCollapsed={isSidebarCollapsed}
          activeTab={sidebarTab}
          fileTree={fileTree}
          activeFileId={activeFileId}
          outlineItems={outlineItems}
          onTabChange={setSidebarTab}
          onFileSelect={handleFileSelect}
          onWidthChange={setSidebarWidth}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onRename={handleRename}
          onDelete={handleDelete}
        />
        <Editor
          content={content}
          onChange={handleContentChange}
          onCursorChange={(line, col) => setCursorPos({ line, col })}
        />
      </div>

      {/* 状态栏 */}
      <StatusBar
        wordCount={words}
        charCount={chars}
        line={cursorPos.line}
        col={cursorPos.col}
        saveStatus={saveStatus}
        activeFileName={activeFileName}
      />
    </div>
  )
}
