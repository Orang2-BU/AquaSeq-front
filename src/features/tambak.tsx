import * as Clipboard from 'expo-clipboard';
import { type Href, router } from 'expo-router';
import {
  ArrowLeftRight,
  BellOff,
  ChartSpline,
  FileText,
  GitBranch,
  Info,
  MessageCircle,
  SlidersHorizontal,
  Waves,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useAlerts, usePond, usePonds, useResolveAlert, useSample } from '@/data/queries';
import type { PondSummary } from '@/data/types';
import { negativeConfidence } from '@/engine/confidence';
import { ewma } from '@/engine/ewma';
import type { Pathogen } from '@/engine/types';
import { BottomNav } from '@/ui/BottomNav';
import { TrendChart } from '@/ui/charts';
import {
  Button,
  CardTitle,
  Chip,
  fmt,
  fmtCopies,
  fmtDate,
  Glass,
  Header,
  IconButton,
  Loading,
  Meter,
  RiskPill,
  Row,
  Screen,
  SimBadge,
  StateMessage,
  styles,
  T,
  type PressState,
} from '@/ui/primitives';
import { color, radius, space } from '@/ui/theme/tokens';

import { ACTION, classOf, reasonOf, waMessage } from './report-text';
import { WaterCard } from './shared';

const reportHref = (sampleId: string) => `/tambak/laporan/RPT-${sampleId}` as Href;

function useAlertBadge() {
  return useAlerts().data?.filter((a) => !a.resolved).length ?? 0;
}

function Nav({ active }: { active: string }) {
  return <BottomNav role="tambak" active={active} badge={useAlertBadge()} />;
}

/** Ucapan sesuai jam lokal. */
const greeting = () => {
  const h = new Date().getHours();
  return h < 11
    ? 'Selamat pagi'
    : h < 15
      ? 'Selamat siang'
      : h < 18
        ? 'Selamat sore'
        : 'Selamat malam';
};

export function HubHeader({
  who,
  initials,
  role,
}: {
  who: string;
  initials: string;
  role: string;
}) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
  return (
    <View style={[styles.rowBetween, { marginBottom: space.xs }]}>
      <View style={{ flex: 1 }}>
        <T v="caption" c="on-surface-muted">
          {today} · {role}
        </T>
        <T v="headline" accessibilityRole="header">
          {greeting()}, {who}
        </T>
      </View>
      <IconButton icon={ArrowLeftRight} label="Ganti peran" onPress={() => router.replace('/')} />
      <Glass
        r={radius.full}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: space.sm,
        }}
      >
        <T v="label-md">{initials}</T>
      </Glass>
    </View>
  );
}

