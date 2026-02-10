'use client'

import { useUIStore } from '@/stores/uiStore'
import { Header } from './Header'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { PlateEditor } from '@/components/plate/PlateEditor'
import { ExportDialog } from '@/components/export/ExportDialog'
import { SettingsDialog } from '@/components/layout/SettingsDialog'
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog'
import { useRef, useCallback, useState } from 'react'

export function AppShell() {
  const mode = useUIStore((s) => s.mode)
  const chatPanelWidth = useUIStore((s) => s.chatPanelWidth)
  const setChatPanelWidth = useUIStore((s) => s.setChatPanelWidth)
  const showExportDialog = useUIStore((s) => s.showExportDialog)
  const showSettings = useUIStore((s) => s.showSettings)
  const showFeedback = useUIStore((s) => s.showFeedback)

  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const newWidth = Math.max(280, Math.min(e.clientX - rect.left, 700))
        setChatPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [setChatPanelWidth])

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {mode === 'ai' && (
          <>
            <div style={{ width: chatPanelWidth, minWidth: 280 }} className="flex-shrink-0 border-r border-[var(--border)]">
              <ChatPanel />
            </div>
            <div
              onMouseDown={handleMouseDown}
              className={`w-1.5 cursor-col-resize flex-shrink-0 hover:bg-[var(--primary)] transition-colors ${isResizing ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
            />
          </>
        )}
        <div className="flex-1 overflow-hidden">
          <PlateEditor />
        </div>
      </div>
      {showExportDialog && <ExportDialog />}
      {showSettings && <SettingsDialog />}
      {showFeedback && <FeedbackDialog />}
    </div>
  )
}
