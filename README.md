# MetaBuilder

A web application for designing multi-well plate experiment layouts and generating metadata files. Describe your experiment to the AI assistant or build layouts manually with the interactive plate editor, then export in the format your pipeline needs.

## Features

- **AI-assisted layout generation** -- Describe your experiment in natural language and the AI builds a complete plate layout with metadata layers. Supports both Claude (Anthropic) and GPT (OpenAI).
- **Interactive plate editor** -- Click, drag, or use row/column headers to select wells. Assign values with quick-assign buttons or type custom entries.
- **Multi-plate workspace** -- Work with multiple plates in tabs. Duplicate, rename, and view all plates at once in the overview gallery.
- **Metadata layers** -- Create layers for treatment, concentration, replicate ID, or any variable. Each layer is color-coded automatically.
- **Merge layers** -- Combine two or more layers into a single concatenated layer with customizable separator and order.
- **Sequence fill** -- Auto-number selected wells with patterns like Sample01, Sample02... in row-wise, column-wise, or snaking order.
- **File attachments** -- Upload CSVs, images, or other files alongside your chat message so the AI can incorporate your data into the layout.
- **Export to 6 formats** -- JSON, CSV, XML, Excel (.xlsx), PowerPoint (.pptx), and PNG. Multi-plate exports can be consolidated or zipped.
- **In-app feedback** -- Submit bug reports and feature requests directly from the app (creates GitHub issues).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| State | Zustand |
| AI Providers | Anthropic SDK, OpenAI SDK |
| Export | ExcelJS, PptxGenJS, html-to-image, JSZip |

## Getting Started

### Prerequisites

- Node.js 18+
- An API key from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/)

### Installation

```bash
git clone https://github.com/dgavlock/metabuilder2.git
cd metabuilder2
npm install
```

### Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

```env
# AI keys (optional -- users can also enter their own in the Settings panel)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# GitHub token for the in-app feedback button (optional)
GITHUB_TOKEN=ghp_...
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Deployment

MetaBuilder is configured for **Vercel** out of the box:

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. Deploy

## Project Structure

```
src/
  app/
    api/
      chat/          # AI chat streaming endpoint
      feedback/      # GitHub issue creation endpoint
    help/            # Static help/documentation page
  components/
    chat/            # Chat panel, input, messages, markdown renderer
    export/          # Export dialog
    feedback/        # Feedback dialog
    help/            # Help page content
    layers/          # Layer panel, editor, merge dialog, sequence fill
    layout/          # App shell, header, settings, mode toggle
    plate/           # Plate grid, editor, toolbar, thumbnails, overview
  lib/
    ai/              # AI prompt templates and response parser
    export/          # Export format generators (CSV, JSON, XML, XLSX, PPTX, PNG)
    plate/           # Plate types, color scales, well addressing
  stores/            # Zustand stores (plate, selection, chat, UI)
  types/             # TypeScript type definitions
```

## License

ISC
