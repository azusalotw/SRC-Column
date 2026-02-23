import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CftInputs, CftResults } from '@/types/cft'

export interface CftLoadEntry {
  no: number
  Pu: number
  Mu: number
}

export interface ChartPoint {
  sx: number
  sy: number
  label: string
  ok: boolean
}

export const useCftStore = defineStore('cft', () => {
  // Material
  const fc = ref(280)
  const Fys = ref(3500)
  const Fyr = ref(0)
  const Es = ref(2040000)
  const Ec = computed(() => Math.round(12000 * Math.sqrt(fc.value)))
  const phiC = ref(0.85)
  const phiB = ref(0.90)
  const c1 = ref(1.00)
  const c2 = ref(0.85)
  const c3 = ref(0.40)

  // Section
  const B = ref(150)
  const H = ref(150)
  const tw = ref(6)

  // Column
  const L = ref(3.5)
  const K = ref(1.0)

  // Loads
  const loads = ref<CftLoadEntry[]>([])
  const loadNo = ref(1)
  const loadPu = ref(0)
  const loadMu = ref(0)

  // Results
  const results = ref<CftResults | null>(null)
  const chartPoints = ref<ChartPoint[]>([])

  function getInputs(): CftInputs {
    return {
      B: B.value, H: H.value, tw: tw.value,
      L: L.value, K: K.value,
      fc: fc.value, Fys: Fys.value, Fyr: Fyr.value, Es: Es.value,
      Pu: loadPu.value, Mux: loadMu.value,
      phiC: phiC.value, phiB: phiB.value,
      c1: c1.value, c2: c2.value, c3: c3.value,
    }
  }

  return {
    fc, Fys, Fyr, Es, Ec, phiC, phiB, c1, c2, c3,
    B, H, tw,
    L, K,
    loads, loadNo, loadPu, loadMu,
    results, chartPoints,
    getInputs,
  }
})
