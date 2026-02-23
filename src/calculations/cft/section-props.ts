import type { CftInputs, CftSectionProps } from '../../types/cft'

/**
 * Calculate CFT section geometric properties.
 *
 * Computes gross area, steel area, concrete area, moments of inertia,
 * plastic section modulus, radius of gyration, steel ratio, and
 * minimum required wall thickness.
 */
export function cftCalcSectionProps(inp: CftInputs): CftSectionProps {
  const { B, H, tw, Fys, Es } = inp
  const Bi = B - 2 * tw
  const Hi = H - 2 * tw

  const Ag = B * H
  const As = Ag - Bi * Hi
  const Ac = Bi * Hi
  const Ar = 0 // CFT has no reinforcement bars

  const Ig = B * Math.pow(H, 3) / 12
  const Is = Ig - Bi * Math.pow(Hi, 3) / 12
  const Zs = B * Math.pow(H, 2) / 4 - Bi * Math.pow(Hi, 2) / 4
  const rs = Math.sqrt(Is / As)
  const rho = As / Ag

  // Minimum wall thickness
  const t_min = B * Math.sqrt(Fys / (3 * Es))

  return { Ag, As, Ac, Ar, Ig, Is, Zs, rs, rho, t_min, Bi, Hi }
}
