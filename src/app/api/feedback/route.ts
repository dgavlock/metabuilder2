import { NextRequest, NextResponse } from 'next/server'

const REPO = 'dgavlock/metabuilder2'

const TYPE_META: Record<string, { prefix: string; label: string }> = {
  bug: { prefix: '[Bug]', label: 'bug' },
  feature: { prefix: '[Feature]', label: 'enhancement' },
  other: { prefix: '[Feedback]', label: 'feedback' },
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Feedback is not configured. GITHUB_TOKEN is missing.' },
        { status: 500 },
      )
    }

    const { title, body, type } = (await request.json()) as {
      title?: string
      body?: string
      type?: string
    }

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required.' },
        { status: 400 },
      )
    }

    const meta = TYPE_META[type ?? 'other'] ?? TYPE_META.other

    const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `${meta.prefix} ${title.trim()}`,
        body: body.trim(),
        labels: [meta.label],
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('GitHub API error:', res.status, errorBody)
      return NextResponse.json(
        { error: 'Failed to create issue. Please try again later.' },
        { status: 502 },
      )
    }

    const issue = (await res.json()) as { html_url: string; number: number }

    return NextResponse.json({
      success: true,
      url: issue.html_url,
      number: issue.number,
    })
  } catch (err) {
    console.error('Feedback route error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
