import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import type { SampleDetail } from '@/data/types';
import { ActionPill, fmt, fmtDate, RiskPill, SimBadge, T } from '@/ui/primitives';
import { color, radius, shadow, space } from '@/ui/theme/tokens';

import { classOf } from './report-text';

/** Kartu kolom air (signature 08-DESIGN): SDRI besar di gradasi abu → aqua + pil aksi kaca. */
export function WaterCard({
  detail,
  actions,
}: {
  detail: SampleDetail;
  actions: { icon: LucideIcon; label: string; onPress: () => void }[];
}) {
  const { evaluation, sample } = detail;
  const cls = classOf(detail);
  const c = evaluation.components;
  const summary = evaluation.sdri
    ? `SDRI ${fmt(evaluation.sdri.value)} dari 100, kelas ${cls}, sampel ${fmtDate(sample.takenAt)}`
    : `Sampel ditolak: ${evaluation.gate.reasons[0]}`;
  return (
    <View
      style={{
        borderRadius: radius.xl,
        borderWidth: 2,
        borderColor: color.rim,
        overflow: 'hidden',
        boxShadow: shadow.water,
      }}
    >
      <LinearGradient
        colors={[color['water-top'], color['water-mid'], color['water-bottom']]}
        locations={[0, 0.55, 1]}
        style={{ padding: space.xl - 4, gap: space.sm }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: space.sm,
          }}
        >
          <T v="caption" c="ink-soft" style={{ flexShrink: 1 }}>
            {[
              sample.doc ? `DOC ${sample.doc}` : null,
              `sampel ${fmtDate(sample.takenAt)}`,
              evaluation.sdri?.version ?? 'SDRI v1',
            ]
              .filter(Boolean)
              .join(' · ')}
          </T>
          <SimBadge show={sample.provenance === 'simulasi'} />
        </View>
        <View
          accessible
          accessibilityLabel={summary}
          style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: space.md }}
        >
          <T v="display-xl" style={{ fontVariant: ['tabular-nums'] }}>
            {evaluation.sdri ? fmt(evaluation.sdri.value) : '-'}
          </T>
          <T v="body-sm" c="on-surface-muted">
            /100
          </T>
        </View>
        <RiskPill cls={cls} />
        {!evaluation.sdri ? (
          <T v="body-sm" c="ink-soft">
            {evaluation.gate.reasons.join('. ')}
          </T>
        ) : null}
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
          {actions.map((a) => (
            <ActionPill key={a.label} {...a} />
          ))}
        </View>
        {evaluation.sdri ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: space.sm,
              marginTop: space.md,
            }}
          >
            <Pair label="Patogen" value={c.patho?.value ?? null} />
            <Pair label="Kimia" value={c.chem?.value ?? null} />
            <Pair label="Nitrifikasi" value={c.nitri?.value ?? null} />
            <Pair label="Mikroba" value={c.micro?.value ?? null} />
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

function Pair({ label, value }: { label: string; value: number | null }) {
  return (
    <T v="body-sm" c="on-surface">
      {label} <T v="title">{value === null ? '-' : fmt(value, 0)}</T>
    </T>
  );
}
