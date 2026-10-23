import * as Clipboard from 'expo-clipboard';
import { type Href, router } from 'expo-router';
import {
  Beaker,
  ClipboardList,
  FileWarning,
  FlaskConical,
  Inbox,
  LineChart,
  Microscope,
  Upload,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useExcludeWell, useImportRun, usePonds, useRun, useRuns, useSample } from '@/data/queries';
import { buildSeed } from '@/data/seed';
import type { RunDetail } from '@/data/types';
import { assembleSample } from '@/engine/assemble';
import { parseQpcrCsv, toQpcrCsv } from '@/engine/parse/qpcr-csv';
import { evaluateSample } from '@/engine/sdri';
import { BottomNav } from '@/ui/BottomNav';
import { type PlateWell, PlateHeatmap, StandardCurveChart } from '@/ui/charts';
import {
  Button,
  CardTitle,
  Chip,
  Field,
  fmt,
  fmtDate,
  Glass,
  Header,
  Loading,
  RiskPill,
  Row,
  Screen,
  SimBadge,
  StateMessage,
  styles,
  T,
  type PressState,
} from '@/ui/primitives';
import { color, space } from '@/ui/theme/tokens';

import { HubHeader, Shortcuts } from './tambak';

const Nav = ({ active }: { active: string }) => <BottomNav role="lab" active={active} />;

const gatePill = (status: 'LULUS' | 'TINJAU' | 'DITOLAK') =>
  status === 'DITOLAK' ? (
    <RiskPill cls="Ditolak" />
  ) : (
    <View
      style={[
        styles.pill,
        { backgroundColor: status === 'LULUS' ? color['success-soft'] : color['warning-soft'] },
      ]}
    >
      <T v="label-sm" c={status === 'LULUS' ? 'success' : 'warning'}>
        {status === 'LULUS' ? 'Lulus QC' : 'Tinjau'}
      </T>
    </View>
  );

/** P2 Beranda analis (hub): alur sampel + pintasan + tindakan "Lanjutkan". */
export function LabHub() {
  const runs = useRuns();
  const latest = runs.data?.[0];
  const recent = latest?.samples ?? [];
  const drafts = (runs.data ?? [])
    .flatMap((r) => r.samples)
    .filter((s) => s.sdri !== null && !s.published);
  const stages = [
    { label: 'Diunggah', n: recent.length, icon: Upload },
    { label: 'QC', n: recent.filter((s) => s.gate.status === 'TINJAU').length, icon: Microscope },
    {
      label: 'Ditolak',
      n: recent.filter((s) => s.gate.status === 'DITOLAK').length,
      icon: FileWarning,
    },
    {
      label: 'Draf',
      n: recent.filter((s) => s.sdri !== null && !s.published).length,
      icon: ClipboardList,
    },
    { label: 'Terbit', n: recent.filter((s) => s.published).length, icon: FlaskConical },
  ];
  const next = drafts[0]?.sample.id;
  return (
    <Screen
      nav={<Nav active="beranda" />}
      header={<HubHeader who="Analis" initials="AL" role="Analis lab" />}
    >
      {runs.isPending ? <Loading /> : null}
      {latest ? (
        <Glass style={{ padding: space.xl - 4, gap: space.md }}>
          <CardTitle
            title="Alur sampel"
            right={<SimBadge show={latest.run.provenance === 'simulasi'} />}
          />
          <T v="caption" c="on-surface-muted" style={{ marginTop: -space.sm }}>
            Run terakhir {fmtDate(latest.run.date)} · {latest.run.lab}
          </T>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            accessibilityLabel={stages.map((s) => `${s.label} ${s.n}`).join(', ')}
          >
            {stages.map((s) => (
              <View key={s.label} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
                <View
                  style={[
                    styles.glassButton,
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: color['glass-strong'],
                    },
                  ]}
                >
                  <s.icon
                    size={18}
                    color={s.label === 'Ditolak' && s.n ? color.danger : color['on-surface']}
                    strokeWidth={1.75}
                  />
                </View>
                <T v="title">{s.n}</T>
                <T v="caption" c="on-surface-muted">
                  {s.label}
                </T>
              </View>
            ))}
          </View>
          <T v="body-sm" c="on-surface-muted">
            <T v="label-md">{(runs.data ?? []).length}</T> run tersimpan ·{' '}
            <T v="label-md">
              {latest.gate.status === 'LULUS' ? 'kurva standar lulus' : 'kurva standar gagal'}
            </T>
          </T>
        </Glass>
      ) : null}
      <Shortcuts
        items={[
          {
            icon: Microscope,
            label: 'Ruang QC',
            href: latest ? (`/lab/run/${latest.run.id}` as Href) : '/lab/riwayat',
          },
          {
            icon: LineChart,
            label: 'Kurva',
            href: latest ? (`/lab/run/${latest.run.id}/kurva` as Href) : '/lab/riwayat',
          },
          {
            icon: Beaker,
            label: 'Sampel',
            href: latest ? (`/lab/run/${latest.run.id}/sampel` as Href) : '/lab/riwayat',
          },
          { icon: FlaskConical, label: 'Simulator', href: '/simulator' },
        ]}
      />
      {next ? <ContinueCard sampleId={next} /> : null}
    </Screen>
  );
}

