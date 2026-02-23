export function tip(label: string, formula?: string): string {
  if (!formula) return label
  return `<span class="tip-wrap" data-formula="${formula.replace(/"/g, '&quot;')}">${label}</span>`
}
