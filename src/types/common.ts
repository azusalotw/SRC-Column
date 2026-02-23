/** Common type definitions shared across SRC calculation modules */

/** Steel section shape */
export type SteelShape = 'H' | 'DoubleH' | 'Box'

/** Code version for width-thickness classification */
export type CodeVersion = '2011' | '2024'

/** Steel grade (used in 2024 code for Ry lookup) */
export type SteelGrade = 'A572' | 'SN490B' | 'A36' | 'SM570'

/** Stirrup configuration type */
export type StirrupType = 'single' | 'double'

/** Rebar placement mode */
export type RebarMode = 'uniform' | 'custom'

/** Standard rebar size designation */
export type RebarSize = 'D10' | 'D13' | 'D16' | 'D19' | 'D22' | 'D25' | 'D29' | 'D32' | 'D36'

/** Width-thickness classification for a single element (flange or web) */
export type WidthThicknessClass = 'seismic' | 'compact' | 'noncompact'

/** Width-thickness ratio classification result */
export interface WidthThicknessResult {
  /** Flange width-thickness ratio */
  lambda_f: number
  /** Web width-thickness ratio */
  lambda_w: number
  /** Seismic/high-ductility limit for flange */
  lambda_pd_f: number
  /** Seismic/high-ductility limit for web */
  lambda_pd_w: number
  /** Compact limit for flange */
  lambda_p_f: number
  /** Compact limit for web */
  lambda_p_w: number
  /** Flange classification */
  flangeClass: WidthThicknessClass
  /** Web classification */
  webClass: WidthThicknessClass
  /** Overall section classification (worst of flange and web) */
  sectionClass: WidthThicknessClass
  /** Steel grade label for display */
  gradeLabel: string
  /** Seismic category label for display */
  seismicLabel: string
}

/** Rebar group inertia calculation result */
export interface RebarInertiaResult {
  /** Moment of inertia about Y-axis (sum of A*z^2) (cm4) */
  Ist_y: number
  /** Moment of inertia about Z-axis (sum of A*y^2) (cm4) */
  Ist_z: number
  /** Total number of rebar */
  totalCount: number
  /** Individual rebar positions relative to section center */
  positions: Array<{ y: number; z: number }>
}

/** Complete SRC section properties result */
export interface SrcSectionProperties {
  // --- SRC gross section ---
  /** Gross area (cm2) */
  Ag: number
  /** Gross moment of inertia about Y-axis (cm4) */
  Ig_y: number
  /** Gross moment of inertia about Z-axis (cm4) */
  Ig_z: number

  // --- Steel section ---
  /** Steel shape type */
  shape: SteelShape
  /** Steel area (cm2) */
  As: number
  /** Steel moment of inertia about Y-axis (cm4) */
  Is_y: number
  /** Steel moment of inertia about Z-axis (cm4) */
  Is_z: number
  /** Steel plastic section modulus about Y-axis (cm3) */
  Zs_y: number
  /** Steel plastic section modulus about Z-axis (cm3) */
  Zs_z: number
  /** Steel elastic section modulus about Y-axis (cm3) */
  Ss_y: number
  /** Steel elastic section modulus about Z-axis (cm3) */
  Ss_z: number
  /** Steel radius of gyration about Y-axis (cm) */
  rs_y: number
  /** Steel radius of gyration about Z-axis (cm) */
  rs_z: number
  /** Steel ratio As/Ag */
  rho_s: number

  // --- Width-thickness check ---
  /** Width-thickness classification result */
  widthThickness: WidthThicknessResult
  /** Code version used */
  codeVer: CodeVersion

  // --- Rebar / RC ---
  /** Rebar size designation */
  rebarSize: string
  /** Total rebar count */
  totalRebarCount: number
  /** Single rebar area (cm2) */
  Abar: number
  /** Total rebar area (cm2) */
  Ast: number
  /** Rebar ratio Ast/Ag */
  rho_g: number
  /** Net concrete area (cm2) */
  Ac: number
  /** Rebar group moment of inertia about Y-axis (cm4) */
  Ist_y: number
  /** Rebar group moment of inertia about Z-axis (cm4) */
  Ist_z: number
  /** Net concrete moment of inertia about Y-axis (cm4) */
  Ic_y: number
  /** Net concrete moment of inertia about Z-axis (cm4) */
  Ic_z: number

  // --- Stiffness ---
  /** Concrete elastic modulus (kgf/cm2) */
  Ec_val: number
  /** Steel elastic modulus (kgf/cm2) */
  Es_val: number

  /** Steel axial stiffness EA_s (kgf) */
  EA_s: number
  /** RC axial stiffness 0.55*Ec*Ac (kgf) */
  EA_rc: number
  /** Total axial stiffness (kgf) */
  EA_total: number
  /** Steel EA ratio */
  EA_s_ratio: number
  /** RC EA ratio */
  EA_rc_ratio: number

  /** Steel flexural stiffness EI_s about Y-axis (kgf-cm2) */
  EI_s_y: number
  /** RC flexural stiffness 0.35*Ec*Ig about Y-axis (kgf-cm2) */
  EI_rc_y: number
  /** Total flexural stiffness about Y-axis (kgf-cm2) */
  EI_total_y: number
  /** Steel EI_y ratio */
  EI_s_y_ratio: number
  /** RC EI_y ratio */
  EI_rc_y_ratio: number

  /** Steel flexural stiffness EI_s about Z-axis (kgf-cm2) */
  EI_s_z: number
  /** RC flexural stiffness 0.35*Ec*Ig about Z-axis (kgf-cm2) */
  EI_rc_z: number
  /** Total flexural stiffness about Z-axis (kgf-cm2) */
  EI_total_z: number
  /** Steel EI_z ratio */
  EI_s_z_ratio: number
  /** RC EI_z ratio */
  EI_rc_z_ratio: number

  // --- Original dimensions ---
  /** Section width B (cm) */
  B: number
  /** Section height H (cm) */
  H: number
  /** Steel height sH (cm) */
  sH: number
  /** Steel width sB (cm) */
  sB: number
  /** Steel web thickness sTw (cm) */
  sTw: number
  /** Steel flange thickness sTf (cm) */
  sTf: number
}