export function Shortcuts({
  items,
}: {
  items: { icon: typeof Waves; label: string; href: Href }[];
}) {
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: space.sm }}
      accessibilityRole="menu"
    >
      {items.map(({ icon: Icon, label, href }) => (
        <Pressable
          key={label}
          onPress={() => router.push(href)}
          accessibilityRole="link"
          accessibilityLabel={label}
          style={({ focused }: PressState) => [
            { flex: 1, alignItems: 'center', gap: 6 },
            focused && styles.focus,
          ]}
        >
          <View
            style={[
              styles.glassButton,
              {
                width: 60,
                height: 60,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color['glass-strong'],
              },
            ]}
          >
            <Icon size={26} color={color['on-surface']} strokeWidth={1.75} />
          </View>
          <T v="label-sm" style={{ textAlign: 'center' }}>
            {label}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

function PondTile({ row, big }: { row: PondSummary; big?: boolean }) {
  const d = row.latest;
  const cls = d ? classOf(d) : null;
  const label = d
    ? `${row.pond.name}, ${d.evaluation.sdri ? `SDRI ${fmt(d.evaluation.sdri.value)}` : 'sampel ditolak'}, ${cls}`
    : `${row.pond.name}, belum ada sampel`;
  return (
    <Pressable
      onPress={() => router.push(`/tambak/kolam/${row.pond.id}`)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed, focused }: PressState) => [
        {
          backgroundColor: color['surface-raised'],
          borderRadius: radius.md,
          padding: space.md,
          boxShadow: '0 1px 2px rgba(13,14,16,0.05)',
          flexBasis: big ? '100%' : '47%',
          flexGrow: 1,
          gap: space.xs,
        },
        big && { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        pressed && { transform: [{ scale: 0.98 }] },
        focused && styles.focus,
      ]}
    >
      <View style={{ gap: space.xs, flexShrink: 1 }}>
        <T v="label-md" numberOfLines={1}>
          {row.pond.name}
        </T>
        {big && d ? (
          <T v="caption" c="on-surface-muted" numberOfLines={2}>
            DOC {d.sample.doc ?? '-'} · {reasonOf(d)}
          </T>
        ) : null}
        {!big ? (
          <T v="display-md" style={{ fontVariant: ['tabular-nums'] }}>
            {d?.evaluation.sdri ? fmt(d.evaluation.sdri.value) : '-'}
          </T>
        ) : null}
        {cls ? <RiskPill cls={cls} /> : <T v="caption">Belum ada sampel</T>}
      </View>
      {big ? (
        <T v="display-lg" style={{ fontVariant: ['tabular-nums'] }}>
          {d?.evaluation.sdri ? fmt(d.evaluation.sdri.value) : '-'}
        </T>
      ) : null}
    </Pressable>
  );
}

/** P15 Beranda tambak (hub). */
export function TambakHub() {
  const ponds = usePonds();
  const alerts = useAlerts();
  const rows = ponds.data ?? [];
  const top = alerts.data?.find((a) => !a.resolved);
  const topDetail = rows.find((r) => r.pond.id === top?.pond.id)?.latest;
  const week = rows.filter((r) => r.latest).length;
  const rejected = rows.filter((r) => r.latest && !r.latest.evaluation.sdri).length;
  return (
    <Screen
      nav={<Nav active="beranda" />}
      header={<HubHeader who="Manajer" initials="MT" role="Manajer tambak" />}
    >
      {ponds.isPending ? <Loading /> : null}
      {ponds.error ? (
        <StateMessage
          icon={BellOff}
          title="Data kolam gagal dimuat"
          body={ponds.error.message}
          action={<Button label="Coba lagi" onPress={() => ponds.refetch()} />}
        />
      ) : null}
      {rows.length ? (
        <Glass style={{ padding: space.xl - 4, gap: space.md }}>
          <CardTitle
            title={`Status ${rows.length} kolam`}
            right={<SimBadge show={rows.some((r) => r.pond.provenance === 'simulasi')} />}
          />
          <T v="caption" c="on-surface-muted" style={{ marginTop: -space.sm }}>
            Tambak Sumberejo, Banyuwangi · diurutkan dari risiko tertinggi
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {rows.slice(0, 5).map((r, i) => (
              <PondTile key={r.pond.id} row={r} big={i === 0} />
            ))}
          </View>
          <T v="body-sm" c="on-surface-muted">
            <T v="label-md">{week}</T> sampel terbaru · <T v="label-md">{rejected}</T> ditolak, uji
            ulang
          </T>
        </Glass>
      ) : null}
      <Shortcuts
        items={[
          {
            icon: Waves,
            label: 'Kolam teratas',
            href: `/tambak/kolam/${rows[0]?.pond.id ?? 'B-03'}`,
          },
          { icon: SlidersHorizontal, label: 'Simulator', href: '/simulator' },
          { icon: FileText, label: 'Laporan', href: '/tambak/laporan' },
          { icon: Info, label: 'Tentang data', href: '/tentang' },
        ]}
      />
      {top && topDetail ? (
        <Glass
          style={{
            padding: space.xl - 4,
            gap: space.sm,
            ...(top.cls === 'Kritis' ? { borderColor: 'rgba(192,38,45,0.25)' } : null),
          }}
        >
          <View style={styles.rowBetween}>
            <T v="label-md">{top.pond.name}</T>
            <RiskPill cls={top.cls} />
          </View>
          <T v="title">{ACTION[top.cls].title}</T>
          <T v="body-sm" c="on-surface-muted">
            {reasonOf(topDetail)}. {ACTION[top.cls].body}
          </T>
          <View
            style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', marginTop: space.xs }}
          >
            <Button
              label={`Buka ${top.pond.name}`}
              onPress={() => router.push(`/tambak/kolam/${top.pond.id}`)}
            />
            {topDetail.report ? (
              <Button
                kind="glass"
                label="Pratinjau WA"
                onPress={() => router.push(`${reportHref(top.sampleId)}/wa` as Href)}
              />
            ) : null}
          </View>
        </Glass>
      ) : null}
    </Screen>
  );
}

/** P16 Detail kolam. */
export function PondDetailScreen({ pondId }: { pondId: string }) {
  const q = usePond(pondId);
  if (q.isPending)
    return (
      <Screen header={<Header title="Kolam" />}>
        <Loading />
      </Screen>
    );
  if (q.error || !q.data)
    return (
      <Screen header={<Header title="Kolam" />}>
        <StateMessage
          icon={BellOff}
          title="Kolam tidak ditemukan"
          body={q.error?.message ?? pondId}
        />
      </Screen>
    );
  const { pond, latest, history, ndStreak } = q.data;
  const scored = history.filter((h) => h.sdri !== null);
  const trend = ewma(scored.map((h) => h.sdri!));
  const ucl = history.map((h) => trend[scored.indexOf(h)]?.ucl ?? null);
  const signals = history.map((h) => trend[scored.indexOf(h)]?.signal ?? false);
  const cls = latest ? classOf(latest) : null;
  const firstSdri = scored[0]?.sdri;
  return (
    <Screen
      header={
        <Header
          title={pond.name}
          context={`Tambak Sumberejo · ${pond.system}`}
          right={
            latest?.report ? (
              <IconButton
                icon={MessageCircle}
                label="Pratinjau WhatsApp"
                onPress={() => router.push(`${reportHref(latest.sample.id)}/wa` as Href)}
              />
            ) : undefined
          }
        />
      }
    >
      {!latest ? (
        <StateMessage
          icon={Waves}
          title="Belum ada sampel"
          body="Kolam ini belum punya hasil lab."
        />
      ) : (
        <>
          <WaterCard
            detail={latest}
            actions={[
              {
                icon: GitBranch,
                label: 'Jejak',
                onPress: () => router.push(`/lab/sampel/${latest.sample.id}/jejak`),
              },
              {
                icon: FileText,
                label: 'Laporan',
                onPress: () =>
                  router.push(
                    latest.report
                      ? reportHref(latest.sample.id)
                      : `/lab/sampel/${latest.sample.id}/laporan`,
                  ),
              },
              {
                icon: MessageCircle,
                label: 'Bagikan WA',
                onPress: () =>
                  router.push(
                    latest.report
                      ? (`${reportHref(latest.sample.id)}/wa` as Href)
                      : `/lab/sampel/${latest.sample.id}/laporan`,
                  ),
              },
              {
                icon: ChartSpline,
                label: 'Patogen',
                onPress: () => router.push(`/tambak/kolam/${pond.id}/patogen/pirA`),
              },
            ]}
          />
          {cls ? (
            <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
              <T v="label-sm" c="on-surface-muted">
                Tindakan
              </T>
              <T v="title">{ACTION[cls].title}</T>
              <T v="body-sm" c="on-surface-muted">
                {reasonOf(latest)}. {ACTION[cls].body}
              </T>
            </Glass>
          ) : null}
          <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
            <CardTitle
              title="Tren SDRI"
              right={
                <T v="caption" c="on-surface-muted">
                  {history.length} sampel mingguan
                </T>
              }
            />
            <TrendChart
              points={history.map((h) => ({
                label: fmtDate(h.takenAt).replace(/ \d{4}$/, ''),
                value: h.sdri,
              }))}
              ucl={ucl}
              signals={signals}
              summary={`SDRI ${pond.name} dari ${fmt(firstSdri)} ke ${fmt(latest.evaluation.sdri?.value)} dalam ${history.length} minggu${signals.some(Boolean) ? ', ada sinyal tren naik' : ''}`}
            />
            <T v="caption" c="on-surface-muted">
              Sinyal tren = EWMA melewati batas kontrol (garis merah putus-putus). Metode
              biosurveilans, belum divalidasi untuk udang.
            </T>
          </Glass>
          <Glass style={{ padding: space.xl - 4, gap: space.md }}>
            <CardTitle title="Keyakinan hasil negatif" />
            {(['pirA', 'vp28', 'swp1'] as Pathogen[]).filter((p) => ndStreak[p] > 0).length ===
            0 ? (
              <T v="body-sm" c="on-surface-muted">
                Semua patogen terdeteksi pada sampel terakhir.
              </T>
            ) : (
              (['pirA', 'vp28', 'swp1'] as Pathogen[])
                .filter((p) => ndStreak[p] > 0)
                .map((p) => {
                  const c = negativeConfidence(ndStreak[p], 3);
                  return (
                    <View key={p} style={{ gap: space.sm }}>
                      <View style={styles.rowBetween}>
                        <T v="label-md">
                          {p} tidak terdeteksi · {ndStreak[p]} sampel
                        </T>
                        <T v="display-md">{fmt(c.value * 100, 0)}%</T>
                      </View>
                      <Meter value={c.value} label={`Keyakinan ${fmt(c.value * 100, 0)} persen`} />
                      {c.value < 0.95 ? (
                        <T v="caption" c="on-surface-muted">
                          Tidak terdeteksi belum berarti kolam bebas. Butuh {c.samplesFor95} sampel
                          berturut-turut untuk ≥ 95%.
                        </T>
                      ) : null}
                    </View>
                  );
                })
            )}
          </Glass>
        </>
      )}
    </Screen>
  );
}

const LABEL: Record<Pathogen, string> = {
  pirA: 'pirA (AHPND)',
  vp28: 'vp28 (WSSV)',
  swp1: 'swp1 (EHP)',
};

/** P17 Detail patogen. */
export function PathogenScreen({ pondId, target }: { pondId: string; target: Pathogen }) {
  const q = usePond(pondId);
  const [t, setT] = useState<Pathogen>(target);
  if (q.isPending)
    return (
      <Screen header={<Header title="Patogen" />}>
        <Loading />
      </Screen>
    );
  if (!q.data)
    return (
      <Screen header={<Header title="Patogen" />}>
        <StateMessage icon={BellOff} title="Kolam tidak ditemukan" body={pondId} />
      </Screen>
    );
  const { pond, history, ndStreak } = q.data;
  const logs = history.map((h) => ({
    label: fmtDate(h.takenAt).replace(/ \d{4}$/, ''),
    value: h.copiesMl[t] === null ? null : Math.log10(h.copiesMl[t]!),
  }));
  const last = history.at(-1)?.copiesMl[t] ?? null;
  return (
    <Screen header={<Header title={LABEL[t]} context={pond.name} />}>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {(['pirA', 'vp28', 'swp1'] as Pathogen[]).map((p) => (
          <Chip key={p} label={LABEL[p]} selected={p === t} onPress={() => setT(p)} />
        ))}
      </View>
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <T v="caption" c="on-surface-muted">
          Nilai terakhir
        </T>
        <T v="display-md">{fmtCopies(last)}</T>
        {logs.some((l) => l.value !== null) ? (
          <TrendChart
            points={logs}
            max={5}
            summary={`Riwayat log10 copies/mL ${t} di ${pond.name}, terakhir ${fmtCopies(last)}`}
          />
        ) : (
          <T v="body-sm" c="on-surface-muted">
            {t} tidak terdeteksi pada {history.length} sampel.
          </T>
        )}
        <T v="caption" c="on-surface-muted">
          Sumbu: log10 copies/mL air. Chen dkk. (2017) mencatat 10^1,6 copies/mL saat AHPND mulai.
        </T>
      </Glass>
      {ndStreak[t] > 0 ? (
        <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
          <CardTitle
            title="Keyakinan hasil negatif"
            right={<T v="display-md">{fmt(negativeConfidence(ndStreak[t], 3).value * 100, 0)}%</T>}
          />
          <Meter value={negativeConfidence(ndStreak[t], 3).value} label="Meter keyakinan" />
        </Glass>
      ) : null}
      <View style={{ gap: space.sm }}>
        {[...history].reverse().map((h) => (
          <Row key={h.sampleId} label={fmtDate(h.takenAt)} value={fmtCopies(h.copiesMl[t])} />
        ))}
      </View>
    </Screen>
  );
}

/** P18 Pusat peringatan. */
export function AlertsScreen() {
  const q = useAlerts();
  const resolve = useResolveAlert();
  const ponds = usePonds();
  return (
    <Screen
      nav={<Nav active="peringatan" />}
      header={<Header title="Peringatan" context="Kolam Waspada dan Kritis" back={false} />}
    >
      {q.isPending ? <Loading /> : null}
      {q.data?.length === 0 ? (
        <StateMessage
          icon={BellOff}
          title="Tidak ada peringatan"
          body="Semua kolam di bawah kelas Waspada."
        />
      ) : null}
      {q.data?.map((a) => {
        const d = ponds.data?.find((p) => p.pond.id === a.pond.id)?.latest;
        return (
          <Glass
            key={a.id}
            style={{ padding: space.xl - 4, gap: space.sm, opacity: a.resolved ? 0.7 : 1 }}
          >
            <View style={styles.rowBetween}>
              <T v="title">{a.pond.name}</T>
              <RiskPill cls={a.cls} />
            </View>
            <T v="body-sm" c="on-surface-muted">
              SDRI {fmt(a.sdri)} · {fmtDate(a.takenAt)}
              {d ? ` · ${reasonOf(d)}` : ''}
            </T>
            <T v="label-md">{ACTION[a.cls].title}</T>
            <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
              <Button
                label="Buka kolam"
                onPress={() => router.push(`/tambak/kolam/${a.pond.id}`)}
              />
              {a.resolved ? (
                <T v="label-md" c="success" style={{ alignSelf: 'center' }}>
                  Sudah ditangani
                </T>
              ) : (
                <Button
                  kind="glass"
                  label="Tandai ditangani"
                  loading={resolve.isPending && resolve.variables === a.id}
                  onPress={() => resolve.mutate(a.id)}
                />
              )}
            </View>
          </Glass>
        );
      })}
    </Screen>
  );
}

/** Daftar laporan terbit (tab Laporan manajer). */
export function ReportListScreen() {
  const ponds = usePonds();
  const rows = (ponds.data ?? []).filter((r) => r.latest?.report);
  return (
    <Screen
      nav={<Nav active="laporan" />}
      header={<Header title="Laporan terbit" context="Sampel terbaru tiap kolam" back={false} />}
    >
      {ponds.isPending ? <Loading /> : null}
      {!ponds.isPending && rows.length === 0 ? (
        <StateMessage
          icon={FileText}
          title="Belum ada laporan terbit"
          body="Laporan muncul setelah analis menerbitkannya."
        />
      ) : null}
      {rows.map((r) => (
        <Pressable
          key={r.pond.id}
          onPress={() => router.push(reportHref(r.latest!.sample.id))}
          accessibilityRole="link"
          style={({ focused }: PressState) => [styles.tableRow, focused && styles.focus]}
        >
          <View style={{ gap: 4 }}>
            <T v="label-md">{r.pond.name}</T>
            <T v="caption" c="on-surface-muted">
              Sampel {fmtDate(r.latest!.sample.takenAt)} · terbit{' '}
              {fmtDate(r.latest!.report!.publishedAt)}
            </T>
          </View>
          <RiskPill cls={classOf(r.latest!)} />
        </Pressable>
      ))}
    </Screen>
  );
}

const sampleOfReport = (reportId: string) => reportId.replace(/^RPT-/, '');

/** P19 Laporan sampel (baca). */
export function ReportScreen({ reportId }: { reportId: string }) {
  const q = useSample(sampleOfReport(reportId));
  if (q.isPending)
    return (
      <Screen header={<Header title="Laporan" />}>
        <Loading />
      </Screen>
    );
  if (!q.data?.report)
    return (
      <Screen header={<Header title="Laporan" />}>
        <StateMessage
          icon={FileText}
          title="Laporan belum terbit"
          body="Analis belum menerbitkan laporan sampel ini."
        />
      </Screen>
    );
  const d = q.data;
  const c = d.evaluation.components;
  const cls = classOf(d);
  return (
    <Screen
      header={
        <Header
          title={`Laporan ${d.pond.name}`}
          context={`Terbit ${fmtDate(d.report!.publishedAt)} · ${d.report!.publishedBy}`}
        />
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
            icon: MessageCircle,
            label: 'Pratinjau WA',
            onPress: () => router.push(`${reportHref(d.sample.id)}/wa` as Href),
          },
        ]}
      />
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <T v="title">{ACTION[cls].title}</T>
        <T v="body-sm" c="on-surface-muted">
          {reasonOf(d)}. {ACTION[cls].body}
        </T>
      </Glass>
      <View style={{ gap: space.sm }}>
        {c.patho?.perTarget.map((t) => (
          <Row key={t.target} label={LABEL[t.target]} value={fmtCopies(t.copiesMl)} />
        ))}
        {d.nh3 !== null ? <Row label="NH3-N bebas" value={`${fmt(d.nh3, 4)} mg/L`} /> : null}
        <Row label="Versi rumus" value={d.evaluation.sdri?.version ?? 'sdri-v1'} />
      </View>
      <Button
        label="Pratinjau pesan WhatsApp"
        onPress={() => router.push(`${reportHref(d.sample.id)}/wa` as Href)}
      />
    </Screen>
  );
}

