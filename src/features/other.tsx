import { router, useLocalSearchParams } from 'expo-router';
import { FlaskConical, Minus, Plus, RotateCcw, Waves } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useResetDemo } from '@/data/queries';
import { GSI_ARCHETYPES } from '@/data/seed/gsi-archetypes';
import { evaluateSample } from '@/engine/sdri';
import { BottomNav } from '@/ui/BottomNav';
import {
  Button,
  CardTitle,
  fmt,
  Glass,
  Header,
  IconButton,
  RiskPill,
  Row,
  Screen,
  SimBadge,
  styles,
  T,
  type PressState,
} from '@/ui/primitives';
import { color, radius, space } from '@/ui/theme/tokens';

/** P1 Pilih peran (demo, tanpa login). */
export function RoleScreen() {
  const roles = [
    {
      href: '/lab' as const,
      title: 'Analis lab',
      body: 'Unggah run qPCR, periksa QC, hitung SDRI, terbitkan laporan.',
      icon: FlaskConical,
    },
    {
      href: '/tambak' as const,
      title: 'Manajer tambak',
      body: 'Lihat risiko semua kolam, tren, peringatan, dan pesan WhatsApp.',
      icon: Waves,
    },
  ];
  return (
    <Screen>
      <View style={{ gap: space.sm, marginTop: space['2xl'], marginBottom: space.lg }}>
        <T v="display-lg" accessibilityRole="header">
          AquaSeq
        </T>
        <T v="body-md" c="on-surface-muted">
          Hasil lab air tambak udang menjadi skor risiko dan rekomendasi tindakan.
        </T>
      </View>
      {roles.map((r) => (
        <Pressable
          key={r.href}
          accessibilityRole="button"
          accessibilityLabel={`Masuk sebagai ${r.title}`}
          onPress={() => router.replace(r.href)}
          style={({ pressed, focused }: PressState) => [
            pressed && { transform: [{ scale: 0.98 }] },
            focused && styles.focus,
            { borderRadius: radius.xl },
          ]}
        >
          <Glass
            style={{ padding: space.xl, gap: space.sm, flexDirection: 'row', alignItems: 'center' }}
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
              <r.icon size={26} color={color['on-surface']} strokeWidth={1.75} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <T v="title">{r.title}</T>
              <T v="body-sm" c="on-surface-muted">
                {r.body}
              </T>
            </View>
          </Glass>
        </Pressable>
      ))}
      <View style={[styles.rowBetween, { marginTop: space.lg }]}>
        <SimBadge />
        <Button kind="glass" label="Tentang data" onPress={() => router.push('/tentang')} />
      </View>
      <T v="caption" c="on-surface-muted">
        Semua data di aplikasi demo ini adalah SIMULASI berbasis kerangka lab GSI.
      </T>
    </Screen>
  );
}

/** P22 Pengaturan. */
export function SettingsScreen() {
  const { peran } = useLocalSearchParams<{ peran?: string }>();
  const role = peran === 'tambak' ? 'tambak' : 'lab';
  const reset = useResetDemo();
  const [confirm, setConfirm] = useState(false);
  return (
    <Screen
      nav={<BottomNav role={role} active="atur" />}
      header={<Header title="Pengaturan" back={false} />}
    >
      <Glass style={{ padding: space.xl - 4, gap: space.md }}>
        <CardTitle
          title="Peran"
          right={<T v="label-md">{role === 'lab' ? 'Analis lab' : 'Manajer tambak'}</T>}
        />
        <Button
          kind="glass"
          label={role === 'lab' ? 'Ganti ke manajer tambak' : 'Ganti ke analis lab'}
          onPress={() => router.replace(role === 'lab' ? '/tambak' : '/lab')}
        />
      </Glass>
      <Glass style={{ padding: space.xl - 4, gap: space.md }}>
        <CardTitle title="Data demo" right={<SimBadge />} />
        <T v="body-sm" c="on-surface-muted">
          Mengembalikan 5 kolam dan 8 run mingguan SIMULASI. Run, kimia, Nanopore, well yang
          dikeluarkan, dan laporan yang kamu buat akan hilang.
        </T>
        {confirm ? (
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Button
              kind="danger"
              label="Ya, reset data demo"
              loading={reset.isPending}
              onPress={async () => {
                await reset.mutateAsync();
                setConfirm(false);
              }}
            />
            <Button kind="glass" label="Batal" onPress={() => setConfirm(false)} />
          </View>
        ) : (
          <Button
            kind="glass"
            icon={RotateCcw}
            label="Reset data demo"
            onPress={() => setConfirm(true)}
          />
        )}
        {reset.isSuccess ? (
          <T v="body-sm" c="success">
            Data demo sudah dikembalikan.
          </T>
        ) : null}
      </Glass>
      <Button
        kind="glass"
        label="Tentang data dan batas klaim"
        onPress={() => router.push('/tentang')}
      />
    </Screen>
  );
}

