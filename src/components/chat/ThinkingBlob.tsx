'use client'

/**
 * Animated morphing blob that appears next to "Thinking..." text
 * when the AI assistant is generating a response.
 */
export function ThinkingBlob({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="thinking-blob"
    >
      <defs>
        <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path fill="url(#blob-gradient)">
        <animate
          attributeName="d"
          dur="3s"
          repeatCount="indefinite"
          values="
            M20,5 C28,5 35,12 35,20 C35,28 28,35 20,35 C12,35 5,28 5,20 C5,12 12,5 20,5 Z;
            M20,3 C30,6 37,14 34,22 C31,30 24,37 16,34 C8,31 3,24 6,16 C9,8 14,3 20,3 Z;
            M22,4 C31,7 36,16 33,24 C30,32 22,36 14,33 C6,30 3,22 7,14 C11,6 16,3 22,4 Z;
            M20,3 C27,3 35,10 36,18 C37,26 30,35 22,36 C14,37 5,30 4,22 C3,14 10,3 20,3 Z;
            M20,5 C28,5 35,12 35,20 C35,28 28,35 20,35 C12,35 5,28 5,20 C5,12 12,5 20,5 Z
          "
        />
      </path>
      {/* Inner pulsing dot */}
      <circle cx="20" cy="20" r="4" fill="var(--primary)" opacity="0.6">
        <animate
          attributeName="r"
          dur="1.5s"
          repeatCount="indefinite"
          values="3;5;3"
          keyTimes="0;0.5;1"
        />
        <animate
          attributeName="opacity"
          dur="1.5s"
          repeatCount="indefinite"
          values="0.6;0.9;0.6"
          keyTimes="0;0.5;1"
        />
      </circle>
    </svg>
  )
}
