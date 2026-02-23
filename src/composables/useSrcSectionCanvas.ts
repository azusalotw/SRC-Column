/**
 * useSrcSectionCanvas - Draws the SRC cross section on a canvas.
 * Ported from drawSectionPlaceholder() in app.js (lines ~214-409).
 *
 * Canvas size: 500 x 450
 *
 * Features:
 * - Y/Z axes with arrows and labels
 * - RC section rectangle with stroke
 * - Steel section by shape (H, DoubleH, Box)
 * - Stirrup rectangle (with 135-degree hook corners)
 * - Rebar dots (uniform perimeter arrangement)
 * - B/H dimension labels
 * - Legend (RC, steel, stirrup, rebar)
 */
import { type Ref, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useSrcStore } from '@/stores/src'
import { useCanvasTheme, type CanvasColors } from '@/composables/useCanvasTheme'
import type { SteelShape } from '@/types/common'

/** Rebar size -> diameter (cm) lookup */
const REBAR_DIAMETER: Record<string, number> = {
  D10: 0.953,
  D13: 1.27,
  D16: 1.59,
  D19: 1.91,
  D22: 2.22,
  D25: 2.54,
  D29: 2.87,
  D32: 3.18,
  D36: 3.58,
}

function getRebarDiameter(sizeStr: string): number {
  return REBAR_DIAMETER[sizeStr] || 2.54
}

/** Legend text for steel shape */
function getSteelLegendText(shape: SteelShape): string {
  const labels: Record<string, string> = {
    H: 'H\u578B\u92FC',
    DoubleH: 'Double H\u578B\u92FC',
    Box: 'Box\u578B\u92FC',
  }
  return labels[shape] || 'H\u578B\u92FC'
}

// ===== Steel shape drawing helpers =====

function drawHShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dH: number,
  dB: number,
  dTw: number,
  dTf: number,
  fillColor: string,
  strokeColor: string,
): void {
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  // Top flange
  ctx.fillRect(cx - dB / 2, cy - dH / 2, dB, dTf)
  ctx.strokeRect(cx - dB / 2, cy - dH / 2, dB, dTf)
  // Bottom flange
  ctx.fillRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf)
  ctx.strokeRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf)
  // Web
  ctx.fillRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
  ctx.strokeRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
}

function drawDoubleHShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dH: number,
  dB: number,
  dTw: number,
  dTf: number,
  fillColor: string,
  strokeColor: string,
): void {
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor

  // --- First H: vertical web (same as single H) ---
  // Top flange
  ctx.fillRect(cx - dB / 2, cy - dH / 2, dB, dTf)
  ctx.strokeRect(cx - dB / 2, cy - dH / 2, dB, dTf)
  // Bottom flange
  ctx.fillRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf)
  ctx.strokeRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf)
  // Web (vertical)
  ctx.fillRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
  ctx.strokeRect(cx - dTw / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)

  // --- Second H: horizontal web (rotated 90 degrees, dimensions swapped) ---
  // Left flange (originally top flange rotated)
  ctx.fillRect(cx - dH / 2, cy - dB / 2, dTf, dB)
  ctx.strokeRect(cx - dH / 2, cy - dB / 2, dTf, dB)
  // Right flange (originally bottom flange rotated)
  ctx.fillRect(cx + dH / 2 - dTf, cy - dB / 2, dTf, dB)
  ctx.strokeRect(cx + dH / 2 - dTf, cy - dB / 2, dTf, dB)
  // Web (horizontal)
  ctx.fillRect(cx - dH / 2 + dTf, cy - dTw / 2, dH - 2 * dTf, dTw)
  ctx.strokeRect(cx - dH / 2 + dTf, cy - dTw / 2, dH - 2 * dTf, dTw)
}

function drawBoxShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dH: number,
  dB: number,
  dTw: number,
  dTf: number,
  fillColor: string,
  strokeColor: string,
): void {
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  // Top flange
  ctx.fillRect(cx - dB / 2, cy - dH / 2, dB, dTf)
  ctx.strokeRect(cx - dB / 2, cy - dH / 2, dB, dTf)
  // Bottom flange
  ctx.fillRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf)
  ctx.strokeRect(cx - dB / 2, cy + dH / 2 - dTf, dB, dTf)
  // Left web
  ctx.fillRect(cx - dB / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
  ctx.strokeRect(cx - dB / 2, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
  // Right web
  ctx.fillRect(cx + dB / 2 - dTw, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
  ctx.strokeRect(cx + dB / 2 - dTw, cy - dH / 2 + dTf, dTw, dH - 2 * dTf)
}

function drawSteelByShape(
  ctx: CanvasRenderingContext2D,
  shape: SteelShape,
  cx: number,
  cy: number,
  dH: number,
  dB: number,
  dTw: number,
  dTf: number,
  fillColor: string,
  strokeColor: string,
  lineWidth: number,
): void {
  ctx.lineWidth = lineWidth
  if (shape === 'DoubleH') {
    drawDoubleHShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor)
  } else if (shape === 'Box') {
    drawBoxShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor)
  } else {
    drawHShape(ctx, cx, cy, dH, dB, dTw, dTf, fillColor, strokeColor)
  }
}

// ===== Main composable =====