/** P23 Tentang & disclaimer. */
export function AboutScreen() {
  const items = [
    [
      'Status data',
      'Semua data di demo ini SIMULASI: 5 arketipe dari kerangka lab GSI dan riwayat sintetis. Bukan hasil uji lab nyata.',
    ],
    [
      'SDRI',
      'Shrimp Disease Risk Index 0-100 dengan 4 kelas. Ini indeks, bukan peluang wabah. Rumus dikunci sebagai SDRI v1; ambang bertanda kalibrasi akan disesuaikan dengan data pilot.',
    ],
    [
      'Decision support',
      'Kelas Kritis berarti segera konfirmasi pada sampel udang. AquaSeq bukan diagnosis resmi dan bukan sertifikat bebas penyakit (wewenang Karantina/KKP).',
    ],
    [
      'Hasil negatif',
      'Tidak terdeteksi pada satu sampel air belum berarti kolam bebas. Meter keyakinan memakai θ 0,45 dan p 0,85 dari studi eDNA lain, belum dikalibrasi untuk patogen udang.',
    ],
    [
      'Sinyal tren',
      'EWMA dipakai di biosurveilans; untuk udang belum divalidasi, jadi ditampilkan sebagai sinyal, bukan peringatan.',
    ],
    [
      'Lead time',
      'AquaSeq tidak mengklaim mendeteksi wabah sekian hari sebelum gejala. Chen dkk. (2017) menemukan toksin AHPND muncul di air setelah di udang.',
    ],
  ];
  return (
    <Screen header={<Header title="Tentang data" />}>
      <SimBadge />
      {items.map(([title, body]) => (
        <Glass key={title} style={{ padding: space.xl - 4, gap: space.sm }}>
          <T v="title">{title}</T>
          <T v="body-sm" c="on-surface-muted">
            {body}
          </T>
        </Glass>
      ))}
      <T v="caption" c="on-surface-muted">
        Rumus lengkap dan pustaka: docs/sdri-v1.md di repositori AquaSeq.
      </T>
    </Screen>
  );
}

const base = GSI_ARCHETYPES.find((a) => a.code === 'CTRL')!.input;

function Stepper({
  label,
  value,
  display,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 1000) / 1000)));
  return (
    <View style={styles.tableRow}>
      <T v="body-sm" c="on-surface-muted" style={{ flex: 1 }}>
        {label}
      </T>
      <IconButton icon={Minus} label={`Kurangi ${label}`} onPress={() => set(value - step)} />
      <T
        v="label-md"
        style={{ minWidth: 76, textAlign: 'center' }}
        accessibilityLiveRegion="polite"
      >
        {display}
      </T>
      <IconButton icon={Plus} label={`Tambah ${label}`} onPress={() => set(value + step)} />
    </View>
  );
}

/** P24 Simulator skenario (Could): geser input, SDRI dihitung langsung oleh engine. */
export function SimulatorScreen() {
  const [ct, setCt] = useState(36);
  const [tan, setTan] = useState(0.25);
  const [dissolvedO2, setDo] = useState(6.4);
  const [tom, setTom] = useState(34.5);
  const [fr, setFr] = useState(1);
  const input = {
    ...base,
    cts: { pirA: ct >= 35 ? null : ct, vp28: null, swp1: null },
    chemistry: { ...base.chemistry!, tan, dissolvedO2, tom },
    foldRegulation: fr,
  };
  const r = evaluateSample(input);
  return (
    <Screen header={<Header title="Simulator skenario" />}>
      <Glass style={{ padding: space.xl - 4, gap: space.sm }}>
        <View style={styles.rowBetween}>
          <T v="caption" c="on-surface-muted">
            SDRI skenario
          </T>
          <SimBadge />
        </View>
        <T v="display-xl" accessibilityLiveRegion="polite">
          {fmt(r.sdri?.value)}
        </T>
        {r.sdri ? <RiskPill cls={r.sdri.cls} /> : null}
      </Glass>
      <View style={{ gap: space.sm }}>
        <Stepper
          label="Ct pirA"
          value={ct}
          display={ct >= 35 ? 'ND' : fmt(ct, 1)}
          step={1}
          min={16}
          max={35}
          onChange={setCt}
        />
        <Stepper
          label="TAN (mg/L)"
          value={tan}
          display={fmt(tan, 2)}
          step={0.25}
          min={0}
          max={5}
          onChange={setTan}
        />
        <Stepper
          label="DO (mg/L)"
          value={dissolvedO2}
          display={fmt(dissolvedO2, 1)}
          step={0.5}
          min={1}
          max={9}
          onChange={setDo}
        />
        <Stepper
          label="TOM (mg/L)"
          value={tom}
          display={fmt(tom, 0)}
          step={10}
          min={10}
          max={160}
          onChange={setTom}
        />
        <Stepper
          label="Fold regulation amoA"
          value={fr}
          display={fmt(fr, 1)}
          step={1}
          min={-8}
          max={4}
          onChange={setFr}
        />
      </View>
      {r.components.patho ? (
        <Row
          label="Patogen / Kimia / Nitrifikasi"
          value={`${fmt(r.components.patho.value, 0)} / ${fmt(r.components.chem?.value, 0)} / ${fmt(r.components.nitri?.value, 0)}`}
        />
      ) : null}
      <T v="caption" c="on-surface-muted">
        Titik awal: sampel CTRL. Skenario untuk demo, bukan hasil lab.
      </T>
    </Screen>
  );
}