function ContinueCard({ sampleId }: { sampleId: string }) {
  const q = useSample(sampleId);
  if (!q.data) return null;
  const d = q.data;
  return (
    <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
      <View style={styles.rowBetween}>
        <T v="label-md">
          {d.pond.name} · {d.sample.code}
        </T>
        {d.evaluation.sdri ? <RiskPill cls={d.evaluation.sdri.cls} /> : null}
      </View>
      <T v="title">Lanjutkan: tinjau dan terbitkan laporan</T>
      <T v="body-sm" c="on-surface-muted">
        Skor sudah dihitung, laporan masih draf. Pelanggan belum menerima hasilnya.
      </T>
      <Button
        label={`Tinjau ${d.sample.code}`}
        onPress={() => router.push(`/lab/sampel/${sampleId}/laporan`)}
      />
    </Glass>
  );
}

const DEFAULT_MAP: Record<string, string> = {
  CTRL: 'A-01',
  'POND-BIO': 'A-02',
  'POND-TOX': 'B-03',
  'POND-REM': 'B-05',
  'UNK-HUMIC': 'C-07',
};

function exampleCsv() {
  const run = buildSeed().runs.at(-1)!;
  return toQpcrCsv(run.wells, run.standards);
}

/** P3 Unggah run qPCR. */
export function UploadRunScreen() {
  const ponds = usePonds();
  const importRun = useImportRun();
  const [csv, setCsv] = useState('');
  const [lab, setLab] = useState('Lab mitra GSI');
  const [instrument, setInstrument] = useState('QuantStudio 5');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [map, setMap] = useState<Record<string, string>>({});
  const [acuan, setAcuan] = useState<string | null>(null);
  const parsed = useMemo(() => (csv.trim() ? parseQpcrCsv(csv) : null), [csv]);
  const codes = parsed?.ok
    ? [...new Set(parsed.data.wells.map((w) => w.sampleCode))].filter(
        (c) => c !== 'NTC' && c !== 'GDC',
      )
    : [];
  const pondOf = (c: string) => map[c] ?? DEFAULT_MAP[c];
  const ref = acuan ?? (codes.includes('CTRL') ? 'CTRL' : null);
  const ready = parsed?.ok && codes.every((c) => pondOf(c)) && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const serverErrors = importRun.data && !importRun.data.ok ? importRun.data.errors : [];
  const errors = parsed && !parsed.ok ? parsed.errors : serverErrors;

  const submit = async () => {
    const result = await importRun.mutateAsync({
      csv,
      meta: {
        lab,
        instrument,
        date,
        samples: codes.map((c) => ({
          code: c,
          pondId: pondOf(c),
          doc: null,
          role: c === ref ? 'acuan' : 'uji',
        })),
      },
    });
    if (result.ok) router.replace(`/lab/run/${result.id}`);
  };

  return (
    <Screen header={<Header title="Unggah run qPCR" context="Format CSV AquaSeq v1" />}>
      <Glass style={{ padding: space.xl - 4, gap: space.md }}>
        <Field
          label="Isi CSV ekspor alat"
          value={csv}
          onChangeText={setCsv}
          multiline
          placeholder="well,sample_code,target,ct_rep,tm ..."
          help="Tempel isi berkas CSV. Kolom dan contoh ada di halaman Format."
        />
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Button
            kind="glass"
            label="Pakai CSV contoh (SIMULASI)"
            onPress={() => setCsv(exampleCsv())}
          />
          {csv ? <Button kind="glass" label="Kosongkan" onPress={() => setCsv('')} /> : null}
        </View>
      </Glass>
      {errors.length ? (
        <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
          <CardTitle title={`${errors.length} galat ditemukan`} />
          {errors.slice(0, 12).map((e, i) => (
            <T key={i} v="body-sm" c="danger">
              {e.row ? `Baris ${e.row}: ` : ''}
              {e.message}
            </T>
          ))}
        </Glass>
      ) : null}
      {parsed?.ok ? (
        <Glass style={{ padding: space.xl - 4, gap: space.md }}>
          <CardTitle
            title={`${parsed.data.wells.length} well · ${codes.length} sampel`}
            right={gatePill('LULUS')}
          />
          <Field label="Lab" value={lab} onChangeText={setLab} />
          <Field label="Alat" value={instrument} onChangeText={setInstrument} />
          <Field
            label="Tanggal run"
            value={date}
            onChangeText={setDate}
            help="Format TTTT-BB-HH"
            error={/^\d{4}-\d{2}-\d{2}$/.test(date) ? null : 'Tanggal harus TTTT-BB-HH'}
          />
          {codes.map((c) => (
            <View key={c} style={{ gap: space.sm }}>
              <T v="label-md">
                {c} {c === ref ? '· acuan (CTRL)' : ''}
              </T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {(ponds.data ?? []).map((p) => (
                  <Chip
                    key={p.pond.id}
                    label={p.pond.name}
                    selected={pondOf(c) === p.pond.id}
                    onPress={() => setMap({ ...map, [c]: p.pond.id })}
                  />
                ))}
                <Chip label="Jadikan acuan" selected={c === ref} onPress={() => setAcuan(c)} />
              </View>
            </View>
          ))}
          <Button
            label={`Unggah ${codes.length} sampel ke ${lab}`}
            disabled={!ready}
            loading={importRun.isPending}
            onPress={submit}
          />
        </Glass>
      ) : null}
    </Screen>
  );
}

