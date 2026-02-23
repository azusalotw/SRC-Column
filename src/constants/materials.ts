export const RY_MAP: Record<string, number> = {
  'A572': 1.1,
  'SN490B': 1.2,
  'A36': 1.3,
  'SM570': 1.1,
}

export const GRADE_LABELS: Record<string, string> = {
  'A572': 'A572 Gr.50',
  'SN490B': 'SN490B',
  'A36': 'A36 / SN400',
  'SM570': 'SM570',
}

export const REBAR_SIZES = ['D10', 'D13', 'D16', 'D19', 'D22', 'D25', 'D29', 'D32', 'D36'] as const
export const STIRRUP_SIZES = ['D10', 'D13', 'D16'] as const
