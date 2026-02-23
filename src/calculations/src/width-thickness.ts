import { RY_MAP, GRADE_LABELS } from '@/constants/materials'

export interface WidthThicknessResult {
  lambda_f: number
  lambda_w: number
  lambda_pd_f: number
  lambda_pd_w: number
  lambda_p_f: number
  lambda_p_w: number
  flangeClass: string
  webClass: string
  sectionClass: string
  gradeLabel: string
  seismicLabel: string
}

export function calcWidthThickness(params: {
  shape: 'H' | 'DoubleH' | 'Box'
  sH: number, sB: number, sTw: number, sTf: number, // in cm
  codeVersion: '2011' | '2024'
  Fys: number, Es: number
  steelGrade: string
}): WidthThicknessResult {
  const { shape, sH, sB, sTw, sTf, codeVersion, Fys, Es, steelGrade } = params

  // ===== Compute width-thickness ratios =====
  let lambda_f: number
  let lambda_w: number

  if (shape === 'H') {
    lambda_f = sB / (2 * sTf)              // 翼板: B/(2·tf)
    lambda_w = (sH - 2 * sTf) / sTw        // 腹板: (H-2·tf)/tw
  } else if (shape === 'DoubleH') {
    lambda_f = sB / (2 * sTf)              // 翼板: B/(2·tf)
    lambda_w = (sH - 2 * sTf) / (2 * sTw)  // 腹板: (H-2·tf)/(2·tw)，十字交叉腹板互為加勁
  } else { // Box
    lambda_f = (sB - 2 * sTw) / sTf        // 翼板: (B-2·tw)/tf
    lambda_w = (sH - 2 * sTf) / sTw        // 腹板: (H-2·tf)/tw
  }

  // ===== Determine limits based on code version =====
  let lambda_pd_f: number
  let lambda_pd_w: number
  let lambda_p_f: number
  let lambda_p_w: number
  let gradeLabel: string
  let seismicLabel: string

  if (codeVersion === '2024') {
    // ---- 修正草案 (2024) ----
    const Ry = RY_MAP[steelGrade] || 1.1
    gradeLabel = `${GRADE_LABELS[steelGrade]} (Ry=${Ry})`
    seismicLabel = '高等韌性'
    const sqrtTerm = Math.sqrt(Es / (Ry * Fys))

    if (shape === 'Box') {
      lambda_pd_f = 1.4 * sqrtTerm
      lambda_pd_w = lambda_pd_f
      lambda_p_f = 2.26 * sqrtTerm
      lambda_p_w = lambda_p_f
    } else {
      lambda_pd_f = 0.46 * sqrtTerm
      lambda_pd_w = 1.86 * sqrtTerm
      lambda_p_f = 0.74 * sqrtTerm
      lambda_p_w = 3.02 * sqrtTerm
    }
  } else {
    // ---- 現行規範 (2011) ----
    const Fys_tf = Fys / 1000
    const isHighStrength = Fys > 2800
    gradeLabel = isHighStrength ? 'SN490 (A572 Gr.50)' : 'SN400 (A36)'
    seismicLabel = '耐震設計'

    if (shape === 'Box') {
      lambda_pd_f = Math.sqrt(3 * Es / Fys)
      lambda_pd_w = lambda_pd_f
      lambda_p_f = isHighStrength ? 61 : 72
      lambda_p_w = lambda_p_f
    } else {
      lambda_pd_f = 21 / Math.sqrt(Fys_tf)
      lambda_pd_w = 123 / Math.sqrt(Fys_tf)
      lambda_p_f = isHighStrength ? 20 : 23
      lambda_p_w = isHighStrength ? 81 : 96
    }
  }

  // ===== Classify individual elements =====
  const classifyPart = (lam: number, lpd: number, lp: number): string => {
    if (lam <= lpd) return 'seismic'
    if (lam <= lp) return 'compact'
    return 'noncompact'
  }
  const flangeClass = classifyPart(lambda_f, lambda_pd_f, lambda_p_f)
  const webClass = classifyPart(lambda_w, lambda_pd_w, lambda_p_w)

  // ===== Overall section classification (take the worst) =====
  let sectionClass: string
  if (flangeClass === 'seismic' && webClass === 'seismic') {
    sectionClass = 'seismic'
  } else if (flangeClass !== 'noncompact' && webClass !== 'noncompact') {
    sectionClass = 'compact'
  } else {
    sectionClass = 'noncompact'
  }

  return {
    lambda_f,
    lambda_w,
    lambda_pd_f,
    lambda_pd_w,
    lambda_p_f,
    lambda_p_w,
    flangeClass,
    webClass,
    sectionClass,
    gradeLabel,
    seismicLabel,
  }
}