function plateWells(d: RunDetail): PlateWell[] {
  const failed = new Set(
    d.samples.filter((s) => s.gate.status === 'DITOLAK').map((s) => s.sample.code),
  );
  return d.run.wells.map((w) => ({
    id: w.id,
    ct: w.ct,
    label: `${w.sampleCode} ${w.target}`,
    state: w.excluded
      ? 'dikeluarkan'
      : failed.has(w.sampleCode) || (w.sampleCode === 'NTC' && w.ct !== null)
        ? 'gagal'
        : 'ok',
  }));
}

/** P4 Ruang QC run. */
export function RunQcScreen({ runId }: { runId: string }) {
  const q = useRun(runId);
  if (q.isPending)
    return (
      <Screen header={<Header title="Ruang QC" />}>
        <Loading />
      </Screen>
    );
  if (!q.data)
    return (
      <Screen header={<Header title="Ruang QC" />}>
        <StateMessage icon={Inbox} title="Run tidak ditemukan" body={q.error?.message ?? runId} />
      </Screen>
    );
  const d = q.data;
  const ntc = d.run.wells.filter((w) => w.sampleCode === 'NTC');
  const ntcFail = ntc.filter((w) => w.ct !== null && w.ct < 35);
  return (
    <Screen
      header={
        <Header title="Ruang QC run" context={`${fmtDate(d.run.date)} · ${d.run.instrument}`} />
      }
    >
      <Glass style={{ padding: space.xl - 4, gap: space.md }}>
        <View style={styles.rowBetween}>
          <View style={{ gap: 4 }}>
            <T v="caption" c="on-surface-muted">
              Efisiensi kurva standar
            </T>
            <T v="display-md">{fmt(d.curve.efficiencyPct, 2)}%</T>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            {gatePill(d.gate.status)}
            <SimBadge show={d.run.provenance === 'simulasi'} />
          </View>
        </View>
        {d.gate.reasons.map((r) => (
          <T key={r} v="body-sm" c="danger">
            {r}
          </T>
        ))}
        <View style={{ gap: space.sm }}>
          <Row
            label="R²"
            value={fmt(d.curve.r2, 4)}
            tone={d.curve.r2 < 0.98 ? 'danger' : undefined}
          />
          <Row label="Slope" value={fmt(d.curve.slope, 3)} />
          <Row
            label="NTC"
            value={ntcFail.length ? `${ntcFail.length} teramplifikasi` : `${ntc.length} bersih`}
            tone={ntcFail.length ? 'danger' : 'success'}
          />
          <Row
            label="Sampel ditolak"
            value={`${d.samples.filter((s) => s.gate.status === 'DITOLAK').length} dari ${d.samples.length}`}
          />
        </View>
      </Glass>
      <View style={styles.card}>
        <CardTitle
          title="Plate 96-well"
          right={
            <T v="caption" c="on-surface-muted">
              ketuk well
            </T>
          }
        />
        <PlateHeatmap
          wells={plateWells(d)}
          onPress={(id) => router.push(`/lab/run/${runId}/well/${id}`)}
          summary={`Plate ${d.run.wells.length} well; ${ntcFail.length} NTC gagal; ${d.run.wells.filter((w) => w.excluded).length} well dikeluarkan`}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Button
          label={`Lihat ${d.samples.length} sampel`}
          onPress={() => router.push(`/lab/run/${runId}/sampel`)}
          disabled={d.gate.status === 'DITOLAK'}
        />
        <Button
          kind="glass"
          label="Kurva standar"
          onPress={() => router.push(`/lab/run/${runId}/kurva`)}
        />
      </View>
    </Screen>
  );
}

