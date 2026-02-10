import { NextRequest, NextResponse } from 'next/server'
import { getSystemPrompt } from '@/lib/ai/prompts'

interface FileAttachment {
  name: string
  type: string
  size: number
  content?: string
  dataUrl?: string
}

interface IncomingMessage {
  role: string
  content: string
  attachments?: FileAttachment[]
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

/**
 * Build Anthropic-format content blocks from a message + attachments.
 * Text files are inlined as text blocks; images become image blocks.
 */
function buildAnthropicContent(msg: IncomingMessage): string | Array<Record<string, unknown>> {
  const attachments = msg.attachments?.filter((a) => a.content || a.dataUrl) ?? []
  if (attachments.length === 0) {
    return msg.content
  }

  const blocks: Array<Record<string, unknown>> = []

  // Add file content blocks first so the AI sees the data before the user's question
  for (const att of attachments) {
    if (att.dataUrl && IMAGE_TYPES.includes(att.type)) {
      // Image attachment → Anthropic vision block
      const base64Match = att.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
      if (base64Match) {
        blocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: base64Match[1],
            data: base64Match[2],
          },
        })
      }
    } else if (att.content) {
      // Text file → inline as a text block with filename header
      blocks.push({
        type: 'text',
        text: `--- File: ${att.name} ---\n${att.content}\n--- End of ${att.name} ---`,
      })
    }
  }

  // Add the user's text message
  if (msg.content) {
    blocks.push({ type: 'text', text: msg.content })
  }

  return blocks
}

/**
 * Build OpenAI-format content blocks from a message + attachments.
 * Text files are inlined; images become image_url blocks.
 */
function buildOpenAIContent(msg: IncomingMessage): string | Array<Record<string, unknown>> {
  const attachments = msg.attachments?.filter((a) => a.content || a.dataUrl) ?? []
  if (attachments.length === 0) {
    return msg.content
  }

  const blocks: Array<Record<string, unknown>> = []

  for (const att of attachments) {
    if (att.dataUrl && IMAGE_TYPES.includes(att.type)) {
      blocks.push({
        type: 'image_url',
        image_url: { url: att.dataUrl, detail: 'auto' },
      })
    } else if (att.content) {
      blocks.push({
        type: 'text',
        text: `--- File: ${att.name} ---\n${att.content}\n--- End of ${att.name} ---`,
      })
    }
  }

  if (msg.content) {
    blocks.push({ type: 'text', text: msg.content })
  }

  return blocks
}

export async function POST(request: NextRequest) {
  try {
    const { messages, provider, apiKey, plateState } = await request.json()

    const systemPrompt = getSystemPrompt(plateState)

    if (provider === 'anthropic') {
      return handleAnthropic(messages, systemPrompt, apiKey)
    } else if (provider === 'openai') {
      return handleOpenAI(messages, systemPrompt, apiKey)
    }

    return new NextResponse('Invalid provider', { status: 400 })
  } catch (err) {
    return new NextResponse(
      err instanceof Error ? err.message : 'Internal error',
      { status: 500 }
    )
  }
}

async function handleAnthropic(
  messages: IncomingMessage[],
  systemPrompt: string,
  apiKey?: string
) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) {
    return new NextResponse('No Anthropic API key configured', { status: 401 })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: buildAnthropicContent(m),
      })),
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return new NextResponse(`Anthropic API error: ${error}`, { status: response.status })
  }

  // Stream the response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(encoder.encode(parsed.delta.text))
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

async function handleOpenAI(
  messages: IncomingMessage[],
  systemPrompt: string,
  apiKey?: string
) {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) {
    return new NextResponse('No OpenAI API key configured', { status: 401 })
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: buildOpenAIContent(m),
        })),
      ],
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return new NextResponse(`OpenAI API error: ${error}`, { status: response.status })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            } catch {
              // skip
            }
          }
        }
      }

      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
