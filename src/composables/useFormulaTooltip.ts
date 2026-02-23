import { onMounted, onUnmounted } from 'vue'

export function useFormulaTooltip() {
  let tooltipEl: HTMLDivElement | null = null

  function onMouseOver(e: Event) {
    const target = (e.target as HTMLElement).closest('.tip-wrap[data-formula]') as HTMLElement | null
    if (!target || !tooltipEl) return

    tooltipEl.innerHTML = target.getAttribute('data-formula') || ''
    tooltipEl.style.display = 'block'

    const rect = target.getBoundingClientRect()
    const tw = tooltipEl.offsetWidth
    let left = rect.left + rect.width / 2 - tw / 2
    if (left < 4) left = 4
    if (left + tw > window.innerWidth - 4) left = window.innerWidth - 4 - tw
    tooltipEl.style.left = `${left}px`
    tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 8}px`
  }

  function onMouseOut(e: Event) {
    const target = (e.target as HTMLElement).closest('.tip-wrap[data-formula]') as HTMLElement | null
    if (!target || !tooltipEl) return
    const related = (e as MouseEvent).relatedTarget as HTMLElement | null
    if (target.contains(related)) return
    tooltipEl.style.display = 'none'
  }

  onMounted(() => {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'formulaTooltip'
    document.body.appendChild(tooltipEl)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
  })

  onUnmounted(() => {
    document.removeEventListener('mouseover', onMouseOver)
    document.removeEventListener('mouseout', onMouseOut)
    tooltipEl?.remove()
    tooltipEl = null
  })
}
