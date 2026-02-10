'use client'

import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { X } from 'lucide-react'
import { AIProvider } from '@/types/chat'

export function SettingsDialog() {
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const provider = useChatStore((s) => s.provider)
  const apiKeys = useChatStore((s) => s.apiKeys)
  const useServerKey = useChatStore((s) => s.useServerKey)
  const setProvider = useChatStore((s) => s.setProvider)
  const setApiKey = useChatStore((s) => s.setApiKey)
  const setUseServerKey = useChatStore((s) => s.setUseServerKey)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={toggleSettings}>
      <div
        className="bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={toggleSettings} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">AI Provider</label>
            <div className="flex gap-2">
              {(['anthropic', 'openai'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    provider === p
                      ? 'border-[var(--primary)] bg-[var(--accent)] text-[var(--primary)]'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {p === 'anthropic' ? 'Claude (Anthropic)' : 'GPT (OpenAI)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useServerKey}
                onChange={(e) => setUseServerKey(e.target.checked)}
                className="rounded"
              />
              <span>Use server-side API key</span>
            </label>

            {!useServerKey && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] block mb-1">
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKey('anthropic', e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] block mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKey('openai', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
