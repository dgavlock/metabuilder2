'use client'

import { useUIStore } from '@/stores/uiStore'
import { PlateTabBar } from './PlateTabBar'
import { PlateToolbar } from './PlateToolbar'
import { PlateGrid } from './PlateGrid'
import { PlateLegend } from './PlateLegend'
import { PlateOverview } from './PlateOverview'
import { LayerPanel } from '@/components/layers/LayerPanel'

export function PlateEditor() {
  const viewMode = useUIStore((s) => s.viewMode)

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PlateTabBar />
        {viewMode === 'single' ? (
          <>
            <PlateToolbar />
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
              <PlateGrid />
            </div>
            <PlateLegend />
          </>
        ) : (
          <PlateOverview />
        )}
      </div>
      {viewMode === 'single' && (
        <div className="w-72 border-l border-[var(--border)] flex-shrink-0 overflow-y-auto">
          <LayerPanel />
        </div>
      )}
    </div>
  )
}
