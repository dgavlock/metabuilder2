'use client'

import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
}

export function MarkdownContent({ content }: Props) {
  return (
    <div className="text-sm break-words leading-relaxed markdown-content">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
          code: ({ children, className }) => {
            // Inline code (no language class)
            if (!className) {
              return (
                <code className="px-1 py-0.5 rounded bg-[var(--accent)] text-[var(--primary)] text-xs font-mono">
                  {children}
                </code>
              )
            }
            // Block code
            return (
              <code className={className}>{children}</code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-[var(--accent)] rounded-md p-2 mb-2 last:mb-0 overflow-x-auto text-xs font-mono">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] underline hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--primary)] pl-3 my-2 text-[var(--muted-foreground)] italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-[var(--border)] my-2" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2 last:mb-0">
              <table className="text-xs border-collapse w-full">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--border)] px-2 py-1 bg-[var(--accent)] text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--border)] px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
