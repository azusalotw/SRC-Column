import type { CftInputs, CftSectionProps, CftComposite, CftBuckling } from '../../types/cft'

/**
 * Calculate column buckling strength.
 *
 * Computes the slenderness parameter lambda_c, critical buckling stress Fcr,
 * nominal axial strength Pn, and design axial strength phi_c * Pn.
 *
 * When lambda_c <= 1.5:  Fcr = 0.658^(lambda_c^2) * Fmy
 * When lambda_c >  1.5:  Fcr = (0.877 / lambda_c^2) * Fmy
 */
export function cftCalcBuckling(inp: CftInputs, comp: CftComposite, sec: CftSectionProps): CftBuckling {
  const { K, L, phiC } = inp
  const { Fmy, Em, rm } = comp
  const { As } = sec
  const Lcm = L * 100 // m to cm

  const lc = (K * Lcm) / (Math.PI * rm) * Math.sqrt(Fmy / Em)
  const Fcr = lc <= 1.5
    ? Math.pow(0.658, lc * lc) * Fmy
    : (0.877 / (lc * lc)) * Fmy

  const Pn = As * Fcr / 1000 // kgf to tf
  const phiPn = phiC * Pn

  return { lc, Fcr, Pn, phiPn }
}
