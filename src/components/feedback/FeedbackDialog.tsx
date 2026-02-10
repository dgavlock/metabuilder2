'use client'

import { useState } from 'react'
import { X, Bug, Lightbulb, MessageSquare, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

type FeedbackType = 'bug' | 'feature' | 'other'

const TYPES: { value: FeedbackType; label: string; icon: React.ElementType }[] = [
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb },
  { value: 'other', label: 'Other', icon: MessageSquare },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function FeedbackDialog() {
  const toggleFeedback = useUIStore((s) => s.toggleFeedback)

  const [type, setType] = useState<FeedbackType>('bug')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [issueUrl, setIssueUrl] = useState('')

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && status !== 'submitting'

  async function handleSubmit() {
    if (!canSubmit) return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), type }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
        return
      }

      setIssueUrl(data.url)
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  function handleClose() {
    toggleFeedback()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">Send Feedback</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-[var(--muted)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {status === 'success' ? (
          /* Success state */
          <div className="text-center py-6 space-y-4">
            <CheckCircle size={40} className="text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-sm">Feedback submitted!</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Thank you for helping improve MetaBuilder.
              </p>
            </div>
            {issueUrl && (
              <a
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
              >
                View on GitHub <ExternalLink size={12} />
              </a>
            )}
            <div>
              <button
                onClick={handleClose}
                className="px-4 py-1.5 rounded-lg text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="space-y-4">
            {/* Type selector */}
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-2 block">
                Type
              </label>
              <div className="flex gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon
                  const active = type === t.value
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">
                Description
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe the issue or suggestion in detail..."
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm resize-none focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Error message */}
            {status === 'error' && errorMsg && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-4 py-1.5 rounded-lg text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
