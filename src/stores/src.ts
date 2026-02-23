import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SrcLoadEntry, SrcSectionProperties } from '@/types/src'

export const useSrcStore = defineStore('src', () => {
  // Material
  const fc = ref(280)
  const fy = ref(4200)
  const Fys = ref(3500)
  const Es = ref(2040000)
  const Ec = computed(() => Math.round(12000 * Math.sqrt(fc.value)))
  const codeVersion = ref<'2011' | '2024'>('2011')
  const steelGrade = ref('A572')

  // RC Section
  const sectionB = ref(80)
  const sectionH = ref(80)

  // Steel
  const steelShape = ref<'H' | 'DoubleH' | 'Box'>('H')
  const steelH = ref(400)
  const steelB = ref(200)
  const steelTw = ref(8)
  const steelTf = ref(13)

  // Rebar
  const rebarMode = ref<'uniform' | 'custom'>('uniform')
  const cover = ref(6)
  const stirrupSize = ref('D13')
  const rebarSize = ref('D25')
  const rebarCountY = ref(4)
  const rebarCountZ = ref(4)
  const maxRebar = ref(4)
  const stirrupType = ref<'tie' | 'spiral'>('tie')

  // Loads
  const loads = ref<SrcLoadEntry[]>([])
  const loadNo = ref(1)
  const loadPu = ref(0)
  const loadMuy = ref(0)

  // Results
  const sectionProps = ref<SrcSectionProperties | null>(null)

  return {
    fc, fy, Fys, Es, Ec, codeVersion, steelGrade,
    sectionB, sectionH,
    steelShape, steelH, steelB, steelTw, steelTf,
    rebarMode, cover, stirrupSize, rebarSize, rebarCountY, rebarCountZ, maxRebar, stirrupType,
    loads, loadNo, loadPu, loadMuy,
    sectionProps,
  }
})
