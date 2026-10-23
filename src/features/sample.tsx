import { router } from 'expo-router';
import { Beaker, FileText, GitBranch, Inbox, Microscope } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useImportNanopore, usePublish, useSample, useSaveChemistry } from '@/data/queries';
import type { SampleDetail } from '@/data/types';
import { freeAmmonia } from '@/engine/convert';
import type { Chemistry } from '@/engine/types';
import {
  Button,
  CardTitle,
  Field,
  fmt,
  fmtCopies,
  fmtDate,
  Glass,
  Header,
  Loading,
  RiskPill,
  Row,
  Screen,
  StateMessage,
  styles,
  T,
  type PressState,
} from '@/ui/primitives';
import { color, space } from '@/ui/theme/tokens';

import { nanoporeExample } from './lab';
import { ACTION, classOf, reasonOf } from './report-text';
import { WaterCard } from './shared';

function WithSample({
  id,
  title,
  render,
}: {
  id: string;
  title: string;
  render: (d: SampleDetail) => ReactNode;
}) {
  const q = useSample(id);
  if (q.isPending)
    return (
      <Screen header={<Header title={title} />}>
        <Loading />
      </Screen>
    );
  if (!q.data)
    return (
      <Screen header={<Header title={title} />}>
        <StateMessage icon={Inbox} title="Sampel tidak ditemukan" body={q.error?.message ?? id} />
      </Screen>
    );
  return <>{render(q.data)}</>;
}

// ---------- P8 kimia air ----------

/** Rentang masuk akal untuk validasi input (bukan ambang skor). */
const FIELDS: {
  key: keyof Chemistry;
  label: string;
  unit: string;
  min: number;
  max: number;
  required: boolean;
  safe: string;
}[] = [
  {
    key: 'temperature',
    label: 'Suhu',
    unit: '°C',
    min: 10,
    max: 40,
    required: true,
    safe: 'Biasanya 26-32 °C',
  },
  { key: 'ph', label: 'pH', unit: '', min: 4, max: 11, required: true, safe: 'SNI 7,5-8,5' },
  {
    key: 'dissolvedO2',
    label: 'DO',
    unit: 'mg/L',
    min: 0,
    max: 20,
    required: true,
    safe: 'Aman ≥ 5,0',
  },
  {
    key: 'tan',
    label: 'TAN',
    unit: 'mg/L',
    min: 0,
    max: 50,
    required: true,
    safe: 'NH3 bebas dihitung otomatis',
  },
  {
    key: 'nitrite',
    label: 'Nitrit (NO2-N)',
    unit: 'mg/L',
    min: 0,
    max: 50,
    required: true,
    safe: 'Aman ≤ 0,5',
  },
  { key: 'h2s', label: 'H2S', unit: 'mg/L', min: 0, max: 5, required: false, safe: 'Aman ≤ 0,005' },
  { key: 'tom', label: 'TOM', unit: 'mg/L', min: 0, max: 500, required: false, safe: 'Aman ≤ 70' },
  {
    key: 'alkalinity',
    label: 'Alkalinitas',
    unit: 'mg/L CaCO3',
    min: 0,
    max: 500,
    required: false,
    safe: 'Aman ≥ 120',
  },
];

