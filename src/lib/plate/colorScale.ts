// Colorblind-friendly categorical palette (based on Wong 2011)
const CATEGORICAL_PALETTE = [
  '#4E79A7', // blue
  '#F28E2B', // orange
  '#E15759', // red
  '#76B7B2', // teal
  '#59A14F', // green
  '#EDC948', // yellow
  '#B07AA1', // purple
  '#FF9DA7', // pink
  '#9C755F', // brown
  '#BAB0AC', // grey
  '#AF7AA1', // mauve
  '#86BCB6', // mint
  '#D4A6C8', // lavender
  '#8CD17D', // light green
  '#B6992D', // olive
  '#499894', // dark teal
  '#E15759', // coral
  '#F1CE63', // gold
  '#D37295', // rose
  '#A0CBE8', // light blue
]

let colorIndex = 0

export function resetColorIndex() {
  colorIndex = 0
}

export function getNextColor(): string {
  const color = CATEGORICAL_PALETTE[colorIndex % CATEGORICAL_PALETTE.length]
  colorIndex++
  return color
}

export function getColorForValue(
  value: string | number | null,
  colorMap: Record<string, string>
): string {
  if (value === null || value === undefined || value === '') return 'transparent'
  const key = String(value)
  if (colorMap[key]) return colorMap[key]
  return '#cccccc' // fallback
}

export function assignColor(
  value: string | number,
  colorMap: Record<string, string>
): Record<string, string> {
  const key = String(value)
  if (colorMap[key]) return colorMap
  const newMap = { ...colorMap }
  newMap[key] = CATEGORICAL_PALETTE[Object.keys(newMap).length % CATEGORICAL_PALETTE.length]
  return newMap
}

export function buildColorMap(values: (string | number | null)[]): Record<string, string> {
  const unique = [...new Set(values.filter((v): v is string | number => v !== null && v !== undefined && v !== ''))]
  const map: Record<string, string> = {}
  unique.forEach((v, i) => {
    map[String(v)] = CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]
  })
  return map
}

export const EMPTY_WELL_COLOR = '#f3f4f6' // light gray
export const SELECTED_BORDER_COLOR = '#2563eb' // blue-600
export const DEFAULT_WELL_BORDER = '#d1d5db' // gray-300
