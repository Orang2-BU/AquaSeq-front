import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Ban,
  Check,
  ChevronLeft,
  Eye,
  FlaskConical,
  type LucideIcon,
  ShieldCheck,
  Siren,
  TriangleAlert,
} from 'lucide-react-native';
import { type ReactNode, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import type { RiskClass } from '@/engine/types';

import {
  color,
  glass,
  NAV_HEIGHT,
  radius,
  shadow,
  space,
  type,
  type TypeVariant,
} from './theme/tokens';

/** RN-web menambah status hover/focus pada Pressable; di native keduanya undefined. */
export type PressState = PressableStateCallbackType & { focused?: boolean; hovered?: boolean };

// ---------- teks ----------

export { fmt, fmtCopies, fmtDate } from './format';

export function T({
  v = 'body-md',
  c = 'on-surface',
  style,
  ...rest
}: TextProps & { v?: TypeVariant; c?: keyof typeof color }) {
  return <Text {...rest} style={[type[v], { color: color[c] }, style]} />;
}

// ---------- kaca ----------

/** Reduce transparency (iOS) / prefers-reduced-transparency (web) → panel pekat. */
function useReduceTransparency() {
  const [reduce, setReduce] = useState(
    () =>
      Platform.OS === 'web' &&
      !!globalThis.matchMedia?.('(prefers-reduced-transparency: reduce)').matches,
  );
  useEffect(() => {
    if (Platform.OS === 'web') return;
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

const webBlur = {
  backdropFilter: `blur(${glass.blur}px) saturate(1.4)`,
  WebkitBackdropFilter: `blur(${glass.blur}px) saturate(1.4)`,
} as unknown as ViewStyle;

/** Panel kaca 08-DESIGN: isi putih tembus + blur, kilau atas, rim putih, bayangan lebar. */
export function Glass({
  children,
  style,
  r = radius.xl,
}: {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  r?: number;
}) {
  const reduce = useReduceTransparency();
  const solid = reduce || Platform.OS === 'android';
  return (
    <View
      style={[
        {
          borderRadius: r,
          borderWidth: 2,
          borderColor: glass.rim,
          boxShadow: `${shadow.glassInset}, ${shadow.glass}`,
          backgroundColor: solid ? color['surface-raised'] : glass.fill,
          overflow: 'hidden',
          zIndex: 0,
        },
        !solid && Platform.OS === 'web' ? webBlur : null,
        style,
      ]}
    >
      {!solid && Platform.OS === 'ios' && isLiquidGlassAvailable() ? (
        // iOS 26: Liquid Glass asli Apple (termasuk refraksi), docs/glass-surface-port.md
        <GlassView glassEffectStyle="regular" style={StyleSheet.absoluteFill} />
      ) : !solid && Platform.OS === 'ios' ? (
        <BlurView
          intensity={glass.nativeIntensity}
          tint="systemThinMaterialLight"
          style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
        />
      ) : null}
      <LinearGradient
        colors={glass.sheen}
        end={{ x: 0.5, y: 0.4 }}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

// ---------- tombol ----------

type ButtonProps = {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'glass' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  icon: Icon,
  style,
  accessibilityHint,
}: ButtonProps) {
  const fg = kind === 'glass' ? color['on-surface'] : color['on-primary'];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed, hovered, focused }: PressState) => [
        styles.button,
        kind === 'primary' && { backgroundColor: color.primary, boxShadow: shadow.primary },
        kind === 'danger' && { backgroundColor: color.danger },
        kind === 'glass' && styles.glassButton,
        (hovered as boolean) && { opacity: 0.92 },
        focused && styles.focus,
        pressed && { transform: [{ scale: 0.97 }] },
        (disabled || loading) && { opacity: 0.45 },
        style,
      ]}
    >
      {kind === 'glass' ? <GlassFill /> : null}
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : Icon ? (
        <Icon size={20} color={fg} strokeWidth={1.75} />
      ) : null}
      <T v="label-md" style={{ color: fg }}>
        {label}
      </T>
    </Pressable>
  );
}

function GlassFill() {
  return (
    <LinearGradient
      colors={glass.fillButton}
      style={[StyleSheet.absoluteFill, { borderRadius: radius.full, zIndex: -1 }]}
      pointerEvents="none"
    />
  );
}

