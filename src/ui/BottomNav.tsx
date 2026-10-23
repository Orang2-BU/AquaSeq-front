import { type Href, router } from 'expo-router';
import {
  Bell,
  Columns2,
  FileSpreadsheet,
  FileText,
  History,
  House,
  type LucideIcon,
  Settings2,
  Upload,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, type PressState, styles as base, T } from './primitives';
import { color, NAV_HEIGHT, radius, shadow, space } from './theme/tokens';

type Item = { key: string; label: string; icon: LucideIcon; href: Href };

const NAV: Record<'lab' | 'tambak', { items: [Item, Item, Item, Item]; fab: Item }> = {
  lab: {
    items: [
      { key: 'beranda', label: 'Beranda', icon: House, href: '/lab' },
      { key: 'riwayat', label: 'Riwayat', icon: History, href: '/lab/riwayat' },
      { key: 'format', label: 'Format', icon: FileSpreadsheet, href: '/lab/format' },
      { key: 'atur', label: 'Atur', icon: Settings2, href: '/pengaturan?peran=lab' },
    ],
    fab: { key: 'unggah', label: 'Unggah run', icon: Upload, href: '/lab/run/baru' },
  },
  tambak: {
    items: [
      { key: 'beranda', label: 'Beranda', icon: House, href: '/tambak' },
      { key: 'banding', label: 'Banding', icon: Columns2, href: '/tambak/banding' },
      { key: 'laporan', label: 'Laporan', icon: FileText, href: '/tambak/laporan' },
      { key: 'atur', label: 'Atur', icon: Settings2, href: '/pengaturan?peran=tambak' },
    ],
    fab: { key: 'peringatan', label: 'Peringatan', icon: Bell, href: '/tambak/peringatan' },
  },
};

function NavItem({ item, active }: { item: Item; active: boolean }) {
  const c = active ? color['on-surface'] : color['on-surface-muted'];
  return (
    <Pressable
      onPress={() => router.navigate(item.href)}
      accessibilityRole="link"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      style={({ focused }: PressState) => [
        {
          flex: 1,
          minHeight: 56,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          borderRadius: radius.full,
        },
        focused && base.focus,
      ]}
    >
      <item.icon
        size={24}
        color={c}
        fill={active ? color['on-surface'] : 'none'}
        strokeWidth={1.75}
      />
      <T v="label-sm" style={{ color: c, fontFamily: active ? 'Figtree_600SemiBold' : undefined }}>
        {item.label}
      </T>
    </Pressable>
  );
}

/** Nav pil kaca melayang (08-DESIGN Components): dua item, FAB, dua item. */
export function BottomNav({
  role,
  active,
  badge = 0,
}: {
  role: 'lab' | 'tambak';
  active: string;
  badge?: number;
}) {
  const insets = useSafeAreaInsets();
  const { items, fab } = NAV[role];
  const fabLabel = badge ? `${fab.label}, ${badge} aktif` : fab.label;
  return (
    <View
      style={{
        position: 'absolute',
        left: space.margin,
        right: space.margin,
        bottom: insets.bottom + space.lg,
        alignItems: 'center',
      }}
      pointerEvents="box-none"
    >
      <Glass
        r={radius.full}
        style={{
          width: '100%',
          maxWidth: 520,
          height: NAV_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 6,
        }}
      >
        <NavItem item={items[0]} active={active === items[0].key} />
        <NavItem item={items[1]} active={active === items[1].key} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fabLabel}
            onPress={() => router.navigate(fab.href)}
            style={({ pressed, focused }: PressState) => [
              {
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: color.fab,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.7)',
                boxShadow: shadow.fab,
                alignItems: 'center',
                justifyContent: 'center',
              },
              focused && base.focus,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <fab.icon size={24} color={color['on-fab']} strokeWidth={2} />
            {badge ? (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  paddingHorizontal: 5,
                  backgroundColor: color.danger,
                  borderWidth: 2,
                  borderColor: color['surface-raised'],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T v="label-caps" c="on-danger">
                  {badge}
                </T>
              </View>
            ) : null}
          </Pressable>
        </View>
        <NavItem item={items[2]} active={active === items[2].key} />
        <NavItem item={items[3]} active={active === items[3].key} />
      </Glass>
    </View>
  );
}
