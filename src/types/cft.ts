/** CFT (Concrete Filled Tube) calculation type definitions */

/** Input parameters for CFT column design */
export interface CftInputs {
  /** Section width B (cm) */
  B: number
  /** Section height H (cm) */
  H: number
  /** Wall thickness tw (cm) */
  tw: number
  /** Column length L (m) */
  L: number
  /** Effective length factor K */
  K: number
  /** Concrete compressive strength fc' (kgf/cm2) */
  fc: number
  /** Steel yield strength Fys (kgf/cm2) */
  Fys: number
  /** Reinforcement yield strength Fyr (kgf/cm2) */
  Fyr: number
  /** Steel elastic modulus Es (kgf/cm2) */
  Es: number
  /** Factored axial load Pu (tf) */
  Pu: number
  /** Factored moment about x-axis Mux (tf-m) */
  Mux: number
  /** Resistance factor for compression phiC */
  phiC: number
  /** Resistance factor for bending phiB */
  phiB: number
  /** Composite coefficient c1 */
  c1: number
  /** Composite coefficient c2 */
  c2: number
  /** Composite coefficient c3 */
  c3: number
}

/** Section geometric properties */
export interface CftSectionProps {
  /** Gross area Ag (cm2) */
  Ag: number
  /** Steel area As (cm2) */
  As: number
  /** Concrete area Ac (cm2) */
  Ac: number
  /** Reinforcement area Ar (cm2) */
  Ar: number
  /** Gross moment of inertia Ig (cm4) */
  Ig: number
  /** Steel moment of inertia Is (cm4) */
  Is: number
  /** Steel plastic section modulus Zs (cm3) */
  Zs: number
  /** Steel radius of gyration rs (cm) */
  rs: number
  /** Steel ratio rho = As/Ag */
  rho: number
  /** Minimum required wall thickness t_min (cm) */
  t_min: number
  /** Inner width Bi (cm) */
  Bi: number
  /** Inner height Hi (cm) */
  Hi: number
}

/** Width-thickness check result */
export interface CftWidthThickness {
  /** Whether wall thickness meets minimum requirement */
  twOK: boolean
}

/** Composite (modified) strength parameters */
export interface CftComposite {
  /** Concrete elastic modulus Ec (kgf/cm2) */
  Ec: number
  /** Modified yield strength Fmy (kgf/cm2) */
  Fmy: number
  /** Modified elastic modulus Em (kgf/cm2) */
  Em: number
  /** Modified radius of gyration rm (cm) */
  rm: number
}

/** Column buckling strength */
export interface CftBuckling {
  /** Slenderness parameter lambda_c */
  lc: number
  /** Critical buckling stress Fcr (kgf/cm2) */
  Fcr: number
  /** Nominal axial strength Pn (tf) */
  Pn: number
  /** Design axial strength phiPn (tf) */
  phiPn: number
}

/** Moment strength */
export interface CftMoment {
  /** Nominal moment strength Mn (tf-m) */
  Mn: number
  /** Design moment strength phiMn (tf-m) */
  phiMn: number
}

/** P-M interaction check result */
export interface CftInteraction {
  /** Axial load ratio Pu / (phiC * Pn) */
  ratio_P: number
  /** Moment ratio Mux / (phiB * Mn) */
  ratio_M: number
  /** Interaction check value */
  value: number
  /** Governing formula identifier */
  formula: string
  /** Whether the check passes */
  ok: boolean
}

/** Combined results from all CFT calculations */
export interface CftResults {
  /** Input parameters */
  inp: CftInputs
  /** Section properties */
  sec: CftSectionProps
  /** Width-thickness check */
  wt: CftWidthThickness
  /** Composite strength parameters */
  comp: CftComposite
  /** Buckling strength */
  buck: CftBuckling
  /** Moment strength */
  mom: CftMoment
  /** P-M interaction check */
  inter: CftInteraction
}
