import type { CftInputs, CftSectionProps, CftWidthThickness, CftComposite } from '../../types/cft'

/**
 * Check width-thickness ratio.
 *
 * Verifies that the wall thickness tw meets the minimum requirement
 * t_min = B * sqrt(Fys / (3 * Es)).
 */
export function cftCalcWidthThickness(inp: CftInputs, sec: CftSectionProps): CftWidthThickness {
  const twOK = inp.tw >= sec.t_min
  return { twOK }
}

/**
 * Calculate composite (modified) yield strength and elastic modulus.
 *
 * Fmy = Fys + c1 * Fyr * (Ar/As) + c2 * fc' * (Ac/As)
 * Em  = Es  + c3 * Ec  * (Ac/As)
 * rm  = sqrt(Is / As)
 */
export function cftCalcComposite(inp: CftInputs, sec: CftSectionProps): CftComposite {
  const { Fys, Fyr, fc, Es, c1, c2, c3 } = inp
  const { As, Ac, Ar, Is } = sec

  const Ec = 12000 * Math.sqrt(fc)

  // Fmy = Fys + c1 * Fyr * (Ar/As) + c2 * fc' * (Ac/As)
  const Fmy = Fys + c1 * Fyr * (Ar / As) + c2 * fc * (Ac / As)

  // Em = Es + c3 * Ec * (Ac/As)
  const Em = Es + c3 * Ec * (Ac / As)

  // rm = sqrt(Is / As)
  const rm = Math.sqrt(Is / As)

  return { Ec, Fmy, Em, rm }
}
