'use client'

import { ChatMessage as ChatMessageType } from '@/types/chat'
import { User, Bot, FileText, Image as ImageIcon } from 'lucide-react'
import { MarkdownContent } from './MarkdownContent'

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  // Strip plate-operation blocks from display
  const displayContent = message.content
    .replace(/```plate-operation[\s\S]*?```/g, '')
    .trim()

  return (
    <div className={`px-4 py-3 ${isUser ? '' : 'bg-[var(--muted)]'}`}>
      <div className="flex items-start gap-2">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          isUser ? 'bg-[var(--primary)]' : 'bg-[var(--accent)]'
        }`}>
          {isUser ? (
            <User size={12} className="text-[var(--primary-foreground)]" />
          ) : (
            <Bot size={12} className="text-[var(--primary)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">
            {isUser ? 'You' : 'Assistant'}
          </div>
          {isUser ? (
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {displayContent}
            </div>
          ) : (
            <MarkdownContent content={displayContent} />
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {message.attachments.map((a, i) => {
                const isImage = a.type.startsWith('image/')
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[var(--accent)] text-[var(--muted-foreground)]"
                  >
                    {isImage ? (
                      <ImageIcon size={10} className="text-[var(--primary)]" />
                    ) : (
                      <FileText size={10} className="text-[var(--primary)]" />
                    )}
                    {a.name}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