/** P5 Kurva standar. */
export function CurveScreen({ runId }: { runId: string }) {
  const q = useRun(runId);
  if (!q.data)
    return (
      <Screen header={<Header title="Kurva standar" />}>
        {q.isPending ? (
          <Loading />
        ) : (
          <StateMessage icon={Inbox} title="Run tidak ditemukan" body={runId} />
        )}
      </Screen>
    );
  const { curve, run, gate } = q.data;
  return (
    <Screen header={<Header title="Kurva standar" context={fmtDate(run.date)} />}>
      <View style={styles.card}>
        <CardTitle
          title={`Efisiensi ${fmt(curve.efficiencyPct, 2)}%`}
          right={gatePill(gate.status)}
        />
        <StandardCurveChart
          points={run.standards}
          slope={curve.slope}
          intercept={curve.intercept}
          summary={`Kurva standar ${run.standards.length} titik, slope ${fmt(curve.slope, 2)}, R² ${fmt(curve.r2, 4)}, efisiensi ${fmt(curve.efficiencyPct, 2)} persen`}
        />
      </View>
      <View style={{ gap: space.sm }}>
        <Row label="Slope (m)" value={fmt(curve.slope, 3)} />
        <Row label="Intercept (b)" value={fmt(curve.intercept, 2)} />
        <Row label="R²" value={fmt(curve.r2, 4)} tone={curve.r2 < 0.98 ? 'danger' : undefined} />
        <Row
          label="Efisiensi"
          value={`${fmt(curve.efficiencyPct, 2)}% (syarat 90-110%)`}
          tone={gate.status === 'DITOLAK' ? 'danger' : 'success'}
        />
      </View>
      <T v="caption" c="on-surface-muted">
        N_rxn = 10^((b − Ct) / |m|). Kurva gagal → seluruh run ditolak (MIQE, sdri-v1 §3).
      </T>
    </Screen>
  );
}

const QUICK_REASONS = [
  'Kurva leleh ganda',
  'Ct pencilan replikat',
  'Gelembung di well',
  'Volume pipet kurang',
];