/** P20 Pratinjau WhatsApp. */
export function WaScreen({ reportId }: { reportId: string }) {
  const q = useSample(sampleOfReport(reportId));
  const [copied, setCopied] = useState(false);
  if (q.isPending)
    return (
      <Screen header={<Header title="WhatsApp" />}>
        <Loading />
      </Screen>
    );
  if (!q.data)
    return (
      <Screen header={<Header title="WhatsApp" />}>
        <StateMessage icon={MessageCircle} title="Sampel tidak ditemukan" body={reportId} />
      </Screen>
    );
  const text = waMessage(q.data);
  return (
    <Screen
      header={<Header title="Pratinjau WhatsApp" context={`Untuk petambak ${q.data.pond.name}`} />}
    >
      <View
        style={{
          alignSelf: 'flex-end',
          maxWidth: '92%',
          backgroundColor: '#DCF8C6',
          borderRadius: radius.lg,
          borderBottomRightRadius: 6,
          padding: space.lg,
          boxShadow: '0 1px 2px rgba(13,14,16,0.08)',
        }}
      >
        <T v="body-md" selectable>
          {text}
        </T>
      </View>
      <T v="caption" c="on-surface-muted" style={{ textAlign: 'right' }}>
        {text.length}/600 karakter · dikirim manual (pengiriman WhatsApp otomatis di luar MVP)
      </T>
      <Button
        label={copied ? 'Tersalin' : `Salin pesan untuk petambak ${q.data.pond.name}`}
        onPress={async () => {
          await Clipboard.setStringAsync(text);
          setCopied(true);
        }}
      />
    </Screen>
  );
}