export function useSrcSectionCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  const themeStore = useThemeStore()
  const srcStore = useSrcStore()
  const { colors } = useCanvasTheme()

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const c: CanvasColors = colors.value

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = c.bg
    ctx.fillRect(0, 0, w, h)

    // Section dimensions from store
    const B = srcStore.sectionB
    const H = srcStore.sectionH
    const shape: SteelShape = srcStore.steelShape as SteelShape
    const steelH = srcStore.steelH / 10 // mm -> cm
    const steelB = srcStore.steelB / 10
    const steelTw = srcStore.steelTw / 10
    const steelTf = srcStore.steelTf / 10

    // For DoubleH, both directions span steelH
    const effectiveB =
      shape === 'DoubleH' ? Math.max(B, steelH) : Math.max(B, steelB)
    const effectiveH =
      shape === 'DoubleH' ? Math.max(H, steelH) : Math.max(H, steelH)

    const margin = 60
    const drawW = w - margin * 2
    const drawH = h - margin * 2
    const scale = Math.min(drawW / effectiveB, drawH / effectiveH) * 0.85

    const cx = w / 2
    const cy = h / 2

    // --- Coordinate axes (dashed) ---
    ctx.strokeStyle = c.axis
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(margin - 10, cy)
    ctx.lineTo(w - margin + 10, cy)
    ctx.moveTo(cx, margin - 10)
    ctx.lineTo(cx, h - margin + 10)
    ctx.stroke()
    ctx.setLineDash([])

    // Axis labels
    ctx.fillStyle = c.textSecondary
    ctx.font = '16px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Y', w - margin + 25, cy + 5)
    ctx.fillText('Z', cx, margin - 20)

    // --- RC section rectangle ---
    const rcW = B * scale
    const rcH = H * scale
    const rcX = cx - rcW / 2
    const rcY = cy - rcH / 2

    ctx.strokeStyle = c.rcColor
    ctx.lineWidth = 2.5
    ctx.strokeRect(rcX, rcY, rcW, rcH)

    // B, H dimension labels
    ctx.fillStyle = c.rcColor
    ctx.font = 'bold 16px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`B = ${B} cm`, cx, rcY + rcH + 25)
    ctx.save()
    ctx.translate(rcX - 25, cy)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`H = ${H} cm`, 0, 0)
    ctx.restore()

    // --- Steel section ---
    const shH = steelH * scale
    const shB = steelB * scale
    const shTw = steelTw * scale
    const shTf = steelTf * scale

    drawSteelByShape(ctx, shape, cx, cy, shH, shB, shTw, shTf, c.steelFill, c.steelColor, 2)

    // --- Stirrup and rebar parameters ---
    const cover = srcStore.cover
    const stirrupSizeStr = srcStore.stirrupSize
    const rebarSizeStr = srcStore.rebarSize
    const stirrupDia = getRebarDiameter(stirrupSizeStr)
    const rebarDia = getRebarDiameter(rebarSizeStr)
    const rebarCountY = srcStore.rebarCountY
    const rebarCountZ = srcStore.rebarCountZ

    // --- Stirrup rectangle ---
    // Stirrup center offset from RC edge = cover + stirrupDia/2
    const stirrupCenterOffset = (cover + stirrupDia / 2) * scale
    const stirrupThickness = stirrupDia * scale

    const stX = rcX + stirrupCenterOffset - stirrupThickness / 2
    const stY = rcY + stirrupCenterOffset - stirrupThickness / 2
    const stW = rcW - 2 * stirrupCenterOffset + stirrupThickness
    const stH_draw = rcH - 2 * stirrupCenterOffset + stirrupThickness

    ctx.strokeStyle = c.stirrupColor
    ctx.lineWidth = Math.max(stirrupThickness, 1.5)
    ctx.strokeRect(stX, stY, stW, stH_draw)

    // 135-degree hook indicators (short diagonal lines at four corners)
    const hookLen = 8
    ctx.lineWidth = Math.max(stirrupThickness * 0.8, 1)
    const corners: [number, number, number, number][] = [
      [stX, stY, 1, 1],
      [stX + stW, stY, -1, 1],
      [stX + stW, stY + stH_draw, -1, -1],
      [stX, stY + stH_draw, 1, -1],
    ]
    corners.forEach(([x, y, dx, dy]) => {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + dx * hookLen, y + dy * hookLen)
      ctx.stroke()
    })

    // --- Rebar dots ---
    // Rebar center = cover + stirrupDia + rebarDia/2
    const rebarCenterOffset = (cover + stirrupDia + rebarDia / 2) * scale
    const rebarRadius = (rebarDia / 2) * scale
    const drawRebarRadius = Math.max(rebarRadius, 3)

    const rebarStartY = rcX + rebarCenterOffset
    const rebarEndY = rcX + rcW - rebarCenterOffset
    const rebarStartZ = rcY + rebarCenterOffset
    const rebarEndZ = rcY + rcH - rebarCenterOffset

    ctx.fillStyle = c.rebarFill
    ctx.strokeStyle = c.rebarStroke
    ctx.lineWidth = 1
    for (let i = 0; i < rebarCountZ; i++) {
      for (let j = 0; j < rebarCountY; j++) {
        // Only draw perimeter rebars
        if (i > 0 && i < rebarCountZ - 1 && j > 0 && j < rebarCountY - 1) continue
        const ry =
          rebarCountY > 1
            ? rebarStartY + ((rebarEndY - rebarStartY) * j) / (rebarCountY - 1)
            : (rebarStartY + rebarEndY) / 2
        const rz =
          rebarCountZ > 1
            ? rebarStartZ + ((rebarEndZ - rebarStartZ) * i) / (rebarCountZ - 1)
            : (rebarStartZ + rebarEndZ) / 2
        ctx.beginPath()
        ctx.arc(ry, rz, drawRebarRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }

    // --- Legend ---
    const legendX = 15
    const legendY = h - 70
    ctx.font = '13px -apple-system, sans-serif'
    ctx.textAlign = 'left'

    // RC section
    ctx.fillStyle = c.rcColor
    ctx.fillRect(legendX, legendY, 14, 3)
    ctx.fillStyle = c.textSecondary
    ctx.fillText('RC\u65B7\u9762', legendX + 20, legendY + 5) // RC斷面

    // Steel section
    ctx.fillStyle = c.steelColor
    ctx.fillRect(legendX, legendY + 16, 14, 3)
    ctx.fillStyle = c.textSecondary
    ctx.fillText(`\u92FC\u9AA8(${getSteelLegendText(shape)})`, legendX + 20, legendY + 21) // 鋼骨(...)

    // Stirrup
    ctx.strokeStyle = c.stirrupColor
    ctx.lineWidth = 2
    ctx.strokeRect(legendX, legendY + 30, 14, 8)
    ctx.fillStyle = c.textSecondary
    ctx.fillText(`\u7B8D\u7B4B(${stirrupSizeStr})`, legendX + 20, legendY + 39) // 箍筋(...)

    // Rebar
    ctx.fillStyle = c.rebarFill
    ctx.strokeStyle = c.rebarStroke
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(legendX + 7, legendY + 52, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = c.textSecondary
    ctx.fillText(`\u4E3B\u7B4B(${rebarSizeStr})`, legendX + 20, legendY + 55) // 主筋(...)
  }

  onMounted(() => {
    draw()
  })

  watch(
    () => [
      srcStore.sectionB,
      srcStore.sectionH,
      srcStore.steelShape,
      srcStore.steelH,
      srcStore.steelB,
      srcStore.steelTw,
      srcStore.steelTf,
      srcStore.cover,
      srcStore.stirrupSize,
      srcStore.rebarSize,
      srcStore.rebarCountY,
      srcStore.rebarCountZ,
      srcStore.rebarMode,
      themeStore.theme,
    ],
    () => {
      draw()
    },
    { deep: true },
  )

  return { draw }
}
