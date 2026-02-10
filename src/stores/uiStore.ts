import { create } from 'zustand'

export type AppMode = 'ai' | 'manual'
export type ViewMode = 'single' | 'overview'

interface UIStore {
  mode: AppMode
  viewMode: ViewMode
  chatPanelWidth: number
  showSettings: boolean
  showExportDialog: boolean
  showFeedback: boolean
  zoom: number

  setMode: (mode: AppMode) => void
  setViewMode: (viewMode: ViewMode) => void
  setChatPanelWidth: (width: number) => void
  toggleSettings: () => void
  toggleExportDialog: () => void
  toggleFeedback: () => void
  setZoom: (zoom: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
  mode: 'ai',
  viewMode: 'single',
  chatPanelWidth: 400,
  showSettings: false,
  showExportDialog: false,
  showFeedback: false,
  zoom: 1,

  setMode: (mode) => set({ mode }),
  setViewMode: (viewMode) => set({ viewMode }),
  setChatPanelWidth: (width) => set({ chatPanelWidth: width }),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  toggleExportDialog: () => set((s) => ({ showExportDialog: !s.showExportDialog })),
  toggleFeedback: () => set((s) => ({ showFeedback: !s.showFeedback })),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
}))
