export function formatValue(val: number, decimals?: number): string {
  if (decimals === undefined) {
    if (Math.abs(val) >= 1000) decimals = 2
    else if (Math.abs(val) >= 1) decimals = 4
    else decimals = 6
  }
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function classLabel(cls: string, seismicText: string): string {
  if (cls === 'seismic') return `<span class="badge badge-seismic">${seismicText}斷面</span>`
  if (cls === 'compact') return '<span class="badge badge-compact">結實斷面</span>'
  return '<span class="badge badge-fail">需加大斷面</span>'
}
