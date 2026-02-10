import { AIPlateOperation } from '@/types/plate'

interface ParseResult {
  textContent: string
  operations: AIPlateOperation[]
}

export function parseAIResponse(response: string): ParseResult {
  const operations: AIPlateOperation[] = []
  let textContent = response

  // Extract all ```plate-operation ... ``` blocks
  const regex = /```plate-operation\s*([\s\S]*?)```/g
  let match

  while ((match = regex.exec(response)) !== null) {
    try {
      const jsonStr = match[1].trim()
      const parsed = JSON.parse(jsonStr) as AIPlateOperation
      if (parsed && parsed.action) {
        operations.push(parsed)
      }
    } catch (e) {
      console.warn('Failed to parse plate operation:', e)
    }
    // Remove the block from text content
    textContent = textContent.replace(match[0], '')
  }

  // Clean up extra whitespace from removed blocks
  textContent = textContent.replace(/\n{3,}/g, '\n\n').trim()

  return { textContent, operations }
}
