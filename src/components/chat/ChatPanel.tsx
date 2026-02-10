'use client'

import { useChatStore } from '@/stores/chatStore'
import { usePlateStore } from '@/stores/plateStore'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useRef, useEffect } from 'react'
import { parseAIResponse } from '@/lib/ai/parser'
import { FlaskConical } from 'lucide-react'
import { ThinkingBlob } from './ThinkingBlob'
import { MarkdownContent } from './MarkdownContent'

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const streamingContent = useChatStore((s) => s.streamingContent)
  const addMessage = useChatStore((s) => s.addMessage)
  const setStreaming = useChatStore((s) => s.setStreaming)
  const setStreamingContent = useChatStore((s) => s.setStreamingContent)
  const provider = useChatStore((s) => s.provider)
  const apiKeys = useChatStore((s) => s.apiKeys)
  const useServerKey = useChatStore((s) => s.useServerKey)
  const applyAILayout = usePlateStore((s) => s.applyAILayout)
  const plates = usePlateStore((s) => s.plates)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async (content: string, attachments?: import('@/types/chat').FileAttachment[]) => {
    addMessage('user', content, attachments)
    setStreaming(true)
    setStreamingContent('')

    try {
      // Build message history for API, including attachment content inline
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }))
      apiMessages.push({ role: 'user', content, attachments })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          provider,
          apiKey: useServerKey ? undefined : apiKeys[provider],
          plateState: {
            plates: plates.map((p) => ({
              name: p.name,
              config: p.config,
              layers: p.layers.map((l) => ({
                name: l.name,
                values: l.values,
              })),
            })),
          },
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        addMessage('assistant', `Error: ${error}`)
        setStreaming(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        addMessage('assistant', 'Error: No response stream')
        setStreaming(false)
        return
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      // Parse operations from the response
      const { textContent, operations } = parseAIResponse(fullContent)

      // Apply operations to plate
      for (const op of operations) {
        applyAILayout(op)
      }

      // Finalize: add message and reset streaming
      setStreamingContent('')
      addMessage('assistant', textContent)
      setStreaming(false)
    } catch (err) {
      addMessage('assistant', `Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStreaming(false)
      setStreamingContent('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FlaskConical size={40} className="text-[var(--primary)] mb-3 opacity-50" />
            <h2 className="text-sm font-semibold mb-1">Describe your experiment</h2>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs">
              Tell me about your plate layout — what treatments, concentrations, controls, and replicates you need. I&apos;ll generate the plate metadata for you. I can set up multiple plates at once.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isStreaming && streamingContent && (() => {
          // Strip all plate-operation blocks (completed and in-progress) from display
          const displayText = streamingContent
            .replace(/```plate-operation[\s\S]*?($|```)/g, '')
            .trim()
          // Check if a plate-operation block is currently being generated (open but not closed)
          const completedBlocks = streamingContent.match(/```plate-operation[\s\S]*?```/g)?.length ?? 0
          const openedBlocks = streamingContent.match(/```plate-operation/g)?.length ?? 0
          const hasOpenBlock = openedBlocks > completedBlocks

          return (
            <div className="px-4 py-3 bg-[var(--muted)]">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-[var(--accent)]">
                  <ThinkingBlob size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Assistant</div>
                  {displayText && (
                    <MarkdownContent content={displayText} />
                  )}
                  {hasOpenBlock && (
                    <div className="flex items-center gap-2 mt-2 text-[var(--muted-foreground)]">
                      <ThinkingBlob size={14} />
                      <span className="text-xs italic">Generating plate layout...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {isStreaming && !streamingContent && (
          <div className="px-4 py-3 flex items-center gap-2 text-[var(--muted-foreground)]">
            <ThinkingBlob size={18} />
            <span className="text-xs">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  )
}
