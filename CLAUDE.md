# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Type-check + production build
npm run test         # Run all tests (Vitest)
npm run test:watch   # Watch mode
npm run test:ui      # Browser UI for tests
npm run test:coverage # Coverage report

# Run a single test file
npx vitest run src/utils/markdown.test.ts
```

## Architecture

**CC-MD** is a browser-based Markdown editor with Typora-like UX. No backend — all data lives in IndexedDB.

### State Flow

All state is centralized in `src/App.tsx`. There is no external state manager. Key patterns:

- `activeFileIdRef` and `contentRef` are React refs that shadow their `useState` counterparts — this prevents stale closures inside `setTimeout` callbacks (auto-save debounce).
- `handleFileSelect` flushes any pending auto-save timer before loading a new file, ensuring no content is lost on rapid file switches.
- `refreshFileTree()` re-reads all DB records and rebuilds the in-memory tree; call it after any create/rename/delete operation.

### Data Layer (`src/db/index.ts`)

Storage is **flat**: each note/folder is a `NoteRecord` row with a `parentId`. The nested `FileNode[]` tree used by the UI is rebuilt in-memory by `buildFileTree()` on every refresh.

- Dexie DB name: `cc-md`, table: `notes`, index: `id, parentId, type, name`
- `initDb()` seeds from `src/data/mockData.ts` only when the DB is empty (first launch)
- `deleteRecursive(id)` must be used for folder deletion — it walks children via `where('parentId').equals(id)` before deleting the parent

### Theme System

Theme is stored in `localStorage` under key `cc-md-theme`. `src/main.tsx` reads it **before** React mounts and sets `data-theme` on `<html>` to prevent flash-of-unstyled-content (FOUC). CSS variables for both themes live in `src/index.css`.

### Editor

`MarkdownEditor.tsx` uses a textarea/preview toggle: textarea is shown while editing; after 500 ms of inactivity it renders via `marked.parse()` and shows a `div.markdown-body`. Clicking the preview div returns to edit mode. The editor is a plain `<textarea>` — CodeMirror integration is planned but not yet implemented.

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | All state + file management handlers |
| `src/db/index.ts` | Dexie DB, `buildFileTree`, `initDb`, `deleteRecursive` |
| `src/types/index.ts` | Shared types: `FileNode`, `NoteRecord`, `FormatAction`, etc. |
| `src/utils/markdown.ts` | `renderMarkdown`, `extractOutline`, `countWords` |
| `src/utils/theme.ts` | `setTheme`, `getInitialTheme` |
| `src/data/mockData.ts` | Seed data — still imported by `db/index.ts`, do not delete |

### Testing

Tests use Vitest + React Testing Library. Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom`, runs cleanup after each test). Vitest globals are enabled — no need to import `describe`/`it`/`expect` in test files.

Two tests in `MarkdownEditor.test.tsx` are marked `.skip` because fake-timer + debounce interaction requires further investigation.
