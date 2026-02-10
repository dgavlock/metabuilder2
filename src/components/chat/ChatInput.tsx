'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { FileAttachment } from '@/types/chat'

interface Props {
  onSend: (content: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || disabled || isProcessing) return
    onSend(text.trim(), attachments.length > 0 ? attachments : undefined)
    setText('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsProcessing(true)
    const newAttachments: FileAttachment[] = []

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds 10 MB limit.`)
        continue
      }

      try {
        const isImage = IMAGE_TYPES.includes(file.type)

        if (isImage) {
          const dataUrl = await readFileAsDataUrl(file)
          newAttachments.push({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl,
          })
        } else {
          // Read as text for everything else (CSV, TSV, JSON, XML, TXT, etc.)
          const content = await readFileAsText(file)
          newAttachments.push({
            name: file.name,
            type: file.type,
            size: file.size,
            content,
          })
        }
      } catch {
        alert(`Could not read file "${file.name}".`)
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments])
    setIsProcessing(false)

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-[var(--border)] p-3">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((att, i) => {
            const isImage = IMAGE_TYPES.includes(att.type)
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] text-[11px] max-w-[200px]"
              >
                {isImage ? (
                  <ImageIcon size={12} className="flex-shrink-0 text-[var(--primary)]" />
                ) : (
                  <FileText size={12} className="flex-shrink-0 text-[var(--primary)]" />
                )}
                <span className="truncate text-[var(--foreground)]">{att.name}</span>
                <span className="text-[var(--muted-foreground)] flex-shrink-0">
                  {formatFileSize(att.size)}
                </span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="p-0.5 rounded hover:bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--destructive)] flex-shrink-0"
                >
                  <X size={10} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".csv,.tsv,.txt,.json,.xml,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.md,.yaml,.yml"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className="p-2 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] flex-shrink-0 disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={attachments.length > 0 ? 'Add a message about these files...' : 'Describe your experiment...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={(!text.trim() && attachments.length === 0) || disabled || isProcessing}
          className="p-2 rounded bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-50 flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
