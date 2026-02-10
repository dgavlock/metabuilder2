'use client'

import Link from 'next/link'
import {
  FlaskConical,
  ArrowLeft,
  Bot,
  Hand,
  MousePointerClick,
  Layers,
  Download,
  Lightbulb,
  MessageSquare,
  Grid3X3,
  Settings,
  Keyboard,
  Zap,
  Paperclip,
  Merge,
  Hash,
} from 'lucide-react'

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
          <Icon size={16} className="text-[var(--primary)]" />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--foreground)]/90">
        {children}
      </div>
    </section>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/15">
      <Lightbulb size={14} className="text-[var(--primary)] flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] text-[11px] font-mono">
      {children}
    </kbd>
  )
}

function ExamplePrompt({ children }: { children: string }) {
  return (
    <div className="px-3 py-2 rounded-md bg-[var(--muted)] border border-[var(--border)] text-sm italic text-[var(--muted-foreground)]">
      &ldquo;{children}&rdquo;
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'ai-mode', label: 'AI Mode' },
  { id: 'attachments', label: 'File Attachments' },
  { id: 'prompting', label: 'Prompting Tips' },
  { id: 'manual-mode', label: 'Manual Mode' },
  { id: 'plates', label: 'Plates' },
  { id: 'layers', label: 'Layers' },
  { id: 'merge-layers', label: 'Merging Layers' },
  { id: 'sequence-fill', label: 'Sequence Fill' },
  { id: 'selection', label: 'Well Selection' },
  { id: 'exporting', label: 'Exporting' },
  { id: 'settings', label: 'Settings' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts' },
]

export function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to app</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-[var(--primary)]" />
          <span className="text-sm font-semibold">MetaBuilder Help</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar nav */}
        <nav className="hidden lg:block w-48 flex-shrink-0 sticky top-20 self-start">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block px-2 py-1 text-xs rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-12">
          {/* Hero */}
          <div className="text-center pb-6 border-b border-[var(--border)]">
            <FlaskConical size={36} className="text-[var(--primary)] mx-auto mb-3" />
            <h1 className="text-2xl font-bold mb-2">MetaBuilder Guide</h1>
            <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
              Everything you need to know to design experiment plate layouts, generate metadata, and export your work.
            </p>
          </div>

          {/* Getting Started */}
          <Section id="getting-started" icon={Zap} title="Getting Started">
            <p>
              MetaBuilder helps you create metadata files for multi-well plate experiments.
              Describe your experiment to the AI assistant, or build layouts manually using
              the interactive plate editor.
            </p>
            <p>The typical workflow is:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>Describe your experiment</strong> in the chat panel (AI mode) or select
                your plate type manually.
              </li>
              <li>
                <strong>Review the generated layout</strong> on the interactive plate grid.
                Wells are color-coded by metadata layer.
              </li>
              <li>
                <strong>Refine as needed</strong> &mdash; select wells and reassign values,
                add layers, or ask the AI to make changes.
              </li>
              <li>
                <strong>Export</strong> your metadata in any of 6 formats (JSON, CSV, XML,
                Excel, PowerPoint, or PNG).
              </li>
            </ol>
            <Tip>
              You can switch between AI and Manual modes at any time without losing your work.
            </Tip>
          </Section>

          {/* AI Mode */}
          <Section id="ai-mode" icon={Bot} title="AI-Enabled Mode">
            <p>
              In AI mode, the chat panel appears on the left. Type a description of your
              experiment and the assistant will generate a complete plate layout with metadata
              layers for you. You can then follow up with refinements.
            </p>
            <p>The AI can:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Set up any standard plate type (6 to 1536 wells)</li>
              <li>Create multiple metadata layers (treatment, concentration, replicate ID, etc.)</li>
              <li>Assign wells in common patterns &mdash; serial dilutions, replicates, controls</li>
              <li>Work with multiple plates at once</li>
              <li>Modify an existing layout based on follow-up instructions</li>
            </ul>
            <p>
              While the AI generates your layout, you&apos;ll see a
              &ldquo;Generating plate layout&hellip;&rdquo; indicator. Once complete, the plate
              view updates automatically.
            </p>
          </Section>

          {/* File Attachments */}
          <Section id="attachments" icon={Paperclip} title="File Attachments">
            <p>
              You can attach files to your chat messages to give the AI context it can
              use when building plate layouts. Click the <strong>paperclip</strong> icon
              next to the chat input to open the file picker.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Supported file types</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Text &amp; data files</strong> &mdash; CSV, TSV, TXT, JSON, XML, YAML,
                Markdown. The full file content is sent to the AI as text.
              </li>
              <li>
                <strong>Images</strong> &mdash; PNG, JPG, GIF, WEBP. The image is sent directly
                to the AI&apos;s vision capability so it can interpret screenshots, diagrams, or
                photos of handwritten layouts.
              </li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Example use cases</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Upload a CSV of 60 compounds with LD50 values and say &ldquo;Create a dose-response
                assay using these drugs.&rdquo;
              </li>
              <li>
                Attach a photo of a hand-drawn plate map and ask the AI to replicate it.
              </li>
              <li>
                Attach a JSON export from a previous experiment to use as a starting template.
              </li>
            </ul>

            <Tip>
              You can attach multiple files at once. Each file can be up to 10 MB.
              Attached files appear as badges above the chat input and can be removed
              individually before sending.
            </Tip>
          </Section>

          {/* Prompting Tips */}
          <Section id="prompting" icon={MessageSquare} title="How to Write Great Prompts">
            <p>
              The more detail you provide up front, the better the result. Here are the key
              things to include:
            </p>

            <h3 className="font-semibold mt-4 mb-2">1. State your plate format</h3>
            <p>
              If you don&apos;t specify, the AI defaults to a 96-well plate. Mention it
              explicitly if you need something different.
            </p>
            <ExamplePrompt>
              Set up a 384-well plate for my drug screening assay.
            </ExamplePrompt>

            <h3 className="font-semibold mt-4 mb-2">2. List your treatments and conditions</h3>
            <p>Name every condition, drug, compound, or variable you want on the plate.</p>
            <ExamplePrompt>
              I have three compounds: Aspirin, Ibuprofen, and Acetaminophen. Each at 1 uM,
              10 uM, and 100 uM concentrations.
            </ExamplePrompt>

            <h3 className="font-semibold mt-4 mb-2">3. Specify controls</h3>
            <p>
              Tell the AI where you want positive and negative controls, or let it choose
              sensible defaults.
            </p>
            <ExamplePrompt>
              Include a DMSO vehicle control and an untreated control in the first column.
            </ExamplePrompt>

            <h3 className="font-semibold mt-4 mb-2">4. Mention replicate count</h3>
            <p>
              The AI defaults to triplicates. Specify if you need a different number.
            </p>
            <ExamplePrompt>
              I need quadruplicate replicates for each condition.
            </ExamplePrompt>

            <h3 className="font-semibold mt-4 mb-2">5. Describe the layout pattern</h3>
            <p>
              If you have a preference for how conditions are arranged (e.g., by row, by
              column, dose-response across columns), say so.
            </p>
            <ExamplePrompt>
              Arrange treatments in rows with concentrations increasing across columns left to right, serial 1:10 dilutions.
            </ExamplePrompt>

            <h3 className="font-semibold mt-4 mb-2">6. Request multiple plates</h3>
            <p>
              You can ask for multiple plates in a single prompt. Name them for clarity.
            </p>
            <ExamplePrompt>
              Create two plates: &ldquo;Plate A - Treatment&rdquo; and &ldquo;Plate B -
              Vehicle Control&rdquo;. Both 96-well with the same layout but Plate B has only DMSO.
            </ExamplePrompt>

            <Tip>
              <strong>Follow up naturally.</strong> After the first layout is generated, you
              can say things like &ldquo;Move the controls to column 12&rdquo; or
              &ldquo;Add a layer for cell line and assign HEK293 to the top half and HeLa to
              the bottom half.&rdquo;
            </Tip>

            <h3 className="font-semibold mt-4 mb-2">7. Attach supporting files</h3>
            <p>
              If you have a spreadsheet of compounds, a list of sample IDs, or any reference
              data, attach the file along with your message. The AI will read the contents and
              incorporate them into the layout.
            </p>
            <ExamplePrompt>
              Here&apos;s a CSV of our compound library. Set up a 384-well plate with each
              compound at 3 concentrations in duplicate.
            </ExamplePrompt>

            <h3 className="font-semibold mt-4 mb-2">Example: Full prompt</h3>
            <ExamplePrompt>
              Set up a 96-well plate for a dose-response cytotoxicity assay. I&apos;m testing
              Doxorubicin and Cisplatin at 8 concentrations (0.01, 0.1, 0.5, 1, 5, 10, 50,
              100 uM) in triplicate. Include untreated and DMSO controls in columns 1 and 2.
              Create layers for Treatment, Concentration, and Replicate.
            </ExamplePrompt>
          </Section>

          {/* Manual Mode */}
          <Section id="manual-mode" icon={Hand} title="Manual Mode">
            <p>
              Switch to Manual mode using the toggle in the header. The chat panel hides and
              you get the full screen for the plate editor.
            </p>
            <p>In Manual mode you:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Choose your plate type from the toolbar dropdown.</li>
              <li>Add metadata layers in the right panel (e.g., &ldquo;Treatment&rdquo;).</li>
              <li>Select wells on the plate grid by clicking or dragging.</li>
              <li>Assign values to selected wells using the layer editor that appears.</li>
            </ol>
            <Tip>
              Manual mode is perfect for quick edits to AI-generated layouts. Switch back and
              forth freely &mdash; your work is preserved.
            </Tip>
          </Section>

          {/* Plates */}
          <Section id="plates" icon={Grid3X3} title="Plate Management">
            <p>
              MetaBuilder supports standard plate formats from 6 to 1536 wells, plus custom
              dimensions up to 64 &times; 64.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Multi-plate workspace</h3>
            <p>
              The tab bar at the top of the plate editor lets you work with multiple plates.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Add a plate</strong> &mdash; click the <strong>+</strong> button.
              </li>
              <li>
                <strong>Switch plates</strong> &mdash; click a tab.
              </li>
              <li>
                <strong>Rename</strong> &mdash; double-click the tab name.
              </li>
              <li>
                <strong>Duplicate</strong> &mdash; hover the active tab and click the copy icon.
              </li>
              <li>
                <strong>Delete</strong> &mdash; hover the active tab and click the &times; icon.
              </li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Overview mode</h3>
            <p>
              Click the grid icon to the right of the tab bar to see all your plates at once as
              color-coded thumbnails. Click any thumbnail to jump back to that plate.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Zoom</h3>
            <p>
              Use the <strong>&minus;</strong> and <strong>+</strong> buttons in the toolbar to
              zoom in and out. The zoom range is 25% to 300%.
            </p>
          </Section>

          {/* Layers */}
          <Section id="layers" icon={Layers} title="Metadata Layers">
            <p>
              Layers are the core of your plate metadata. Each layer represents one type of
              information &mdash; for example, &ldquo;Treatment&rdquo;, &ldquo;Concentration&rdquo;,
              or &ldquo;Replicate&rdquo;.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Adding layers</h3>
            <p>
              Type a layer name in the input at the bottom of the right panel and press Enter
              or click <strong>+</strong>.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Assigning values</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click a layer in the panel to make it active.</li>
              <li>Select wells on the plate grid.</li>
              <li>Type a value in the editor that appears and press Enter, or click a quick-assign button if the value already exists.</li>
            </ol>

            <h3 className="font-semibold mt-4 mb-2">Layer visibility</h3>
            <p>
              Click the eye icon next to a layer to toggle its visibility. The plate grid colors
              wells by the currently active visible layer.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Color coding</h3>
            <p>
              Each unique value within a layer gets a distinct color automatically. The legend at
              the bottom of the plate editor shows the mapping for the active layer.
            </p>

            <Tip>
              Having trouble seeing your assignments? Make sure the correct layer is both
              <strong> active</strong> (clicked) and <strong>visible</strong> (eye icon on).
            </Tip>
          </Section>

          {/* Merge Layers */}
          <Section id="merge-layers" icon={Merge} title="Merging Layers">
            <p>
              You can combine two or more layers into a single layer whose values are the
              concatenation of the source layers. This is useful when you need a composite
              identifier &mdash; for example, joining &ldquo;Treatment&rdquo; and
              &ldquo;Concentration&rdquo; into &ldquo;Treatment|10uM&rdquo;.
            </p>

            <h3 className="font-semibold mt-4 mb-2">How to merge</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Make sure you have at least two layers. The <strong>Merge</strong> button
                appears in the layer panel header when two or more layers exist.
              </li>
              <li>Click <strong>Merge</strong> to open the dialog.</li>
              <li>
                Check the layers you want to combine. Each layer shows how many wells have
                values assigned.
              </li>
              <li>
                Use the <strong>up/down arrows</strong> in the Concatenation Order section
                to control the order values are joined. The layer listed first contributes its
                value first.
              </li>
              <li>
                Choose a <strong>separator</strong> (pipe, dash, underscore, comma, space, or
                type a custom one).
              </li>
              <li>
                Review the live <strong>preview</strong> to see how the merged values will look.
              </li>
              <li>Click <strong>Merge Layers</strong> to create the new combined layer.</li>
            </ol>

            <Tip>
              The original layers are kept intact. Merging creates a brand-new layer, so you
              can always delete the merged result and try again with a different order or
              separator.
            </Tip>
          </Section>

          {/* Sequence Fill */}
          <Section id="sequence-fill" icon={Hash} title="Sequence Fill">
            <p>
              Sequence Fill lets you auto-number a set of selected wells with a pattern like
              Sample01, Sample02, Sample03&hellip; This is ideal for assigning sample IDs,
              barcodes, or any sequential identifier.
            </p>

            <h3 className="font-semibold mt-4 mb-2">How to use it</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Select the wells you want to fill (click, drag, or use row/column headers).</li>
              <li>
                Click the <strong>#</strong> button in the layer editor (next to the paintbrush
                and eraser).
              </li>
              <li>
                Set a <strong>prefix</strong> (e.g., &ldquo;Sample&rdquo;), a <strong>start number</strong>,
                and optional <strong>zero-padding</strong> (None, 2, 3, or 4 digits).
              </li>
              <li>
                Choose a <strong>fill order</strong> to control how the sequence maps to wells:
              </li>
            </ol>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4 font-semibold">Order</th>
                    <th className="text-left py-2 font-semibold">Pattern</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--foreground)]/80">
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">Row-wise (L&rarr;R, T&rarr;B)</td>
                    <td className="py-2">A1, A2, A3&hellip; B1, B2, B3&hellip;</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">Column-wise (T&rarr;B, L&rarr;R)</td>
                    <td className="py-2">A1, B1, C1&hellip; A2, B2, C2&hellip;</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">Snake rows</td>
                    <td className="py-2">A1, A2, A3&hellip; B3, B2, B1&hellip;</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Snake columns</td>
                    <td className="py-2">A1, B1, C1&hellip; C2, B2, A2&hellip;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3">
              The dialog shows a live <strong>preview table</strong> mapping each well to its
              generated value so you can verify the result before applying.
            </p>

            <Tip>
              Snake ordering is common for multi-channel pipetting workflows where you
              alternate direction on each row or column to minimize plate movement.
            </Tip>
          </Section>

          {/* Selection */}
          <Section id="selection" icon={MousePointerClick} title="Selecting Wells">
            <p>There are several ways to select wells:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Click</strong> a well to select it individually.
              </li>
              <li>
                <strong>Click and drag</strong> to draw a rectangular selection box.
              </li>
              <li>
                <strong>Click a row header</strong> (A, B, C&hellip;) to select the entire row.
              </li>
              <li>
                <strong>Click a column header</strong> (1, 2, 3&hellip;) to select the entire column.
              </li>
              <li>
                Hold <Kbd>Shift</Kbd> or <Kbd>Cmd</Kbd> / <Kbd>Ctrl</Kbd> while clicking or
                dragging to <strong>add to</strong> the current selection.
              </li>
            </ul>
            <p>
              The toolbar shows how many wells are selected. Click the trash icon in the toolbar
              to clear your selection.
            </p>
          </Section>

          {/* Exporting */}
          <Section id="exporting" icon={Download} title="Exporting Your Data">
            <p>
              Click the <strong>Export</strong> button in the header to open the export dialog.
              You need at least one metadata layer before you can export.
            </p>

            <h3 className="font-semibold mt-4 mb-2">Formats</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4 font-semibold">Format</th>
                    <th className="text-left py-2 pr-4 font-semibold">Best for</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--foreground)]/80">
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">JSON</td>
                    <td className="py-2">Programmatic pipelines, LIMS integration</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">CSV</td>
                    <td className="py-2">Spreadsheets, R/Python analysis scripts</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">XML</td>
                    <td className="py-2">Instrument software, structured data exchange</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">Excel (.xlsx)</td>
                    <td className="py-2">Sharing with collaborators, color-coded spreadsheet view</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-medium">PowerPoint (.pptx)</td>
                    <td className="py-2">Lab meetings, presentations, documentation</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">PNG</td>
                    <td className="py-2">Quick visual reference, embedding in reports</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold mt-4 mb-2">Multi-plate export</h3>
            <p>
              When you have multiple plates you can choose to export just the active plate or
              all plates. For non-image formats, a consolidation toggle lets you combine all
              plates into a single file (default) or download them as a ZIP of separate files.
              PNG exports are always a ZIP of individual images.
            </p>

            <Tip>
              Use the <strong>Include empty wells</strong> option if your analysis pipeline
              needs a value for every well, even unused ones.
            </Tip>
          </Section>

          {/* Settings */}
          <Section id="settings" icon={Settings} title="Settings">
            <p>
              Click the gear icon in the header to open settings.
            </p>

            <h3 className="font-semibold mt-4 mb-2">AI provider</h3>
            <p>
              Choose between <strong>Claude</strong> (Anthropic) and <strong>GPT</strong> (OpenAI).
              Both work well; Claude is the default.
            </p>

            <h3 className="font-semibold mt-4 mb-2">API keys</h3>
            <p>
              If a server-side key is configured, check <strong>Use server-side API key</strong> and
              you&apos;re set. Otherwise, paste your own API key into the appropriate field.
              Keys are stored locally in your browser and never sent anywhere except the
              AI provider.
            </p>
          </Section>

          {/* Keyboard Shortcuts */}
          <Section id="shortcuts" icon={Keyboard} title="Keyboard Shortcuts">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4 font-semibold">Shortcut</th>
                    <th className="text-left py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--foreground)]/80">
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4"><Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd></td>
                    <td className="py-2">Undo last action</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4"><Kbd>Ctrl</Kbd> + <Kbd>Y</Kbd></td>
                    <td className="py-2">Redo last action</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4"><Kbd>Enter</Kbd></td>
                    <td className="py-2">Send message / apply value / confirm rename</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4"><Kbd>Shift</Kbd> + <Kbd>Enter</Kbd></td>
                    <td className="py-2">New line in chat input</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4"><Kbd>Escape</Kbd></td>
                    <td className="py-2">Cancel rename / close dialog</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><Kbd>Shift</Kbd> / <Kbd>Cmd</Kbd> + click</td>
                    <td className="py-2">Add to current well selection</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Footer */}
          <div className="pt-8 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
            <Link
              href="/"
              className="text-[var(--primary)] hover:underline"
            >
              &larr; Back to MetaBuilder
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