/** P6 Detail well + keluarkan well (alasan wajib, perubahan SDRI tampil sebelum disimpan). */
export function WellScreen({ runId, wellId }: { runId: string; wellId: string }) {
  const q = useRun(runId);
  const exclude = useExcludeWell();
  const [reason, setReason] = useState('');
  const d = q.data;
  const well = d?.run.wells.find((w) => w.id === wellId);
  const sample = d?.samples.find((s) => s.sample.code === well?.sampleCode)?.sample;
  const preview = useMemo(() => {
    if (!d || !well || !sample || well.excluded) return null;
    const ref = d.samples.find((s) => s.sample.role === 'acuan')?.sample;
    const score = (wells: typeof d.run.wells) =>
      evaluateSample(
        assembleSample({
          wells,
          code: sample.code,
          refCode: ref?.code ?? null,
          curve: d.curve,
          volumes: sample.volumes,
          chemistry: sample.chemistry,
          nanopore: sample.nanopore,
          refNanopore: ref?.nanopore ?? null,
        }),
      ).sdri?.value ?? null;
    return {
      before: score(d.run.wells),
      after: score(
        d.run.wells.map((w) =>
          w.id === wellId ? { ...w, excluded: { reason: 'pratinjau', at: '' } } : w,
        ),
      ),
    };
  }, [d, well, sample, wellId]);
  if (!d || !well)
    return (
      <Screen header={<Header title={`Well ${wellId}`} />}>
        {q.isPending ? (
          <Loading />
        ) : (
          <StateMessage icon={Inbox} title="Well tidak ditemukan" body={wellId} />
        )}
      </Screen>
    );
  const siblings = d.run.wells.filter(
    (w) => w.sampleCode === well.sampleCode && w.target === well.target,
  );
  return (
    <Screen
      header={<Header title={`Well ${wellId}`} context={`${well.sampleCode} · ${well.target}`} />}
    >
      <View style={{ gap: space.sm }}>
        <Row label="Ct" value={well.ct === null ? 'Tidak teramplifikasi' : fmt(well.ct, 2)} />
        <Row label="Tm" value={well.tm === null ? '-' : `${fmt(well.tm, 1)} °C`} />
        <Row
          label="Replikat"
          value={siblings
            .map(
              (w) =>
                `${w.id} ${w.ct === null ? 'ND' : fmt(w.ct, 2)}${w.excluded ? ' (dikeluarkan)' : ''}`,
            )
            .join(' · ')}
        />
      </View>
      {well.excluded ? (
        <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
          <T v="title">Well ini sudah dikeluarkan</T>
          <T v="body-sm" c="on-surface-muted">
            Alasan: {well.excluded.reason}. Tercatat di jejak bukti.
          </T>
        </Glass>
      ) : sample ? (
        <Glass style={{ padding: space.xl - 4, gap: space.md }}>
          <CardTitle title="Keluarkan dari perhitungan" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {QUICK_REASONS.map((r) => (
              <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
            ))}
          </View>
          <Field
            label="Alasan (wajib)"
            value={reason}
            onChangeText={setReason}
            placeholder="Tulis alasan"
            error={exclude.error?.message}
          />
          {preview ? (
            <T v="body-sm" c="on-surface-muted" accessibilityLiveRegion="polite">
              SDRI {sample.code}: {fmt(preview.before)} → <T v="label-md">{fmt(preview.after)}</T>
            </T>
          ) : null}
          <Button
            kind="danger"
            label={`Keluarkan well ${wellId} dari perhitungan`}
            disabled={!reason.trim()}
            loading={exclude.isPending}
            onPress={() => exclude.mutate({ runId, wellId, reason })}
          />
        </Glass>
      ) : (
        <T v="body-sm" c="on-surface-muted">
          Well kontrol ({well.sampleCode}) tidak dapat dikeluarkan dari sini.
        </T>
      )}
    </Screen>
  );
}

