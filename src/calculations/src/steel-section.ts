/**
 * Steel section property calculations for SRC columns.
 *
 * Handles H, DoubleH (cross-shaped dual H), and Box steel shapes.
 * All dimensions are in cm; output areas in cm2, moments of inertia in cm4,
 * section moduli in cm3.
 */

import type { SteelShape } from '../../types/common'

/**
 * Calculate steel cross-sectional area (cm2).
 *
 * - H shape:      2 flanges + 1 web
 * - Box shape:    2 flanges + 2 webs
 * - DoubleH shape: two H shapes crossed (minus overlapping web intersection)
 *
 * @param shape - Steel section shape
 * @param H     - Overall depth (cm)
 * @param B     - Flange width (cm)
 * @param tw    - Web thickness (cm)
 * @param tf    - Flange thickness (cm)
 */
export function calcSteelArea(
  shape: SteelShape,
  H: number,
  B: number,
  tw: number,
  tf: number,
): number {
  if (shape === 'H') {
    return 2 * B * tf + (H - 2 * tf) * tw
  } else if (shape === 'Box') {
    return 2 * B * tf + 2 * (H - 2 * tf) * tw
  } else {
    // DoubleH: two H shapes minus the overlapping tw x tw square at center
    const As1 = 2 * B * tf + (H - 2 * tf) * tw
    return 2 * As1 - tw * tw
  }
}

/**
 * Calculate steel moment of inertia about the Y-axis (horizontal axis,
 * measuring vertical distances) (cm4).
 *
 * @param shape - Steel section shape
 * @param H     - Overall depth (cm)
 * @param B     - Flange width (cm)
 * @param tw    - Web thickness (cm)
 * @param tf    - Flange thickness (cm)
 */
export function calcSteelIy(
  shape: SteelShape,
  H: number,
  B: number,
  tw: number,
  tf: number,
): number {
  if (shape === 'H') {
    return (B * Math.pow(H, 3) - (B - tw) * Math.pow(H - 2 * tf, 3)) / 12
  } else if (shape === 'Box') {
    return (B * Math.pow(H, 3) - (B - 2 * tw) * Math.pow(H - 2 * tf, 3)) / 12
  } else {
    // DoubleH: Iy of vertical H + Iy of horizontal H - overlap
    const Iy1 = (B * Math.pow(H, 3) - (B - tw) * Math.pow(H - 2 * tf, 3)) / 12
    const Iy2 = (2 * tf * Math.pow(B, 3) + (H - 2 * tf) * Math.pow(tw, 3)) / 12
    const Ioverlap = Math.pow(tw, 4) / 12
    return Iy1 + Iy2 - Ioverlap
  }
}

/**
 * Calculate steel moment of inertia about the Z-axis (vertical axis,
 * measuring horizontal distances) (cm4).
 *
 * For DoubleH, Iz equals Iy due to cross symmetry.
 *
 * @param shape - Steel section shape
 * @param H     - Overall depth (cm)
 * @param B     - Flange width (cm)
 * @param tw    - Web thickness (cm)
 * @param tf    - Flange thickness (cm)
 */
export function calcSteelIz(
  shape: SteelShape,
  H: number,
  B: number,
  tw: number,
  tf: number,
): number {
  if (shape === 'H') {
    return (2 * tf * Math.pow(B, 3) + (H - 2 * tf) * Math.pow(tw, 3)) / 12
  } else if (shape === 'Box') {
    return (H * Math.pow(B, 3) - (H - 2 * tf) * Math.pow(B - 2 * tw, 3)) / 12
  } else {
    // DoubleH: symmetric cross, Iz === Iy
    return calcSteelIy('DoubleH', H, B, tw, tf)
  }
}

/**
 * Calculate steel plastic section modulus about the Y-axis (cm3).
 *
 * @param shape - Steel section shape
 * @param H     - Overall depth (cm)
 * @param B     - Flange width (cm)
 * @param tw    - Web thickness (cm)
 * @param tf    - Flange thickness (cm)
 */
export function calcSteelZy(
  shape: SteelShape,
  H: number,
  B: number,
  tw: number,
  tf: number,
): number {
  if (shape === 'H') {
    return (B * H * H - (B - tw) * Math.pow(H - 2 * tf, 2)) / 4
  } else if (shape === 'Box') {
    return (B * H * H - (B - 2 * tw) * Math.pow(H - 2 * tf, 2)) / 4
  } else {
    // DoubleH
    const Zy1 = (B * H * H - (B - tw) * Math.pow(H - 2 * tf, 2)) / 4
    const Zy2 = (2 * tf * B * B + (H - 2 * tf) * tw * tw) / 4
    const Zoverlap = Math.pow(tw, 3) / 4
    return Zy1 + Zy2 - Zoverlap
  }
}

/**
 * Calculate steel plastic section modulus about the Z-axis (cm3).
 *
 * For DoubleH, Zz equals Zy due to cross symmetry.
 *
 * @param shape - Steel section shape
 * @param H     - Overall depth (cm)
 * @param B     - Flange width (cm)
 * @param tw    - Web thickness (cm)
 * @param tf    - Flange thickness (cm)
 */
export function calcSteelZz(
  shape: SteelShape,
  H: number,
  B: number,
  tw: number,
  tf: number,
): number {
  if (shape === 'H') {
    return (2 * tf * B * B + (H - 2 * tf) * tw * tw) / 4
  } else if (shape === 'Box') {
    return (H * B * B - (H - 2 * tf) * Math.pow(B - 2 * tw, 2)) / 4
  } else {
    // DoubleH: symmetric cross, Zz === Zy
    return calcSteelZy('DoubleH', H, B, tw, tf)
  }
}
