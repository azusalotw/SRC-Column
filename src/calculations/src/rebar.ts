/**
 * Rebar group moment of inertia calculation using parallel axis theorem.
 *
 * Computes the moment of inertia contribution of perimeter-only rebar
 * arranged in a rectangular grid pattern. Only rebar along the outer
 * edges (top, bottom, left, right rows) are counted; interior positions
 * are skipped.
 *
 * All dimensions are in cm.
 */

import type { RebarInertiaResult } from '../../types/common'

/**
 * Calculate the rebar group moment of inertia about both axes.
 *
 * Uses the parallel axis theorem: I = sum(A_bar * d_i^2) where d_i is
 * the distance from each rebar center to the section centroid.
 *
 * @param B          - Section width (cm)
 * @param H          - Section height (cm)
 * @param cover      - Clear cover from concrete face to stirrup outer edge (cm)
 * @param stirrupDia - Stirrup bar diameter (cm)
 * @param rebarDia   - Main rebar diameter (cm)
 * @param countY     - Number of rebar along Y-direction (width direction)
 * @param countZ     - Number of rebar along Z-direction (height direction)
 * @returns Rebar group inertia about both axes, total count, and positions
 */
export function calcRebarInertia(
  B: number,
  H: number,
  cover: number,
  stirrupDia: number,
  rebarDia: number,
  countY: number,
  countZ: number,
): RebarInertiaResult {
  // Distance from concrete edge to rebar center
  const offset = cover + stirrupDia + rebarDia / 2
  const Abar = Math.PI * Math.pow(rebarDia, 2) / 4

  // Rebar position range (origin at section center)
  const yMin = -(B / 2 - offset)
  const yMax = (B / 2 - offset)
  const zMin = -(H / 2 - offset)
  const zMax = (H / 2 - offset)

  let Ist_y = 0 // About Y-axis (sum of A * z^2)
  let Ist_z = 0 // About Z-axis (sum of A * y^2)
  const positions: Array<{ y: number; z: number }> = []
  let totalCount = 0

  for (let i = 0; i < countZ; i++) {
    for (let j = 0; j < countY; j++) {
      // Only count rebar on the perimeter
      if (i > 0 && i < countZ - 1 && j > 0 && j < countY - 1) continue

      const yi = (countY > 1) ? yMin + (yMax - yMin) * j / (countY - 1) : 0
      const zi = (countZ > 1) ? zMin + (zMax - zMin) * i / (countZ - 1) : 0

      Ist_y += Abar * zi * zi
      Ist_z += Abar * yi * yi
      positions.push({ y: yi, z: zi })
      totalCount++
    }
  }

  return { Ist_y, Ist_z, totalCount, positions }
}
