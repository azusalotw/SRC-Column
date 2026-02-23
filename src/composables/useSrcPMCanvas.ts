/**
 * useSrcPMCanvas - Draws the SRC P-M interaction curve placeholder on a canvas.
 * Ported from drawPMCurvePlaceholder() in app.js (lines ~412-496).
 *
 * Canvas size: 500 x 400
 *
 * For now this only draws a placeholder since the SRC PM curve calculation
 * isn't implemented yet. Features:
 * - Background fill
 * - Grid lines (5x5 dashed grid)
 * - Axes (L-shaped: left + bottom)
 * - Axis labels (M, P)
 * - Dashed elliptical PM curve sketch
 * - Placeholder text: "點擊「計算 PM-Curve」開始計算"
 */
import { type Ref, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useCanvasTheme, type CanvasColors } from '@/composables/useCanvasTheme'

export function useSrcPMCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  const themeStore = useThemeStore()
  const { colors } = useCanvasTheme()

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const c: CanvasColors = colors.value

    // Grid-specific color (original uses a distinct grid color, different from c.grid)
    const gridColor = c.isDark ? '#2d3a4a' : '#e8ecf0'

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = c.bg
    ctx.fillRect(0, 0, w, h)

    const margin = { top: 40, right: 40, bottom: 50, left: 70 }
    const plotW = w - margin.left - margin.right
    const plotH = h - margin.top - margin.bottom

    // Grid lines (5 divisions each axis)
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (plotH * i) / 5
      ctx.beginPath()
      ctx.moveTo(margin.left, y)
      ctx.lineTo(w - margin.right, y)
      ctx.stroke()

      const x = margin.left + (plotW * i) / 5
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, h - margin.bottom)
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = c.axis
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, h - margin.bottom)
    ctx.lineTo(w - margin.right, h - margin.bottom)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = c.textSecondary
    ctx.font = 'bold 16px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('M (tf-m)', w / 2, h - 10)
    ctx.save()
    ctx.translate(18, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('P (tf)', 0, 0)
    ctx.restore()

    // Dashed elliptical PM curve sketch
    ctx.strokeStyle = c.curveColor
    ctx.lineWidth = 2.5
    ctx.setLineDash([8, 6])
    ctx.beginPath()

    const pmCx = margin.left + plotW * 0.5
    const pmCy = margin.top + plotH * 0.45
    const pmRx = plotW * 0.4
    const pmRy = plotH * 0.42

    for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
      const x = pmCx + pmRx * Math.cos(angle) * (0.6 + 0.4 * Math.sin(angle))
      const y = pmCy - pmRy * Math.sin(angle)
      if (angle === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Placeholder text
    ctx.fillStyle = c.isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.4)'
    ctx.font = '17px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      '\u9EDE\u64CA\u300C\u8A08\u7B97 PM-Curve\u300D\u958B\u59CB\u8A08\u7B97',
      w / 2,
      h / 2 + 10,
    )
    // "點擊「計算 PM-Curve」開始計算"
  }

  onMounted(() => {
    draw()
  })

  watch(
    () => themeStore.theme,
    () => {
      draw()
    },
  )

  return { draw }
}