function ChemistryForm({ d }: { d: SampleDetail }) {
  const save = useSaveChemistry();
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      FIELDS.map((f) => [
        f.key,
        d.sample.chemistry?.[f.key] == null
          ? ''
          : String(d.sample.chemistry[f.key]).replace('.', ','),
      ]),
    ),
  );
  const num = (k: string) => (vals[k]?.trim() ? Number(vals[k].replace(',', '.')) : null);
  const errorOf = (f: (typeof FIELDS)[number]) => {
    const v = num(f.key);
    if (v === null) return f.required ? null : null;
    if (!Number.isFinite(v)) return `${f.label} harus angka`;
    if (v < f.min || v > f.max)
      return `${f.label} ${fmt(v, 3)} di luar rentang ${f.min}-${f.max}${f.unit ? ` ${f.unit}` : ''}. Periksa satuan.`;
    return null;
  };
  const errors = FIELDS.map(errorOf);
  const missing = FIELDS.filter((f) => f.required && num(f.key) === null);
  const [t, ph, tan] = [num('temperature'), num('ph'), num('tan')];
  const nh3 =
    t !== null && ph !== null && tan !== null && !errors.slice(0, 4).some(Boolean)
      ? freeAmmonia(tan, ph, t)
      : null;
  const valid = !errors.some(Boolean) && missing.length === 0;
  return (
    <Screen header={<Header title="Kimia air" context={`${d.pond.name} · ${d.sample.code}`} />}>
      <Glass style={{ padding: space.xl - 4, gap: space.md }}>
        {FIELDS.map((f, i) => (
          <Field
            key={f.key}
            label={`${f.label}${f.required ? '' : ' (opsional)'}`}
            unit={f.unit}
            numeric
            value={vals[f.key]}
            onChangeText={(s) => setVals({ ...vals, [f.key]: s })}
            error={errors[i]}
            help={f.safe}
          />
        ))}
      </Glass>
      <Glass style={{ padding: space.xl - 4, gap: 4 }}>
        <T v="caption" c="on-surface-muted">
          NH3-N bebas (Emerson)
        </T>
        <T v="display-md" accessibilityLiveRegion="polite">
          {nh3 === null ? '-' : `${fmt(nh3, 4)} mg/L`}
        </T>
        <T v="caption" c={nh3 !== null && nh3 > 0.1 ? 'danger' : 'on-surface-muted'}>
          Aman ≤ 0,05 · kritis {'>'} 0,10 (SNI 8008:2014)
        </T>
      </Glass>
      {missing.length ? (
        <T v="body-sm" c="on-surface-muted">
          Wajib diisi: {missing.map((f) => f.label).join(', ')}
        </T>
      ) : null}
      <Button
        label="Simpan dan hitung ulang SDRI"
        disabled={!valid}
        loading={save.isPending}
        onPress={async () => {
          const data = Object.fromEntries(
            FIELDS.map((f) => [f.key, num(f.key)]),
          ) as unknown as Chemistry;
          await save.mutateAsync({ sampleId: d.sample.id, data });
          router.replace(`/lab/sampel/${d.sample.id}`);
        }}
      />
    </Screen>
  );
}

export function ChemistryScreen({ sampleId }: { sampleId: string }) {
  return <WithSample id={sampleId} title="Kimia air" render={(d) => <ChemistryForm d={d} />} />;
}

// ---------- P9 Nanopore ----------

function NanoporeForm({ d }: { d: SampleDetail }) {
  const imp = useImportNanopore();
  const [csv, setCsv] = useState('');
  const errors = imp.data && !imp.data.ok ? imp.data.errors : [];
  const np = d.sample.nanopore;
  const micro = d.evaluation.components.micro;
  return (
    <Screen
      header={<Header title="Profil Nanopore" context={`${d.pond.name} · ${d.sample.code}`} />}
    >
      {np ? (
        <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
          <CardTitle
            title={`${fmt(np.totalReads, 0)} read`}
            right={micro ? <T v="label-md">S_Micro {fmt(micro.value, 0)}</T> : null}
          />
          {np.totalReads < 5000 ? (
            <T v="body-sm" c="warning">
              Read kurang dari 5.000: komponen mikroba dikosongkan, sampel Tinjau.
            </T>
          ) : !micro ? (
            <T v="body-sm" c="on-surface-muted">
              Sampel acuan run belum punya profil Nanopore, jadi pembanding Shannon belum ada.
            </T>
          ) : null}
          {micro?.trace.map((t) => (
            <Row key={t.label} label={t.label} value={fmt(Number(t.value), 0)} />
          ))}
        </Glass>
      ) : null}
      <Glass style={{ padding: space.xl - 4, gap: space.md }}>
        <Field
          label="Tabel kelimpahan (CSV)"
          value={csv}
          onChangeText={setCsv}
          multiline
          placeholder="sample_code,taxon,rank,read_count,abundance"
          help={`Baris dengan sample_code ${d.sample.code} yang dibaca.`}
        />
        <Button
          kind="glass"
          label="Pakai contoh (SIMULASI)"
          onPress={() => setCsv(nanoporeExample(d.sample.code))}
        />
        {errors.map((e, i) => (
          <T key={i} v="body-sm" c="danger">
            Baris {e.row}: {e.message}
          </T>
        ))}
        <Button
          label="Unggah profil"
          disabled={!csv.trim()}
          loading={imp.isPending}
          onPress={() => imp.mutate({ sampleId: d.sample.id, csv })}
        />
      </Glass>
    </Screen>
  );
}

export function NanoporeScreen({ sampleId }: { sampleId: string }) {
  return <WithSample id={sampleId} title="Nanopore" render={(d) => <NanoporeForm d={d} />} />;
}

// ---------- P10 hasil SDRI ----------

