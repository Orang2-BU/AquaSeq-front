import type { TextStyle } from 'react-native';

import dtcg from './tokens.dtcg.json';

// Token dari docs/08-DESIGN.md lewat `designmd export --format dtcg` (jangan ditulis ulang).
// Yang belum didukung spec (line-height, bayangan, resep kaca) disalin dari bagian
// Typography / Elevation & Depth 08-DESIGN.

type Dict<T> = Record<string, T>;
const raw = dtcg as unknown as {
  color: Dict<{ $value: { hex: string } }>;
  spacing: Dict<{ $value: { value: number } }>;
  rounded: Dict<{ $value: { value: number } }>;
  typography: Dict<{
    $value: { fontSize: { value: number }; fontWeight: number; letterSpacing?: { value: number } };
  }>;
};
const pick = <T, R>(o: Dict<T>, f: (v: T) => R) =>
  Object.fromEntries(
    Object.entries(o)
      .filter(([k]) => !k.startsWith('$'))
      .map(([k, v]) => [k, f(v)]),
  );

export const color = pick(raw.color, (v) => v.$value.hex) as Record<
  | 'primary'
  | 'on-primary'
  | 'fab'
  | 'on-fab'
  | 'accent-glow'
  | 'primary-soft'
  | 'on-primary-soft'
  | 'canvas'
  | 'canvas-low'
  | 'bloom-aqua'
  | 'bloom-sky'
  | 'bloom-lilac'
  | 'glass'
  | 'glass-strong'
  | 'surface'
  | 'surface-raised'
  | 'water-top'
  | 'water-mid'
  | 'water-bottom'
  | 'track'
  | 'on-surface'
  | 'on-surface-muted'
  | 'ink-soft'
  | 'outline'
  | 'outline-strong'
  | 'rim'
  | 'success'
  | 'success-soft'
  | 'warning'
  | 'warning-soft'
  | 'alert'
  | 'alert-soft'
  | 'danger'
  | 'danger-soft'
  | 'on-danger'
  | 'simulation'
  | 'simulation-soft'
  | 'focus-ring',
  string
>;

export const space = pick(raw.spacing, (v) => v.$value.value) as Record<
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'gutter' | 'margin',
  number
>;

export const radius = pick(raw.rounded, (v) => Math.min(v.$value.value, 999)) as Record<
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'frame' | 'full',
  number
>;

/** 08-DESIGN Typography: line-height per level (tidak ikut export dtcg). */
const LINE_HEIGHT: Dict<number> = {
  'display-xl': 1.05,
  'display-lg': 1.1,
  'display-md': 1.15,
  headline: 1.25,
  title: 1.3,
  'body-md': 1.5,
  'body-sm': 1.45,
  'label-md': 1.2,
  'label-sm': 1.2,
  caption: 1.35,
  'label-caps': 1,
};

/** Figtree dimuat lewat expo-font; tiap ketebalan punya nama keluarga sendiri. */
const FONT_BY_WEIGHT: Dict<string> = {
  400: 'Figtree_400Regular',
  500: 'Figtree_500Medium',
  600: 'Figtree_600SemiBold',
  700: 'Figtree_700Bold',
};

export type TypeVariant =
  | 'display-xl'
  | 'display-lg'
  | 'display-md'
  | 'headline'
  | 'title'
  | 'body-md'
  | 'body-sm'
  | 'label-md'
  | 'label-sm'
  | 'caption'
  | 'label-caps';

export const type = Object.fromEntries(
  Object.entries(raw.typography).map(([k, v]): [string, TextStyle] => {
    const size = v.$value.fontSize.value;
    return [
      k,
      {
        fontFamily: FONT_BY_WEIGHT[v.$value.fontWeight],
        fontSize: size,
        lineHeight: Math.round(size * (LINE_HEIGHT[k] ?? 1.3)),
        letterSpacing: (v.$value.letterSpacing?.value ?? 0) * size,
      },
    ];
  }),
) as Record<TypeVariant, TextStyle>;

/** 08-DESIGN Elevation & Depth (RN New Architecture mendukung boxShadow di native dan web). */
export const shadow = {
  glass: '0 2px 6px rgba(13,14,16,0.04), 0 18px 40px rgba(13,14,16,0.10)',
  glassInset: 'inset 0 -6px 14px rgba(13,14,16,0.04)',
  button: 'inset 0 -3px 6px rgba(13,14,16,0.06), 0 6px 14px rgba(13,14,16,0.08)',
  card: '0 1px 2px rgba(13,14,16,0.04), 0 8px 24px rgba(13,14,16,0.06)',
  raised: '0 1px 2px rgba(13,14,16,0.05)',
  fab: '0 10px 24px rgba(60,198,210,0.45)',
  water: 'inset 0 -18px 36px rgba(60,198,210,0.30), 0 18px 40px rgba(13,14,16,0.10)',
  primary: '0 8px 18px rgba(10,107,120,0.25)',
} as const;

/** Resep kaca panel: putih 62% + blur 24 (web), BlurView (iOS), panel pekat (Android/reduce). */
export const glass = {
  fill: 'rgba(255,255,255,0.62)',
  fillButton: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.70)'] as const,
  sheen: ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)'] as const,
  rim: 'rgba(255,255,255,0.9)',
  blur: 24,
  nativeIntensity: 60,
} as const;

/** Tinggi nav pil + jarak bawah, dipakai sebagai padding bawah konten. */
export const NAV_HEIGHT = 72;
