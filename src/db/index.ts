import Dexie, { type Table } from 'dexie'
import type { FileNode } from '../types'
import { MOCK_FILE_TREE } from '../data/mockData'

export interface NoteRecord {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content: string
  createdAt: string
  updatedAt: string
}

class NoteDatabase extends Dexie {
  notes!: Table<NoteRecord>

  constructor() {
    super('cc-md')
    this.version(1).stores({
      notes: 'id, parentId, type, name',
    })
  }
}

export const db = new NoteDatabase()

export function buildFileTree(records: NoteRecord[]): FileNode[] {
  const childrenMap = new Map<string | null, FileNode[]>()

  for (const record of records) {
    const node: FileNode = {
      id: record.id,
      name: record.name,
      type: record.type,
      parentId: record.parentId,
      content: record.content,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
    const key = record.parentId ?? null
    if (!childrenMap.has(key)) childrenMap.set(key, [])
    childrenMap.get(key)!.push(node)
  }

  function buildChildren(parentId: string | null): FileNode[] {
    const children = childrenMap.get(parentId) ?? []
    return children
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        return a.name.localeCompare(b.name, 'zh-CN')
      })
      .map(node => ({
        ...node,
        children: node.type === 'folder' ? buildChildren(node.id) : undefined,
      }))
  }

  return buildChildren(null)
}

export function findFirstFileId(nodes: FileNode[]): string | null {
  for (const node of nodes) {
    if (node.type === 'file') return node.id
    if (node.children) {
      const found = findFirstFileId(node.children)
      if (found) return found
    }
  }
  return null
}

export async function deleteRecursive(id: string): Promise<void> {
  const children = await db.notes.where('parentId').equals(id).toArray()
  for (const child of children) {
    await deleteRecursive(child.id)
  }
  await db.notes.delete(id)
}

function flattenFileTree(nodes: FileNode[], result: NoteRecord[] = []): NoteRecord[] {
  for (const node of nodes) {
    result.push({
      id: node.id,
      name: node.name,
      type: node.type,
      parentId: node.parentId,
      content: node.content ?? '',
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    })
    if (node.children) flattenFileTree(node.children, result)
  }
  return result
}

export async function initDb(): Promise<void> {
  const count = await db.notes.count()
  if (count === 0) {
    const seedRecords = flattenFileTree(MOCK_FILE_TREE)
    await db.notes.bulkAdd(seedRecords)
  }
}