function Result({ d }: { d: SampleDetail }) {
  const cls = classOf(d);
  const c = d.evaluation.components;
  return (
    <Screen
      header={
        <Header title={d.sample.code} context={`${d.pond.name} · run ${fmtDate(d.run.date)}`} />
      }
    >
      <WaterCard
        detail={d}
        actions={[
          {
            icon: GitBranch,
            label: 'Jejak',
            onPress: () => router.push(`/lab/sampel/${d.sample.id}/jejak`),
          },
          {
            icon: Beaker,
            label: 'Kimia',
            onPress: () => router.push(`/lab/sampel/${d.sample.id}/kimia`),
          },
          {
            icon: Microscope,
            label: 'Nanopore',
            onPress: () => router.push(`/lab/sampel/${d.sample.id}/nanopore`),
          },
          {
            icon: FileText,
            label: 'Laporan',
            onPress: () => router.push(`/lab/sampel/${d.sample.id}/laporan`),
          },
        ]}
      />
      {d.evaluation.gate.status === 'TINJAU' ? (
        <Glass style={{ padding: space.xl - 4, gap: 4 }}>
          <T v="label-md" c="warning">
            Tinjau
          </T>
          {d.evaluation.gate.reasons.map((r) => (
            <T key={r} v="body-sm" c="on-surface-muted">
              {r}
            </T>
          ))}
        </Glass>
      ) : null}
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <T v="label-sm" c="on-surface-muted">
          Tindakan
        </T>
        <T v="title">{ACTION[cls].title}</T>
        <T v="body-sm" c="on-surface-muted">
          {reasonOf(d)}. {ACTION[cls].body}
        </T>
      </Glass>
      {c.patho ? (
        <View style={{ gap: space.sm }}>
          {c.patho.perTarget.map((t) => (
            <Row
              key={t.target}
              label={`${t.target} · Ct ${t.ct === null ? 'ND' : fmt(t.ct, 2)}`}
              value={`${fmtCopies(t.copiesMl)} · skor ${fmt(t.score, 0)}`}
            />
          ))}
          {d.nh3 !== null ? (
            <Row label="NH3-N bebas" value={`${fmt(d.nh3, 4)} mg/L`} />
          ) : (
            <Row label="Kimia air" value="Belum diisi" tone="warning" />
          )}
        </View>
      ) : null}
    </Screen>
  );
}

export function ResultScreen({ sampleId }: { sampleId: string }) {
  return <WithSample id={sampleId} title="Hasil SDRI" render={(d) => <Result d={d} />} />;
}

// ---------- P11 jejak bukti ----------

