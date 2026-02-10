export type AIProvider = 'anthropic' | 'openai'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  name: string
  type: string
  size: number
  content?: string // extracted text content
  dataUrl?: string // for images
}

export interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  provider: AIProvider
  apiKeys: {
    anthropic: string
    openai: string
  }
  useServerKey: boolean
}
