/**
 * Canvas drawing helper utilities.
 * Ported from the original cft.js drawSubText / measureSubText / drawDimLine / drawDimLineV.
 */

export interface SubTextSegment {
  /** Main text */
  t: string
  /** Optional subscript text */
  sub?: string
}

/**
 * Draw text with subscript segments at (x, y).
 * Each segment is { t: 'main', sub: 'subscript' }.
 */
export function drawSubText(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  segments: SubTextSegment[],
  fontSize: number,
): void {
  const mainFont = `${fontSize}px -apple-system, sans-serif`
  const subFont = `${Math.round(fontSize * 0.7)}px -apple-system, sans-serif`
  let cx = x
  for (const seg of segments) {
    // Main text
    ctx.font = mainFont
    ctx.textAlign = 'left'
    ctx.fillText(seg.t, cx, y)
    cx += ctx.measureText(seg.t).width
    // Subscript
    if (seg.sub) {
      ctx.font = subFont
      ctx.fillText(seg.sub, cx, y + fontSize * 0.3)
      cx += ctx.measureText(seg.sub).width
    }
  }
}

/**
 * Measure total width of subscript text segments.
 */
export function measureSubText(
  ctx: CanvasRenderingContext2D,
  segments: SubTextSegment[],
  fontSize: number,
): number {
  const mainFont = `${fontSize}px -apple-system, sans-serif`
  const subFont = `${Math.round(fontSize * 0.7)}px -apple-system, sans-serif`
  let w = 0
  for (const seg of segments) {
    ctx.font = mainFont
    w += ctx.measureText(seg.t).width
    if (seg.sub) {
      ctx.font = subFont
      w += ctx.measureText(seg.sub).width
    }
  }
  return w
}

/**
 * Draw a horizontal dimension line with arrows, tick marks, and a label below.
 * Ported from the original drawDimLine in cft.js.
 */
export function drawDimLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  _y2: number,
  label: string,
  isDark: boolean,
): void {
  ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x1, y - 6)
  ctx.lineTo(x1, y + 6)
  ctx.moveTo(x2, y - 6)
  ctx.lineTo(x2, y + 6)
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  // Arrows
  ctx.beginPath()
  ctx.moveTo(x1 + 6, y - 3)
  ctx.lineTo(x1, y)
  ctx.lineTo(x1 + 6, y + 3)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2 - 6, y - 3)
  ctx.lineTo(x2, y)
  ctx.lineTo(x2 - 6, y + 3)
  ctx.stroke()
  ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b'
  ctx.font = '14px -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, (x1 + x2) / 2, y + 18)
}

/**
 * Draw a vertical dimension line with arrows, tick marks, and a rotated label to the left.
 * Ported from the original drawDimLineV in cft.js.
 */
export function drawDimLineV(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  _x2: number,
  y2: number,
  label: string,
  isDark: boolean,
): void {
  ctx.strokeStyle = isDark ? '#94a3b8' : '#64748b'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - 6, y1)
  ctx.lineTo(x + 6, y1)
  ctx.moveTo(x - 6, y2)
  ctx.lineTo(x + 6, y2)
  ctx.moveTo(x, y1)
  ctx.lineTo(x, y2)
  ctx.stroke()
  // Arrows
  ctx.beginPath()
  ctx.moveTo(x - 3, y1 + 6)
  ctx.lineTo(x, y1)
  ctx.lineTo(x + 3, y1 + 6)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - 3, y2 - 6)
  ctx.lineTo(x, y2)
  ctx.lineTo(x + 3, y2 - 6)
  ctx.stroke()
  ctx.save()
  ctx.translate(x - 16, (y1 + y2) / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b'
  ctx.font = '14px -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, 0, 0)
  ctx.restore()
}
