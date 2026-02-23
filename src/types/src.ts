export interface SrcMaterialInputs {
  fc: number
  fy: number
  Fys: number
  Es: number
  Ec: number
  codeVersion: '2011' | '2024'
  steelGrade: string
}

export interface SrcSteelInputs {
  shape: 'H' | 'DoubleH' | 'Box'
  H: number  // mm
  B: number  // mm
  tw: number // mm
  tf: number // mm
}

export interface SrcRebarInputs {
  mode: 'uniform' | 'custom'
  cover: number
  stirrupSize: string
  rebarSize: string
  countY: number
  countZ: number
  maxRebar: number
}

export interface SrcSectionProperties {
  Ag: number; Ig_y: number; Ig_z: number
  shape: string; As: number; Is_y: number; Is_z: number
  Zs_y: number; Zs_z: number; Ss_y: number; Ss_z: number
  rs_y: number; rs_z: number; rho_s: number
  lambda_f: number; lambda_w: number
  codeVer: string
  lambda_pd_f: number; lambda_pd_w: number
  lambda_p_f: number; lambda_p_w: number
  flangeClass: string; webClass: string; sectionClass: string
  gradeLabel: string; seismicLabel: string
  rebarSize: string; totalRebarCount: number
  Abar: number; Ast: number; rho_g: number; Ac: number
  Ist_y: number; Ist_z: number; Ic_y: number; Ic_z: number
  Ec_val: number; Es_val: number
  EA_s: number; EA_rc: number; EA_total: number
  EA_s_ratio: number; EA_rc_ratio: number
  EI_s_y: number; EI_rc_y: number; EI_total_y: number
  EI_s_y_ratio: number; EI_rc_y_ratio: number
  EI_s_z: number; EI_rc_z: number; EI_total_z: number
  EI_s_z_ratio: number; EI_rc_z_ratio: number
  B: number; H: number; sH: number; sB: number; sTw: number; sTf: number
}

export interface SrcLoadEntry {
  no: number
  Pu: number
  Muy: number
}
