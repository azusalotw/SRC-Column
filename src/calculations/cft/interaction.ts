import type { CftInputs, CftBuckling, CftMoment, CftInteraction } from '../../types/cft'

/**
 * P-M interaction check (AISC bilinear).
 *
 * When Pu/(phiPn) >= 0.2:
 *   H1-1a: Pu/(phiC*Pn) + (8/9) * Mu/(phiB*Mn) <= 1.0
 *
 * When Pu/(phiPn) < 0.2:
 *   H1-1b: Pu/(2*phiC*Pn) + Mu/(phiB*Mn) <= 1.0
 */
export function cftCalcInteraction(inp: CftInputs, buck: CftBuckling, mom: CftMoment): CftInteraction {
  const { Pu, Mux } = inp
  const { phiPn } = buck
  const { phiMn } = mom

  if (phiPn === 0) return { ratio_P: 0, ratio_M: 0, value: 0, formula: '-', ok: true }

  const ratio_P = Pu / phiPn
  const ratio_M = phiMn > 0 ? Mux / phiMn : 0

  let value: number
  let formula: string
  if (ratio_P >= 0.2) {
    // H1-1a: Pu/(phiC*Pn) + 8/9 * Mu/(phiB*Mn) <= 1.0
    value = ratio_P + (8 / 9) * ratio_M
    formula = 'H1-1a'
  } else {
    // H1-1b: Pu/(2*phiC*Pn) + Mu/(phiB*Mn) <= 1.0
    value = ratio_P / 2 + ratio_M
    formula = 'H1-1b'
  }

  return { ratio_P, ratio_M, value, formula, ok: value <= 1.0 }
}
