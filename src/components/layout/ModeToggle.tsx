'use client'

import { useUIStore, AppMode } from '@/stores/uiStore'
import { Bot, Hand } from 'lucide-react'

export function ModeToggle() {
  const mode = useUIStore((s) => s.mode)
  const setMode = useUIStore((s) => s.setMode)

  return (
    <div className="flex items-center bg-[var(--muted)] rounded-lg p-0.5">
      <ModeButton
        active={mode === 'ai'}
        onClick={() => setMode('ai')}
        icon={<Bot size={14} />}
        label="AI-Enabled"
      />
      <ModeButton
        active={mode === 'manual'}
        onClick={() => setMode('manual')}
        icon={<Hand size={14} />}
        label="Manual"
      />
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
        active
          ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
