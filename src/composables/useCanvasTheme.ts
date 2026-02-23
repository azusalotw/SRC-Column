import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

export interface CanvasColors {
  isDark: boolean
  bg: string
  text: string
  textSecondary: string
  textTertiary: string
  axis: string
  grid: string
  dimColor: string
  // SRC section
  rcColor: string
  rcFill: string
  steelColor: string
  steelFill: string
  rebarFill: string
  rebarStroke: string
  stirrupColor: string
  // CFT section
  concreteFill: string
  steelTubeFill: string
  steelTubeStroke: string
  concreteCoreDash: string
  // Chart
  curveColor: string
  curveFill: string
  successColor: string
  failColor: string
}

function getLightColors(): CanvasColors {
  return {
    isDark: false,
    bg: '#fafbfc',
    text: '#1e293b',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    axis: '#64748b',
    grid: 'rgba(0,0,0,0.06)',
    dimColor: '#64748b',
    rcColor: '#2563eb',
    rcFill: 'rgba(37, 99, 235, 0.08)',
    steelColor: '#7c3aed',
    steelFill: 'rgba(124, 58, 237, 0.25)',
    rebarFill: '#f59e0b',
    rebarStroke: '#d97706',
    stirrupColor: 'rgba(100, 116, 139, 0.5)',
    concreteFill: 'rgba(37, 99, 235, 0.08)',
    steelTubeFill: 'rgba(124, 58, 237, 0.25)',
    steelTubeStroke: '#7c3aed',
    concreteCoreDash: 'rgba(37, 99, 235, 0.4)',
    curveColor: '#2563eb',
    curveFill: 'rgba(37, 99, 235, 0.05)',
    successColor: '#059669',
    failColor: '#dc2626',
  }
}

function getDarkColors(): CanvasColors {
  return {
    isDark: true,
    bg: '#1a2332',
    text: '#e2e8f0',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    axis: '#94a3b8',
    grid: 'rgba(148,163,184,0.15)',
    dimColor: '#94a3b8',
    rcColor: '#60a5fa',
    rcFill: 'rgba(96, 165, 250, 0.12)',
    steelColor: '#a78bfa',
    steelFill: 'rgba(167, 139, 250, 0.4)',
    rebarFill: '#fbbf24',
    rebarStroke: '#f59e0b',
    stirrupColor: 'rgba(148, 163, 184, 0.5)',
    concreteFill: 'rgba(96, 165, 250, 0.12)',
    steelTubeFill: 'rgba(167, 139, 250, 0.4)',
    steelTubeStroke: '#a78bfa',
    concreteCoreDash: 'rgba(96, 165, 250, 0.5)',
    curveColor: '#60a5fa',
    curveFill: 'rgba(96, 165, 250, 0.08)',
    successColor: '#34d399',
    failColor: '#f87171',
  }
}

export function useCanvasTheme() {
  const themeStore = useThemeStore()

  const colors = computed<CanvasColors>(() => {
    return themeStore.theme === 'dark' ? getDarkColors() : getLightColors()
  })

  return { colors }
}