/** P21 Banding kolam. */
export function CompareScreen() {
  const q = usePonds();
  const [picked, setPicked] = useState<string[]>([]);
  const rows = q.data ?? [];
  const ids = picked.length ? picked : rows.slice(0, 2).map((r) => r.pond.id);
  const chosen = rows.filter((r) => ids.includes(r.pond.id));
  const toggle = (id: string) =>
    setPicked((cur) => {
      const base = cur.length ? cur : ids;
      if (base.includes(id)) return base.filter((x) => x !== id);
      return base.length >= 4 ? base : [...base, id];
    });
  const val = (
    r: PondSummary,
    f: (d: NonNullable<PondSummary['latest']>) => number | null | undefined,
  ) => (r.latest ? fmt(f(r.latest) ?? null, 0) : '-');
  return (
    <Screen
      nav={<Nav active="banding" />}
      header={<Header title="Banding kolam" context="Pilih 2-4 kolam" back={false} />}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {rows.map((r) => (
          <Chip
            key={r.pond.id}
            label={r.pond.name}
            selected={ids.includes(r.pond.id)}
            onPress={() => toggle(r.pond.id)}
          />
        ))}
      </View>
      {chosen.length < 2 ? (
        <StateMessage
          icon={ArrowLeftRight}
          title="Pilih minimal 2 kolam"
          body="Ketuk chip kolam di atas."
        />
      ) : null}
      {chosen.length >= 2
        ? [
            [
              'SDRI',
              (r: PondSummary) =>
                r.latest?.evaluation.sdri ? fmt(r.latest.evaluation.sdri.value) : 'Ditolak',
            ],
            ['Patogen', (r: PondSummary) => val(r, (d) => d.evaluation.components.patho?.value)],
            ['Kimia', (r: PondSummary) => val(r, (d) => d.evaluation.components.chem?.value)],
            [
              'Nitrifikasi',
              (r: PondSummary) => val(r, (d) => d.evaluation.components.nitri?.value),
            ],
            ['DOC', (r: PondSummary) => String(r.latest?.sample.doc ?? '-')],
          ].map(([label, f]) => (
            <Glass key={label as string} style={{ padding: space.lg, gap: space.sm }}>
              <T v="label-sm" c="on-surface-muted">
                {label as string}
              </T>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                {chosen.map((r) => (
                  <View key={r.pond.id} style={{ flex: 1, gap: 2 }}>
                    <T v="caption" c="on-surface-muted" numberOfLines={1}>
                      {r.pond.name}
                    </T>
                    <T v="title">{(f as (r: PondSummary) => string)(r)}</T>
                    {label === 'SDRI' && r.latest ? <RiskPill cls={classOf(r.latest)} /> : null}
                  </View>
                ))}
              </View>
            </Glass>
          ))
        : null}
    </Screen>
  );
}