/** P7 Daftar sampel run. */
export function RunSamplesScreen({ runId }: { runId: string }) {
  const q = useRun(runId);
  return (
    <Screen
      header={<Header title="Sampel run" context={q.data ? fmtDate(q.data.run.date) : runId} />}
    >
      {q.isPending ? <Loading /> : null}
      {q.data?.samples.map((s) => (
        <Pressable
          key={s.sample.id}
          onPress={() => router.push(`/lab/sampel/${s.sample.id}`)}
          accessibilityRole="link"
          style={({ focused, pressed }: PressState) => [
            styles.tableRow,
            { paddingVertical: space.lg },
            focused && styles.focus,
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={{ gap: 4, flex: 1 }}>
            <T v="label-md">
              {s.sample.code} {s.sample.role === 'acuan' ? '· acuan' : ''}
            </T>
            <T v="caption" c="on-surface-muted" numberOfLines={2}>
              {s.gate.reasons[0] ?? 'Lolos semua gerbang QC'}
            </T>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <T v="title">{s.sdri === null ? '-' : fmt(s.sdri)}</T>
            {s.cls ? <RiskPill cls={s.cls} /> : gatePill(s.gate.status)}
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}

/** P13 Riwayat run. */
export function HistoryScreen() {
  const q = useRuns();
  const [filter, setFilter] = useState<'semua' | 'lulus' | 'ditolak'>('semua');
  const rows = (q.data ?? []).filter(
    (r) => filter === 'semua' || (filter === 'lulus') === (r.gate.status !== 'DITOLAK'),
  );
  return (
    <Screen nav={<Nav active="riwayat" />} header={<Header title="Riwayat run" back={false} />}>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {(['semua', 'lulus', 'ditolak'] as const).map((f) => (
          <Chip
            key={f}
            label={f[0].toUpperCase() + f.slice(1)}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>
      {q.isPending ? <Loading /> : null}
      {!q.isPending && rows.length === 0 ? (
        <StateMessage icon={Inbox} title="Tidak ada run" body="Belum ada run untuk filter ini." />
      ) : null}
      {rows.map((r) => (
        <Pressable
          key={r.run.id}
          onPress={() => router.push(`/lab/run/${r.run.id}`)}
          accessibilityRole="link"
          style={({ focused }: PressState) => [
            styles.tableRow,
            { paddingVertical: space.lg },
            focused && styles.focus,
          ]}
        >
          <View style={{ gap: 4 }}>
            <T v="label-md">{fmtDate(r.run.date)}</T>
            <T v="caption" c="on-surface-muted">
              {r.samples.length} sampel · {r.run.instrument}{' '}
              {r.run.provenance === 'simulasi' ? '· SIMULASI' : ''}
            </T>
          </View>
          {gatePill(r.gate.status)}
        </Pressable>
      ))}
    </Screen>
  );
}

/** P14 Panduan format CSV. */
export function FormatScreen() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (name: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(name);
  };
  return (
    <Screen
      nav={<Nav active="format" />}
      header={<Header title="Format CSV" context="AquaSeq v1" back={false} />}
    >
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <CardTitle title="qPCR: dua bagian dalam satu berkas" />
        <T v="body-sm">1. Well: well,sample_code,target,ct_rep,tm (satu baris per replikat)</T>
        <T v="body-sm">2. Kurva standar: std_level,copies_rxn,ct (minimal 3 titik)</T>
        <T v="body-sm" c="on-surface-muted">
          Target: pirA, vp28, swp1, amoA, 16S, PPC. Ct kosong atau Undetermined = tidak
          teramplifikasi. Kontrol run: sample_code NTC atau GDC, target = assay yang dikontrol.
        </T>
        <Button
          kind="glass"
          label={copied === 'qpcr' ? 'CSV contoh tersalin' : 'Salin CSV qPCR contoh'}
          onPress={() => copy('qpcr', exampleCsv())}
        />
      </Glass>
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <CardTitle title="Nanopore: tabel kelimpahan" />
        <T v="body-sm">sample_code,taxon,rank,read_count,abundance (ala EPI2ME wf-16s / Emu)</T>
        <T v="body-sm" c="on-surface-muted">
          Read dihitung di tingkat genus. Kurang dari 5.000 read: komponen mikroba dikosongkan dan
          sampel ditandai Tinjau.
        </T>
        <Button
          kind="glass"
          label={copied === 'np' ? 'CSV contoh tersalin' : 'Salin CSV Nanopore contoh'}
          onPress={() => copy('np', nanoporeExample('POND-TOX'))}
        />
      </Glass>
      <View style={[styles.card, { gap: space.xs }]}>
        <T v="label-caps" c="on-surface-muted">
          CONTOH
        </T>
        <T v="body-sm" selectable style={{ fontVariant: ['tabular-nums'] }}>
          {exampleCsv().split('\n').slice(0, 6).join('\n')}
        </T>
      </View>
    </Screen>
  );
}

/** Profil Nanopore contoh (SIMULASI) untuk mencoba unggahan P9. */
export function nanoporeExample(code: string) {
  const rows: [string, number][] = [
    ['Vibrio', 4200],
    ['Pseudoalteromonas', 1300],
    ['Rhodobacter', 2900],
    ['Ruegeria', 2100],
    ['Flavobacterium', 1500],
    ['Bacillus', 900],
    ['Alteromonas', 600],
  ];
  const total = rows.reduce((a, [, n]) => a + n, 0);
  return [
    'sample_code,taxon,rank,read_count,abundance',
    ...rows.map(([t, n]) => `${code},${t},genus,${n},${(n / total).toFixed(4)}`),
  ].join('\n');
}
