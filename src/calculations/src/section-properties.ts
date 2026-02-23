import { calcSteelArea, calcSteelIy, calcSteelIz, calcSteelZy, calcSteelZz } from './steel-section'
import { calcRebarInertia } from './rebar'
import { getRebarDiameter } from '@/constants/rebar'
import { RY_MAP, GRADE_LABELS } from '@/constants/materials'
import type { SrcSectionProperties } from '@/types/src'

export function calculateSectionProperties(params: {
  B: number, H: number,
  shape: 'H' | 'DoubleH' | 'Box',
  steelH: number, steelB: number, steelTw: number, steelTf: number, // in cm
  rebarSize: string, countY: number, countZ: number,
  cover: number, stirrupSize: string,
  codeVersion: '2011' | '2024',
  Fys: number, Es: number, fc: number,
  steelGrade: string,
}): SrcSectionProperties {
  const {
    B, H, shape,
    steelH: sH, steelB: sB, steelTw: sTw, steelTf: sTf,
    rebarSize: rebarSizeStr, countY, countZ,
    cover, stirrupSize: stirrupSizeStr,
    codeVersion: codeVer, Fys, Es: Es_val, fc,
    steelGrade,
  } = params

  // ===== 鋼筋直徑 =====
  const rebarDia = getRebarDiameter(rebarSizeStr)
  const stirrupDia = getRebarDiameter(stirrupSizeStr)

  // ===== SRC 全斷面 =====
  const Ag = B * H
  const Ig_y = B * Math.pow(H, 3) / 12
  const Ig_z = H * Math.pow(B, 3) / 12

  // ===== 鋼骨 =====
  const As = calcSteelArea(shape, sH, sB, sTw, sTf)
  const Is_y = calcSteelIy(shape, sH, sB, sTw, sTf)
  const Is_z = calcSteelIz(shape, sH, sB, sTw, sTf)
  const Zs_y = calcSteelZy(shape, sH, sB, sTw, sTf)
  const Zs_z = calcSteelZz(shape, sH, sB, sTw, sTf)
  const Ss_y = Is_y / (sH / 2)
  const Ss_z = (shape === 'DoubleH')
    ? Is_z / (Math.max(sH, sB) / 2)
    : Is_z / (sB / 2)
  const rs_y = Math.sqrt(Is_y / As)
  const rs_z = Math.sqrt(Is_z / As)
  const rho_s = As / Ag

  // ===== 鋼骨寬厚比 =====
  let lambda_f: number
  let lambda_w: number
  if (shape === 'H') {
    lambda_f = sB / (2 * sTf)
    lambda_w = (sH - 2 * sTf) / sTw
  } else if (shape === 'DoubleH') {
    lambda_f = sB / (2 * sTf)
    lambda_w = (sH - 2 * sTf) / (2 * sTw)
  } else { // Box
    lambda_f = (sB - 2 * sTw) / sTf
    lambda_w = (sH - 2 * sTf) / sTw
  }

  // ===== 寬厚比檢核 =====
  const isHighStrength = Fys > 2800

  let lambda_pd_f: number
  let lambda_pd_w: number
  let lambda_p_f: number
  let lambda_p_w: number
  let gradeLabel: string
  let seismicLabel: string

  if (codeVer === '2024') {
    // ---- 修正草案 (2024) ----
    const Ry = RY_MAP[steelGrade] || 1.1
    gradeLabel = `${GRADE_LABELS[steelGrade]} (Ry=${Ry})`
    seismicLabel = '高等韌性'
    const sqrtTerm = Math.sqrt(Es_val / (Ry * Fys))

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
    gradeLabel = isHighStrength ? 'SN490 (A572 Gr.50)' : 'SN400 (A36)'
    seismicLabel = '耐震設計'

    if (shape === 'Box') {
      lambda_pd_f = Math.sqrt(3 * Es_val / Fys)
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

  // 個別判定
  const classifyPart = (lam: number, lpd: number, lp: number): string => {
    if (lam <= lpd) return 'seismic'
    if (lam <= lp) return 'compact'
    return 'noncompact'
  }
  const flangeClass = classifyPart(lambda_f, lambda_pd_f, lambda_p_f)
  const webClass = classifyPart(lambda_w, lambda_pd_w, lambda_p_w)

  // 整體判定 (取較差的)
  let sectionClass: string
  if (flangeClass === 'seismic' && webClass === 'seismic') {
    sectionClass = 'seismic'
  } else if (flangeClass !== 'noncompact' && webClass !== 'noncompact') {
    sectionClass = 'compact'
  } else {
    sectionClass = 'noncompact'
  }

  // ===== 鋼筋 / RC =====
  const totalRebarCount = (countY >= 2 && countZ >= 2)
    ? 2 * countY + 2 * countZ - 4
    : countY * countZ
  const Abar = Math.PI * Math.pow(rebarDia, 2) / 4
  const Ast = totalRebarCount * Abar
  const rho_g = Ast / Ag
  const Ac = Ag - As - Ast

  // ===== 鋼筋群慣性矩 =====
  const { Ist_y, Ist_z } = calcRebarInertia(B, H, cover, stirrupDia, rebarDia, countY, countZ)

  // ===== 混凝土淨慣性矩 =====
  const Ic_y = Ig_y - Is_y - Ist_y
  const Ic_z = Ig_z - Is_z - Ist_z

  // ===== 剛度計算 =====
  const Ec_val = 12000 * Math.sqrt(fc)

  // 鋼骨剛度
  const EA_s = Es_val * As
  const EI_s_y = Es_val * Is_y
  const EI_s_z = Es_val * Is_z

  // RC 剛度 (未折減)
  const EA_rc_raw = Ec_val * Ac
  const EI_rc_y_raw = Ec_val * Ig_y
  const EI_rc_z_raw = Ec_val * Ig_z

  // RC 剛度折減 (規範規定)
  const EA_rc = 0.55 * EA_rc_raw
  const EI_rc_y = 0.35 * EI_rc_y_raw
  const EI_rc_z = 0.35 * EI_rc_z_raw

  // 全斷面剛度 (鋼骨 + 折減後 RC)
  const EA_total = EA_s + EA_rc
  const EI_total_y = EI_s_y + EI_rc_y
  const EI_total_z = EI_s_z + EI_rc_z

  // 剛度比
  const EA_s_ratio = EA_s / EA_total
  const EA_rc_ratio = EA_rc / EA_total
  const EI_s_y_ratio = EI_s_y / EI_total_y
  const EI_rc_y_ratio = EI_rc_y / EI_total_y
  const EI_s_z_ratio = EI_s_z / EI_total_z
  const EI_rc_z_ratio = EI_rc_z / EI_total_z

  return {
    // SRC
    Ag, Ig_y, Ig_z,
    // 鋼骨
    shape, As, Is_y, Is_z, Zs_y, Zs_z, Ss_y, Ss_z, rs_y, rs_z, rho_s, lambda_f, lambda_w,
    // 寬厚比檢核
    codeVer, lambda_pd_f, lambda_pd_w, lambda_p_f, lambda_p_w,
    flangeClass, webClass, sectionClass, gradeLabel, seismicLabel,
    // 鋼筋 / RC
    rebarSize: rebarSizeStr, totalRebarCount, Abar, Ast, rho_g, Ac,
    Ist_y, Ist_z, Ic_y, Ic_z,
    // 剛度
    Ec_val, Es_val,
    EA_s, EA_rc, EA_total, EA_s_ratio, EA_rc_ratio,
    EI_s_y, EI_rc_y, EI_total_y, EI_s_y_ratio, EI_rc_y_ratio,
    EI_s_z, EI_rc_z, EI_total_z, EI_s_z_ratio, EI_rc_z_ratio,
    // 原始參數
    B, H, sH, sB, sTw, sTf,
  }
}
