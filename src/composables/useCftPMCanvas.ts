/**
 * useCftPMCanvas - Draws the CFT P-M interaction chart on a canvas.
 * Ported from drawCftPMPlaceholder() and drawCftPMChart() in cft.js (lines ~598-863).
 *
 * Canvas size: 500 x 400
 *
 * Features:
 * - Placeholder text when no results
 * - Full P-M chart: grid, axes, AISC bilinear curve (A->B->C), filled safe area,
 *   reference lines (phiPn, phiMn, 0.2*phiPn), subscript text labels
 * - Load points from cftStore.loads (green = OK, red = NG)
 * - Fallback single point from current input when loads list is empty
 * - Overall OK/NG verdict text
 * - Stores screen-space chart points in cftStore.chartPoints for hover
 * - Hover tooltip: mousemove/mouseleave creates #cftPMTooltip body element, 12px hit radius
 */
import { type Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useCftStore } from '@/stores/cft'
import { useCanvasTheme, type CanvasColors } from '@/composables/useCanvasTheme'
import { drawSubText, measureSubText, type SubTextSegment } from '@/utils/canvas-helpers'

export function useCftPMCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  const themeStore = useThemeStore()
  const cftStore = useCftStore()
  const { colors } = useCanvasTheme()

  // Tooltip element (lazy-created, appended to body)
  let tooltipEl: HTMLDivElement | null = null

  function ensureTooltip(): HTMLDivElement {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div')
      tooltipEl.id = 'cftPMTooltip'
      document.body.appendChild(tooltipEl)
    }
    return tooltipEl
  }

  // --- Placeholder ---
  function drawPlaceholder() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const c: CanvasColors = colors.value

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = c.textTertiary
    ctx.font = '17px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('\u9EDE\u64CA\u300C\u8A08\u7B97\u5F37\u5EA6\u6AA2\u6838\u300D\u7E6A\u88FD P-M \u4EA4\u4E92\u4F5C\u7528\u5716', W / 2, H / 2)
    // "點擊「計算強度檢核」繪製 P-M 交互作用圖"
  }

  // --- Full chart ---
  function drawChart() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const results = cftStore.results
    if (!results) {
      drawPlaceholder()
      return
    }

    const W = canvas.width
    const H = canvas.height
    const c: CanvasColors = colors.value

    ctx.clearRect(0, 0, W, H)

    const { buck, mom, inter, inp } = results
    const phiPn = buck.phiPn
    const phiMn = mom.phiMn

    if (phiPn <= 0 || phiMn <= 0) {
      drawPlaceholder()
      return
    }

    // Plot area padding
    const pad = { l: 80, r: 30, t: 30, b: 50 }
    const gW = W - pad.l - pad.r
    const gH = H - pad.t - pad.b

    // Axis max values: consider all load points, round up to next 1000
    const loads = cftStore.loads
    let maxP = phiPn * 1.1
    let maxM = phiMn * 1.2
    loads.forEach((d: { Pu: number; Mu: number }) => {
      if (d.Pu > maxP) maxP = d.Pu * 1.1
      if (d.Mu > maxM) maxM = d.Mu * 1.1
    })
    const Pmax = Math.ceil(maxP / 1000) * 1000
    const Mmax = Math.ceil(maxM / 1000) * 1000

    const toX = (m: number) => pad.l + (m / Mmax) * gW
    const toY = (p: number) => pad.t + gH - (p / Pmax) * gH

    // Grid lines (1000 intervals)
    const pTickCount = Pmax / 1000
    const mTickCount = Mmax / 1000

    ctx.strokeStyle = c.grid
    ctx.lineWidth = 0.5
    for (let i = 0; i <= pTickCount; i++) {
      const y = toY(i * 1000)
      ctx.beginPath()
      ctx.moveTo(pad.l, y)
      ctx.lineTo(pad.l + gW, y)
      ctx.stroke()
    }
    for (let i = 0; i <= mTickCount; i++) {
      const x = toX(i * 1000)
      ctx.beginPath()
      ctx.moveTo(x, pad.t)
      ctx.lineTo(x, pad.t + gH)
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = c.axis
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(pad.l, pad.t)
    ctx.lineTo(pad.l, pad.t + gH)
    ctx.lineTo(pad.l + gW, pad.t + gH)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = c.textSecondary
    ctx.font = '14px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('M (tf-m)', pad.l + gW / 2, H - 8)

    ctx.save()
    ctx.translate(16, pad.t + gH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('P (tf)', 0, 0)
    ctx.restore()

    // Tick labels (every 1000)
    ctx.font = '12px -apple-system, sans-serif'
    ctx.fillStyle = c.textTertiary
    for (let i = 0; i <= pTickCount; i++) {
      const pVal = i * 1000
      ctx.textAlign = 'right'
      ctx.fillText(pVal.toLocaleString(), pad.l - 8, toY(pVal) + 4)
    }
    for (let i = 0; i <= mTickCount; i++) {
      const mVal = i * 1000
      ctx.textAlign = 'center'
      ctx.fillText(mVal.toLocaleString(), toX(mVal), pad.t + gH + 18)
    }

    // AISC bilinear boundary curve
    // Point A: (M=0, P=phiPn)
    // Point B: (MB, 0.2*phiPn) -- H1-1a / H1-1b junction
    // Point C: (phiMn, P=0)
    const PA = phiPn
    const PB = 0.2 * phiPn
    const MB = (9 / 8) * phiMn * (1 - PB / phiPn)
    const MC = phiMn

    ctx.strokeStyle = c.curveColor
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(PA))
    ctx.lineTo(toX(MB), toY(PB))
    ctx.lineTo(toX(MC), toY(0))
    ctx.stroke()

    // Fill safe area
    ctx.fillStyle = c.curveFill
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(PA))
    ctx.lineTo(toX(MB), toY(PB))
    ctx.lineTo(toX(MC), toY(0))
    ctx.lineTo(toX(0), toY(0))
    ctx.closePath()
    ctx.fill()

    // Reference lines (dashed)
    ctx.setLineDash([5, 4])
    ctx.strokeStyle = c.isDark ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.12)'
    ctx.lineWidth = 1

    // phiPn line
    ctx.beginPath()
    ctx.moveTo(pad.l, toY(phiPn))
    ctx.lineTo(pad.l + gW, toY(phiPn))
    ctx.stroke()

    // phiMn line
    ctx.beginPath()
    ctx.moveTo(toX(phiMn), pad.t)
    ctx.lineTo(toX(phiMn), pad.t + gH)
    ctx.stroke()

    // 0.2*phiPn line
    ctx.beginPath()
    ctx.moveTo(pad.l, toY(PB))
    ctx.lineTo(toX(MB), toY(PB))
    ctx.stroke()
    ctx.setLineDash([])

    // phiPn label text
    ctx.fillStyle = c.curveColor
    ctx.textAlign = 'left'
    const phiPnSegs: SubTextSegment[] = [
      { t: '\u03C6', sub: 'c' },
      { t: 'P', sub: 'n' },
      { t: ` = ${Math.round(phiPn)}` },
    ]
    drawSubText(ctx, pad.l + 4, toY(phiPn) - 5, phiPnSegs, 13)

    // phiMn label text
    ctx.textAlign = 'center'
    const phiMnSegs: SubTextSegment[] = [
      { t: '\u03C6', sub: 'b' },
      { t: 'M', sub: 'n' },
      { t: ` = ${Math.round(phiMn)}` },
    ]
    const phiMnW = measureSubText(ctx, phiMnSegs, 13)
    const phiMnX = toX(phiMn) - phiMnW / 2
    drawSubText(ctx, phiMnX, pad.t - 5 > 12 ? pad.t - 5 : pad.t + 14, phiMnSegs, 13)

    // Point B marker (0.2*phiPn, MB)
    ctx.fillStyle = c.curveColor
    ctx.beginPath()
    ctx.arc(toX(MB), toY(PB), 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = '12px -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`(${Math.round(MB)}, ${Math.round(PB)})`, toX(MB) + 6, toY(PB) - 8)

    // 0.2*phiPn label text (inside chart, near dashed line right end)
    ctx.fillStyle = c.textTertiary
    const pbSegs: SubTextSegment[] = [
      { t: '0.2' },
      { t: '\u03C6', sub: 'c' },
      { t: 'P', sub: 'n' },
      { t: ` = ${Math.round(PB)}` },
    ]
    const pbLabelW = measureSubText(ctx, pbSegs, 12)
    drawSubText(ctx, toX(MB) - pbLabelW - 6, toY(PB) - 6, pbSegs, 12)

    // --- P-M interaction check function (per load point) ---
    function checkPM(Pu: number, Mu: number): boolean {
      const rP = phiPn > 0 ? Pu / phiPn : 0
      const rM = phiMn > 0 ? Mu / phiMn : 0
      let val: number
      if (rP >= 0.2) {
        val = rP + (8 / 9) * rM
      } else {
        val = rP / 2 + rM
      }
      return val <= 1.0
    }

    // --- Draw load points and collect chart points for hover ---
    let allOK = true
    const chartPoints: Array<{ sx: number; sy: number; label: string; ok: boolean }> = []

    const points = loads.length > 0 ? loads : []

    // If no loads, draw the single input point as fallback
    if (points.length === 0 && (inp.Pu !== 0 || inp.Mux !== 0)) {
      const ok = checkPM(inp.Pu, inp.Mux)
      if (!ok) allOK = false
      const dx = toX(inp.Mux)
      const dy = toY(inp.Pu)
      if (dx >= pad.l && dx <= pad.l + gW && dy >= pad.t && dy <= pad.t + gH) {
        ctx.fillStyle = ok ? c.successColor : c.failColor
        ctx.beginPath()
        ctx.arc(dx, dy, 3, 0, Math.PI * 2)
        ctx.fill()
        chartPoints.push({ sx: dx, sy: dy, label: `P=${inp.Pu}, M=${inp.Mux}`, ok })
      }
    }

    points.forEach((item: { no: number; Pu: number; Mu: number }) => {
      const ok = checkPM(item.Pu, item.Mu)
      if (!ok) allOK = false
      const dx = toX(item.Mu)
      const dy = toY(item.Pu)
      if (dx >= pad.l && dx <= pad.l + gW && dy >= pad.t && dy <= pad.t + gH) {
        ctx.fillStyle = ok ? c.successColor : c.failColor
        ctx.beginPath()
        ctx.arc(dx, dy, 3, 0, Math.PI * 2)
        ctx.fill()
        chartPoints.push({
          sx: dx,
          sy: dy,
          label: `No.${item.no}  P=${item.Pu}, M=${item.Mu}`,
          ok,
        })
      }
    })

    // Store chart points for hover
    cftStore.chartPoints = chartPoints

    // Overall verdict
    if (points.length > 0 || inp.Pu !== 0 || inp.Mux !== 0) {
      ctx.font = 'bold 16px -apple-system, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillStyle = allOK ? c.successColor : c.failColor
      ctx.fillText(allOK ? 'ALL OK \u2713' : 'NG \u2717', pad.l + gW - 10, pad.t + 22)
    }
  }

  // --- Main draw dispatcher ---
  function draw() {
    if (cftStore.results) {
      drawChart()
    } else {
      drawPlaceholder()
    }
  }

  // --- Hover tooltip handlers ---
  function onMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const tip = ensureTooltip()
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const pts = cftStore.chartPoints
    let hit: { sx: number; sy: number; label: string; ok: boolean } | null = null
    for (const pt of pts) {
      const dist = Math.sqrt((mx - pt.sx) ** 2 + (my - pt.sy) ** 2)
      if (dist <= 12) {
        hit = pt
        break
      }
    }

    if (hit) {
      tip.textContent = hit.label
      tip.style.display = 'block'
      tip.style.left = (e.clientX + 12) + 'px'
      tip.style.top = (e.clientY - 28) + 'px'
      canvas.style.cursor = 'pointer'
    } else {
      tip.style.display = 'none'
      canvas.style.cursor = 'default'
    }
  }

  function onMouseLeave() {
    const canvas = canvasRef.value
    if (!canvas) return
    const tip = ensureTooltip()
    tip.style.display = 'none'
    canvas.style.cursor = 'default'
  }

  onMounted(() => {
    draw()
    const canvas = canvasRef.value
    if (canvas) {
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseleave', onMouseLeave)
    }
  })

  onBeforeUnmount(() => {
    const canvas = canvasRef.value
    if (canvas) {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
    // Clean up tooltip
    if (tooltipEl && tooltipEl.parentNode) {
      tooltipEl.parentNode.removeChild(tooltipEl)
      tooltipEl = null
    }
  })

  watch(
    () => [cftStore.results, cftStore.loads, themeStore.theme],
    () => {
      draw()
    },
    { deep: true },
  )

  return { draw }
}
