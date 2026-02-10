import { create } from 'zustand'
import { ChatMessage, AIProvider, FileAttachment } from '@/types/chat'
import { generateId } from '@/lib/utils'

interface ChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  provider: AIProvider
  apiKeys: {
    anthropic: string
    openai: string
  }
  useServerKey: boolean

  addMessage: (role: 'user' | 'assistant' | 'system', content: string, attachments?: FileAttachment[]) => void
  updateLastAssistantMessage: (content: string) => void
  setStreaming: (streaming: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (chunk: string) => void
  finalizeStreaming: () => void
  setProvider: (provider: AIProvider) => void
  setApiKey: (provider: AIProvider, key: string) => void
  setUseServerKey: (use: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  provider: 'anthropic',
  apiKeys: {
    anthropic: '',
    openai: '',
  },
  useServerKey: false,

  addMessage: (role, content, attachments) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
      attachments,
    }
    set({ messages: [...get().messages, message] })
  },

  updateLastAssistantMessage: (content) => {
    const messages = [...get().messages]
    const lastIdx = messages.findLastIndex(m => m.role === 'assistant')
    if (lastIdx >= 0) {
      messages[lastIdx] = { ...messages[lastIdx], content }
      set({ messages })
    }
  },

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (chunk) => set({ streamingContent: get().streamingContent + chunk }),

  finalizeStreaming: () => {
    const state = get()
    if (state.streamingContent) {
      state.addMessage('assistant', state.streamingContent)
    }
    set({ isStreaming: false, streamingContent: '' })
  },

  setProvider: (provider) => set({ provider }),
  setApiKey: (provider, key) => {
    set({ apiKeys: { ...get().apiKeys, [provider]: key } })
  },
  setUseServerKey: (use) => set({ useServerKey: use }),
  clearMessages: () => set({ messages: [], streamingContent: '' }),
}))
