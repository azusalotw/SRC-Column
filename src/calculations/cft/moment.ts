import type { CftInputs, CftSectionProps, CftMoment } from '../../types/cft'

/**
 * Calculate moment strength.
 *
 * Mn    = Zs * Fys  (kgf*cm, converted to tf*m)
 * phiMn = phiB * Mn
 */
export function cftCalcMoment(inp: CftInputs, sec: CftSectionProps): CftMoment {
  const { Fys, phiB } = inp
  const { Zs } = sec

  const Mn = Zs * Fys / 100000 // kgf*cm to tf*m
  const phiMn = phiB * Mn

  return { Mn, phiMn }
}