/** Tombol ikon kaca bulat 44 (header, pil aksi). */
export function IconButton({
  icon: Icon,
  label,
  onPress,
  size = 44,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed, focused }: PressState) => [
        styles.glassButton,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
        },
        focused && styles.focus,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <GlassFill />
      <Icon size={size >= 56 ? 22 : 20} color={color['on-surface']} strokeWidth={1.75} />
    </Pressable>
  );
}

/** Pil aksi kaca dengan label di bawah (kartu kolom air). */
export function ActionPill({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: space.xs + 2 }}>
      <View style={{ alignSelf: 'stretch' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onPress}
          style={({ pressed, focused }: PressState) => [
            styles.glassButton,
            {
              height: 56,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
            },
            focused && styles.focus,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          <GlassFill />
          <Icon size={22} color={color['on-surface']} strokeWidth={1.75} />
        </Pressable>
      </View>
      <T v="label-sm">{label}</T>
    </View>
  );
}

// ---------- status ----------

const RISK: Record<RiskClass | 'Ditolak', { fg: string; bg: string; icon: LucideIcon }> = {
  Aman: { fg: color.success, bg: color['success-soft'], icon: ShieldCheck },
  Pantau: { fg: color.warning, bg: color['warning-soft'], icon: Eye },
  Waspada: { fg: color.alert, bg: color['alert-soft'], icon: TriangleAlert },
  Kritis: { fg: color.danger, bg: color['danger-soft'], icon: Siren },
  Ditolak: { fg: color['ink-soft'], bg: color.track, icon: Ban },
};

/** Kelas risiko selalu warna + ikon + teks. */
export function RiskPill({ cls }: { cls: RiskClass | 'Ditolak' }) {
  const r = RISK[cls];
  return (
    <View style={[styles.pill, { backgroundColor: r.bg }]} accessibilityLabel={`Kelas ${cls}`}>
      <r.icon size={14} color={r.fg} strokeWidth={2} />
      <T v="label-sm" style={{ color: r.fg }}>
        {cls}
      </T>
    </View>
  );
}

/** Badge SIMULASI: tidak bisa disembunyikan (F12). */
export function SimBadge({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <View
      style={[styles.pill, { height: 22, backgroundColor: color['simulation-soft'] }]}
      accessibilityLabel="Data simulasi"
    >
      <FlaskConical size={12} color={color.simulation} strokeWidth={2.25} />
      <T v="label-caps" c="simulation">
        SIMULASI
      </T>
    </View>
  );
}

// ---------- layar ----------

function Bloom({ c, size, style }: { c: string; size: number; style: ViewStyle }) {
  const id = `b${c.slice(1)}`;
  return (
    <Svg width={size} height={size} style={[{ position: 'absolute' }, style]} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={c} stopOpacity={0.75} />
          <Stop offset="1" stopColor={c} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

/** Kanvas abu bergradasi + bloom pastel, safe area, konten bergulir di bawah nav. */
export function Screen({
  children,
  nav,
  header,
}: {
  children: ReactNode;
  nav?: ReactNode;
  header?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <LinearGradient
        colors={[color.canvas, color['canvas-low']]}
        style={StyleSheet.absoluteFill}
      />
      <Bloom c={color['bloom-aqua']} size={520} style={{ right: -200, top: -180 }} />
      <Bloom c={color['bloom-lilac']} size={460} style={{ left: -220, top: 420 }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingBottom: (nav ? NAV_HEIGHT + space.lg + space.md : space['2xl']) + insets.bottom,
          paddingHorizontal: space.margin,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
          gap: space.md,
        }}
      >
        {header}
        {children}
      </ScrollView>
      {nav}
    </View>
  );
}

/** Header layar dalam: kembali di kiri, judul di tengah, aksi di kanan. */
export function Header({
  title,
  context,
  right,
  back = true,
}: {
  title: string;
  context?: string;
  right?: ReactNode;
  back?: boolean;
}) {
  return (
    <View style={styles.header}>
      {back ? (
        <IconButton
          icon={ChevronLeft}
          label="Kembali"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : (
        <View style={{ width: 44 }} />
      )}
      <View style={{ flex: 1, alignItems: 'center' }}>
        {context ? (
          <T v="caption" c="on-surface-muted" numberOfLines={1}>
            {context}
          </T>
        ) : null}
        <T v="title" accessibilityRole="header" numberOfLines={1}>
          {title}
        </T>
      </View>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/** Judul kartu + aksi kecil di kanan. */
export function CardTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.rowBetween}>
      <T v="title" style={{ flexShrink: 1 }}>
        {title}
      </T>
      {right}
    </View>
  );
}

export function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: keyof typeof color;
}) {
  return (
    <View style={styles.tableRow}>
      <T v="body-sm" c="on-surface-muted" style={{ flexShrink: 1 }}>
        {label}
      </T>
      <T v="label-md" c={tone ?? 'on-surface'} style={{ textAlign: 'right', flexShrink: 1 }}>
        {value}
      </T>
    </View>
  );
}

