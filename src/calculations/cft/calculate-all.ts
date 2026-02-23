import type { CftInputs, CftResults } from '../../types/cft'
import { cftCalcSectionProps } from './section-props'
import { cftCalcWidthThickness, cftCalcComposite } from './composite'
import { cftCalcBuckling } from './buckling'
import { cftCalcMoment } from './moment'
import { cftCalcInteraction } from './interaction'

/**
 * Run all CFT column calculations.
 *
 * Takes a CftInputs object (no DOM access) and returns the complete
 * calculation results including section properties, width-thickness check,
 * composite parameters, buckling strength, moment strength, and
 * P-M interaction check.
 */
export function cftCalculateAll(inp: CftInputs): CftResults {
  const sec = cftCalcSectionProps(inp)
  const wt = cftCalcWidthThickness(inp, sec)
  const comp = cftCalcComposite(inp, sec)
  const buck = cftCalcBuckling(inp, comp, sec)
  const mom = cftCalcMoment(inp, sec)
  const inter = cftCalcInteraction(inp, buck, mom)
  return { inp, sec, wt, comp, buck, mom, inter }
}
