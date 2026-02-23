export const REBAR_DIAMETER: Record<string, number> = {
  'D10': 0.953, 'D13': 1.27, 'D16': 1.59, 'D19': 1.91,
  'D22': 2.22, 'D25': 2.54, 'D29': 2.87, 'D32': 3.18, 'D36': 3.58,
}

export function getRebarDiameter(sizeStr: string): number {
  return REBAR_DIAMETER[sizeStr] || 2.54
}
