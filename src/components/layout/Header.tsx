'use client'

import { useUIStore } from '@/stores/uiStore'
import { usePlateStore } from '@/stores/plateStore'
import { Download, Settings, Undo2, Redo2, FlaskConical, HelpCircle, MessageSquare } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import Link from 'next/link'

export function Header() {
  const toggleExportDialog = useUIStore((s) => s.toggleExportDialog)
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const toggleFeedback = useUIStore((s) => s.toggleFeedback)
  const undo = usePlateStore((s) => s.undo)
  const redo = usePlateStore((s) => s.redo)

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] bg-[var(--background)] flex-shrink-0">
      <div className="flex items-center gap-3">
        <FlaskConical size={20} className="text-[var(--primary)]" />
        <h1 className="text-sm font-semibold">MetaBuilder</h1>
      </div>

      <div className="flex items-center gap-1">
        <ModeToggle />

        <div className="w-px h-6 bg-[var(--border)] mx-2" />

        <button
          onClick={undo}
          className="p-2 rounded hover:bg-[var(--muted)] transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          className="p-2 rounded hover:bg-[var(--muted)] transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-6 bg-[var(--border)] mx-2" />

        <button
          onClick={toggleExportDialog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          <Download size={14} />
          Export
        </button>
        <button
          onClick={toggleSettings}
          className="p-2 rounded hover:bg-[var(--muted)] transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={toggleFeedback}
          className="p-2 rounded hover:bg-[var(--muted)] transition-colors"
          title="Send Feedback"
        >
          <MessageSquare size={16} />
        </button>
        <Link
          href="/help"
          target="_blank"
          className="p-2 rounded hover:bg-[var(--muted)] transition-colors"
          title="Help"
        >
          <HelpCircle size={16} />
        </Link>
      </div>
    </header>
  )
}