/** Meter kapsul 10 segmen (keyakinan hasil negatif). */
export function Meter({ value, label }: { value: number; label: string }) {
  const on = Math.round(value * 10);
  return (
    <View
      style={{ flexDirection: 'row', gap: 4 }}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 26,
            borderRadius: radius.full,
            backgroundColor: i < on ? color['on-surface'] : color.track,
          }}
        />
      ))}
    </View>
  );
}

export function StateMessage({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Glass style={{ alignItems: 'center', padding: space.xl, gap: space.sm }}>
      <View
        style={[
          styles.glassButton,
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <GlassFill />
        <Icon size={28} color={color['on-surface-muted']} strokeWidth={1.75} />
      </View>
      <T v="title" style={{ textAlign: 'center' }}>
        {title}
      </T>
      <T v="body-sm" c="on-surface-muted" style={{ textAlign: 'center' }}>
        {body}
      </T>
      {action}
    </Glass>
  );
}

/** Input kaca berlabel (pola "iOS input Design"): satuan di kanan, bantuan/galat di bawah. */
export function Field({
  label,
  value,
  onChangeText,
  unit,
  help,
  error,
  multiline,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  unit?: string;
  help?: string;
  error?: string | null;
  multiline?: boolean;
  placeholder?: string;
  numeric?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <T v="label-sm">{label}</T>
      <View
        style={[
          styles.glassButton,
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            minHeight: multiline ? 160 : 52,
            borderRadius: radius.lg,
            paddingHorizontal: space.lg,
            backgroundColor: color['glass-strong'],
          },
          focused && { borderColor: color.primary, borderWidth: 2 },
          !!error && { borderColor: color.danger, borderWidth: 2 },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? help}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={color['on-surface-muted']}
          keyboardType={numeric ? 'decimal-pad' : 'default'}
          autoCapitalize="none"
          style={[
            type[multiline ? 'body-sm' : 'body-md'],
            {
              flex: 1,
              color: color['on-surface'],
              paddingVertical: multiline ? space.md : 0,
              minHeight: multiline ? 150 : 48,
              outlineStyle: 'none',
              textAlignVertical: multiline ? 'top' : 'center',
            } as unknown as TextStyle,
          ]}
        />
        {unit ? (
          <T v="body-sm" c="on-surface-muted">
            {unit}
          </T>
        ) : null}
      </View>
      {error ? (
        <T v="body-sm" c="danger">
          {error}
        </T>
      ) : help ? (
        <T v="body-sm" c="on-surface-muted">
          {help}
        </T>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      style={({ focused }: PressState) => [
        styles.pill,
        { height: 36, paddingHorizontal: 14, borderWidth: 1.5, borderColor: color.rim },
        selected
          ? { backgroundColor: color['primary-soft'] }
          : { backgroundColor: color['glass-strong'], boxShadow: shadow.button },
        focused && styles.focus,
      ]}
    >
      {selected ? <Check size={14} color={color['on-primary-soft']} strokeWidth={2.25} /> : null}
      <T v="label-sm" c={selected ? 'on-primary-soft' : 'on-surface'}>
        {label}
      </T>
    </Pressable>
  );
}

export function Loading({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <View
      style={{ padding: space['2xl'], alignItems: 'center', gap: space.sm }}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator color={color.primary} />
      <T v="body-sm" c="on-surface-muted">
        {label}
      </T>
    </View>
  );
}

export const styles = StyleSheet.create({
  button: {
    height: 52,
    paddingHorizontal: space.xl,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    overflow: 'hidden',
  },
  glassButton: {
    // stacking context sendiri: lapisan gradien kaca (zIndex -1) tetap di belakang ikon/teks
    zIndex: 0,
    borderWidth: 1.5,
    borderColor: color.rim,
    boxShadow: shadow.button,
    overflow: 'hidden',
  },
  focus: {
    outlineColor: color['focus-ring'],
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xs },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color['surface-raised'],
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: 14,
    boxShadow: shadow.raised,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    boxShadow: shadow.card,
    gap: space.md,
  },
});
