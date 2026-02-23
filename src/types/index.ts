export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  content?: string
  createdAt: string
  updatedAt: string
  parentId: string | null
}

export interface OutlineItem {
  id: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  lineNumber: number
}

export type Theme = 'light' | 'dark'
export type SidebarTab = 'files' | 'search' | 'outline'
export type SaveStatus = 'saved' | 'saving' | 'unsaved'

export type FormatAction =
  | 'bold' | 'italic' | 'strikethrough' | 'inlineCode'
  | 'h1' | 'h2' | 'h3'
  | 'blockquote' | 'ul' | 'ol' | 'taskList'
  | 'table' | 'link' | 'image' | 'hr'
  | 'undo' | 'redo'