function Node({
  depth,
  title,
  value,
  rule,
  onPress,
}: {
  depth: number;
  title: string;
  value: string;
  rule?: string;
  onPress?: () => void;
}) {
  const body = (
    <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
      <View style={{ width: 12 + depth * 16, alignItems: 'flex-end' }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: color['accent-glow'],
            backgroundColor: color['surface-raised'],
          }}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T v="label-md">{title}</T>
        {rule ? (
          <T v="caption" c="on-surface-muted">
            {rule}
          </T>
        ) : null}
      </View>
      <T v="title">{value}</T>
    </View>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${value}`}
      onPress={onPress}
      style={({ focused }: PressState) => [styles.tableRow, focused && styles.focus]}
    >
      {body}
    </Pressable>
  ) : (
    <View style={styles.tableRow} accessible accessibilityLabel={`${title}, ${value}`}>
      {body}
    </View>
  );
}

function Trace({ d }: { d: SampleDetail }) {
  const e = d.evaluation;
  const c = e.components;
  if (!e.sdri)
    return (
      <Screen header={<Header title="Jejak bukti" context={d.sample.code} />}>
        <StateMessage
          icon={GitBranch}
          title="Sampel ditolak gerbang QC"
          body={e.gate.reasons.join('. ')}
        />
      </Screen>
    );
  const wellsOf = (target: string) =>
    d.run.wells.filter((w) => w.sampleCode === d.sample.code && w.target === target);
  return (
    <Screen header={<Header title="Jejak bukti" context={`${d.pond.name} · ${d.sample.code}`} />}>
      <T v="body-sm" c="on-surface-muted">
        Skor → komponen → target → copies/mL → Ct → well. Ketuk well untuk detail.
      </T>
      <View style={{ gap: space.sm }}>
        <Node depth={0} title="SDRI" value={fmt(e.sdri.value)} rule={e.sdri.trace.at(-1)?.label} />
        <Node
          depth={1}
          title="Stres lingkungan E"
          value={fmt(Number(e.sdri.trace[0].value), 3)}
          rule="sdri-v1 §6: 0,50 kimia + 0,25 nitrifikasi + 0,25 mikroba"
        />
        <Node
          depth={1}
          title="S_Patho (maks patogen)"
          value={fmt(c.patho?.value, 1)}
          rule="sdri-v1 §5.1"
        />
        {c.patho?.perTarget.map((t) => (
          <View key={t.target} style={{ gap: space.sm }}>
            <Node
              depth={2}
              title={`${t.target}: ${t.status}`}
              value={fmt(t.score, 1)}
              rule={
                t.copiesMl === null
                  ? 'Ct ≥ 35 atau tidak teramplifikasi'
                  : `${fmtCopies(t.copiesMl)} dari N_rxn ${fmt(t.nRxn, 1)}`
              }
            />
            {wellsOf(t.target).map((w) => (
              <Node
                key={w.id}
                depth={3}
                title={`Well ${w.id}${w.excluded ? ' (dikeluarkan)' : ''}`}
                value={w.ct === null ? 'ND' : fmt(w.ct, 2)}
                rule={w.excluded ? `Alasan: ${w.excluded.reason}` : 'Ct replikat'}
                onPress={() => router.push(`/lab/run/${d.run.id}/well/${w.id}`)}
              />
            ))}
          </View>
        ))}
        <Node
          depth={1}
          title="S_Chem (maks parameter)"
          value={c.chem ? fmt(c.chem.value, 0) : 'kosong'}
          rule="sdri-v1 §5.2"
        />
        {c.chem?.trace.slice(0, -1).map((t) => (
          <Node key={t.label} depth={2} title={t.label} value={fmt(Number(t.value), 0)} />
        ))}
        <Node
          depth={1}
          title="S_Nitri (amoA)"
          value={c.nitri ? fmt(c.nitri.value, 0) : 'kosong'}
          rule={c.nitri?.trace[0].label ?? 'Butuh sampel acuan CTRL'}
        />
        <Node
          depth={1}
          title="S_Micro (Nanopore)"
          value={c.micro ? fmt(c.micro.value, 0) : 'kosong'}
          rule={c.micro ? 'sdri-v1 §5.4' : 'Belum ada profil Nanopore'}
        />
      </View>
    </Screen>
  );
}

export function TraceScreen({ sampleId }: { sampleId: string }) {
  return <WithSample id={sampleId} title="Jejak bukti" render={(d) => <Trace d={d} />} />;
}

// ---------- P12 tinjau & terbitkan ----------

function Publish({ d }: { d: SampleDetail }) {
  const publish = usePublish();
  const cls = classOf(d);
  const rejected = !d.evaluation.sdri;
  return (
    <Screen
      header={<Header title="Tinjau laporan" context={`${d.pond.name} · ${d.sample.code}`} />}
    >
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <View style={styles.rowBetween}>
          <T v="title">{d.report ? 'Diterbitkan' : 'Draf'}</T>
          <RiskPill cls={cls} />
        </View>
        <T v="body-sm" c="on-surface-muted">
          {d.report
            ? `Terbit ${fmtDate(d.report.publishedAt)} oleh ${d.report.publishedBy}.`
            : rejected
              ? 'Sampel DITOLAK tidak bisa diterbitkan. Uji ulang dulu.'
              : 'Setelah terbit, manajer Tambak Sumberejo melihat laporan ini dan bisa meneruskannya ke petambak.'}
        </T>
      </Glass>
      <View style={{ gap: space.sm }}>
        <Row
          label="SDRI"
          value={d.evaluation.sdri ? `${fmt(d.evaluation.sdri.value)} / 100` : '-'}
        />
        <Row label="Alasan" value={reasonOf(d)} />
        <Row label="Tindakan" value={ACTION[cls].title} />
        <Row
          label="Gerbang QC"
          value={d.evaluation.gate.status}
          tone={d.evaluation.gate.status === 'DITOLAK' ? 'danger' : undefined}
        />
        <Row
          label="Data"
          value={d.sample.provenance === 'simulasi' ? 'SIMULASI' : 'Hasil lab'}
          tone={d.sample.provenance === 'simulasi' ? 'simulation' : undefined}
        />
      </View>
      {publish.error ? (
        <T v="body-sm" c="danger">
          {publish.error.message}
        </T>
      ) : null}
      {d.report ? (
        <Button
          kind="glass"
          label="Lihat laporan manajer"
          onPress={() => router.push(`/tambak/laporan/RPT-${d.sample.id}`)}
        />
      ) : (
        <Button
          label="Terbitkan ke Tambak Sumberejo"
          disabled={rejected}
          loading={publish.isPending}
          onPress={() => publish.mutate(d.sample.id)}
        />
      )}
    </Screen>
  );
}

export function PublishScreen({ sampleId }: { sampleId: string }) {
  return <WithSample id={sampleId} title="Tinjau laporan" render={(d) => <Publish d={d} />} />;
}
