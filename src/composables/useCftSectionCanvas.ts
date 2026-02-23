/**
 * useCftSectionCanvas - Draws the CFT box-tube cross section on a canvas.
 * Ported from drawCftSection() in cft.js (lines ~458-553).
 *
 * Canvas size: 500 x 400
 */
import { type Ref, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useCftStore } from '@/stores/cft'
import { useCanvasTheme, type CanvasColors } from '@/composables/useCanvasTheme'
import { drawDimLine, drawDimLineV } from '@/utils/canvas-helpers'

export function useCftSectionCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  const themeStore = useThemeStore()
  const cftStore = useCftStore()
  const { colors } = useCanvasTheme()

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const c: CanvasColors = colors.value

    ctx.clearRect(0, 0, W, H)

    // Read dimensions from store
    const B = cftStore.B
    const sH = cftStore.H
    const tw = cftStore.tw

    // Scale to fit
    const margin = 70
    const drawW = W - 2 * margin
    const drawH = H - 2 * margin
    const scale = Math.min(drawW / B, drawH / sH) * 0.85

    const cx = W / 2
    const cy = H / 2
    const bx = B * scale
    const by = sH * scale
    const x0 = cx - bx / 2
    const y0 = cy - by / 2

    // Concrete fill
    ctx.fillStyle = c.concreteFill
    ctx.fillRect(x0, y0, bx, by)

    // Steel tube walls
    const twPx = tw * scale
    ctx.fillStyle = c.steelTubeFill
    // Top flange
    ctx.fillRect(x0, y0, bx, twPx)
    // Bottom flange
    ctx.fillRect(x0, y0 + by - twPx, bx, twPx)
    // Left web
    ctx.fillRect(x0, y0, twPx, by)
    // Right web
    ctx.fillRect(x0 + bx - twPx, y0, twPx, by)

    // Outer frame stroke
    ctx.strokeStyle = c.steelTubeStroke
    ctx.lineWidth = 2
    ctx.strokeRect(x0, y0, bx, by)

    // Inner dashed frame (concrete core)
    ctx.strokeStyle = c.concreteCoreDash
    ctx.lineWidth = 1
    ctx.setLineDash([6, 4])
    ctx.strokeRect(x0 + twPx, y0 + twPx, bx - 2 * twPx, by - 2 * twPx)
    ctx.setLineDash([])

    // Dimension annotations
    ctx.fillStyle = c.text
    ctx.font = '14px -apple-system, sans-serif'
    ctx.textAlign = 'center'

    // B (bottom)
    drawDimLine(ctx, x0, y0 + by + 20, x0 + bx, y0 + by + 20, `B = ${B} cm`, c.isDark)
    // H (left)
    drawDimLineV(ctx, x0 - 20, y0, x0 - 20, y0 + by, `H = ${sH} cm`, c.isDark)

    // tw annotation (right of top flange)
    if (twPx > 8) {
      ctx.fillStyle = c.steelTubeStroke
      ctx.font = '13px -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`tw=${tw}`, x0 + bx + 8, y0 + twPx / 2 + 4)
    }

    // Legend
    const legendY = H - 20
    ctx.font = '13px -apple-system, sans-serif'
    ctx.textAlign = 'left'

    // Steel tube legend
    ctx.fillStyle = c.steelTubeFill
    ctx.fillRect(margin, legendY - 10, 14, 14)
    ctx.fillStyle = c.isDark ? '#c4b5fd' : '#7c3aed'
    ctx.fillText('\u92FC\u7BA1', margin + 18, legendY + 1) // 鋼管

    // Concrete legend
    ctx.fillStyle = c.concreteFill
    ctx.fillRect(margin + 70, legendY - 10, 14, 14)
    ctx.strokeStyle = c.concreteCoreDash
    ctx.strokeRect(margin + 70, legendY - 10, 14, 14)
    ctx.fillStyle = c.isDark ? '#93c5fd' : '#2563eb'
    ctx.fillText('\u6DF7\u51DD\u571F', margin + 88, legendY + 1) // 混凝土

    // Center cross-hair lines
    ctx.strokeStyle = c.isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.2)'
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(cx, y0 - 10)
    ctx.lineTo(cx, y0 + by + 10)
    ctx.moveTo(x0 - 10, cy)
    ctx.lineTo(x0 + bx + 10, cy)
    ctx.stroke()
    ctx.setLineDash([])
  }

  onMounted(() => {
    draw()
  })

  watch(
    () => [cftStore.B, cftStore.H, cftStore.tw, themeStore.theme],
    () => {
      draw()
    },
  )

  return { draw }
}
