import { createHash, randomBytes, scryptSync } from "node:crypto";
import type { Activity, Cycle, Farm, Notifications, Role, SampleFeatures, SdriResult, TaskDetail, Well } from "..";

// Store mock: data SIMULASI di memori server (API_MODE=mock), direset saat server restart.
// Semua angka skor berasal dari tabel seed atau tabel arketipe, bukan dari rumus backend (03-ARCHITECTURE Q5).

export const INVITATION_TTL_DAYS = 7;
export const DAY_MS = 86_400_000;

export interface MockUser {
  id: string;
  full_name: string;
  email: string;
  phone_wa: string | null;
  passwordHash: string;
}

export type MockFarm = Pick<Farm, "id" | "name" | "regency" | "address" | "provenance" | "archived_at"> & {
  owner_id: string;
};

export interface MockPond {
  id: string;
  farm_id: string;
  pond_code: string;
  name: string | null;
  system: "intensif" | "bioflok";
  area_sqm: number | null;
  current_cycle: number;
  stocked_at: string;
  assignee_id: string | null;
  wa_target: string | null;
  archived_at: string | null;
}

export interface MockSample {
  id: string;
  pond_id: string;
  batch_id: string | null;
  sample_code: string;
  sampling_date: string;
  cycle_day: number;
  features: SampleFeatures;
  wells: Well[];
  water_log_id: string | null;
  status: SdriResult["status"];
  probability_pct: number;
  /** 1-4, 0 bila ditolak. */
  risk_class: number;
  copies: { ahpnd: number | null; wssv: number | null; ehp: number | null };
  nh3_mg_l: number | null;
}

interface MockBatch {
  id: string;
  farm_id: string;
  lab_name: string;
  instrument: string;
  tested_at: string;
  file_name: string;
  created_at: string;
  /** Kontrol run (NTC) di plate yang sama. */
  control_wells: (Well & { sample_code: string })[];
}

export interface MockWaterLog {
  id: string;
  pond_id: string;
  measured_at: string;
  temp_c: number;
  ph: number;
  do_mg_l: number;
  tan_mg_l: number;
  no2_mg_l: number | null;
  h2s_mg_l: number | null;
  tom_mg_l: number | null;
  alkalinity: number | null;
  salinity_ppt: number | null;
  transparency_cm: number | null;
  nh3_mg_l: number;
  recorded_by: string;
}

export interface MockTask {
  id: string;
  farm_id: string;
  pond_id: string;
  assignee_id: string;
  created_by: string;
  kind: TaskDetail["kind"];
  title: string;
  instruction: string;
  due_at: string;
  status: TaskDetail["status"];
  owner_note: string | null;
  source_sample_id: string | null;
  source_alert_id: string | null;
  created_at: string;
  reports: {
    id: string;
    note: string;
    measured: Record<string, number> | null;
    photo_ids: string[];
    reported_by: string;
    reported_at: string;
  }[];
  history: { status: TaskDetail["status"]; by: string; note: string | null; at: string }[];
}

export interface MockInvitation {
  id: string;
  farm_id: string;
  email: string;
  pond_ids: string[];
  expires_at: string;
  /** Token undangan hanya disimpan sebagai sha256, seperti backend. */
  token_hash: string;
  accepted_at: string | null;
  revoked_at: string | null;
}

export interface Store {
  users: MockUser[];
  farms: MockFarm[];
  memberships: { user_id: string; farm_id: string; role: Role; active: boolean }[];
  ponds: MockPond[];
  samples: MockSample[];
  batches: MockBatch[];
  waterLogs: MockWaterLog[];
  tasks: MockTask[];
  acked: Map<string, string>;
  cycles: (Cycle & { pond_id: string })[];
  notifications: (Notifications["items"][number] & { user_id: string })[];
  activity: (Omit<Activity, "actor"> & { farm_id: string; actor_id: string })[];
  invitations: MockInvitation[];
  access: Map<string, { userId: string; expiresAt: number }>;
  refresh: Map<string, string>;
  models: {
    version: string;
    status: "kandidat" | "aktif" | "arsip";
    metrics: Record<string, number | string>;
    n_labels: number;
    synthetic: boolean;
    trained_at?: string;
    promoted_at?: string | null;
    promoted_by?: string | null;
    note?: string | null;
  }[];
}

/** Teks backend per kelas (`internal/sdri/engine.go`: gerbang PPC dan classifyRisk). */
export const BACKEND_TEXT: Record<number, { risk_level: string; recommendation: string }> = {
  0: {
    risk_level: "INVALID_PPC",
    recommendation: "Uji PCR terhambat (PPC abnormal). Sampel wajib diulang/ekstraksi ulang sebelum dievaluasi.",
  },
  1: { risk_level: "AMAN", recommendation: "Kondisi optimal. Lanjutkan sampling rutin." },
  2: { risk_level: "WASPADA_RINGAN", recommendation: "Pola awal fluktuasi air. Pantau kestabilan DO dan aerasi." },
  3: {
    risk_level: "WASPADA_TINGGI",
    recommendation: "Deviasi patogen/bioindikator signifikan. Kurangi pakan 20% dan siphon dasar petak.",
  },
  4: {
    risk_level: "BAHAYA",
    recommendation:
      "Beban patogen kritis / wabah imminent. Isolasi saluran buang, desinfeksi terkontrol, dan mitigasi darurat.",
  },
};

/** Arketipe simulasi per kelas: subskor, Ct pirA, kopi/mL. Bukan hasil rumus. */
export const ARCHETYPES: Record<
  number,
  { sub: [number, number, number]; pirA: number | null; copies: MockSample["copies"]; chem: number }
> = {
  0: { sub: [1.4, 1.1, 1.2], pirA: null, copies: { ahpnd: null, wssv: null, ehp: null }, chem: 1 },
  1: { sub: [1.1, 1.3, 1.2], pirA: null, copies: { ahpnd: null, wssv: null, ehp: null }, chem: 1 },
  2: { sub: [2.2, 1.6, 1.5], pirA: 34.6, copies: { ahpnd: 410, wssv: null, ehp: null }, chem: 2 },
  3: { sub: [2.6, 2.1, 1.9], pirA: 31.2, copies: { ahpnd: 3920, wssv: null, ehp: 260 }, chem: 3 },
  4: { sub: [3.3, 2.7, 2.4], pirA: 27.4, copies: { ahpnd: 51_200, wssv: 120, ehp: 1840 }, chem: 4 },
};

/** Kelas simulasi dari peluang seed (meniru batas backend; hanya untuk membuat riwayat mock). */
const seedClass = (p: number) => (p < 5 ? 1 : p < 25 ? 2 : p < 60 ? 3 : 4);

export const STANDARDS = [
  { copies_rxn: 1_000_000, ct: 19.8 },
  { copies_rxn: 100_000, ct: 23.2 },
  { copies_rxn: 10_000, ct: 26.5 },
  { copies_rxn: 1000, ct: 29.9 },
  { copies_rxn: 100, ct: 33.3 },
];

export const newId = (prefix: string) => `${prefix}-${randomBytes(6).toString("hex")}`;
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const round = (n: number, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

const WELL_ROWS = "ABCDEFGH";
/** Posisi well urut kolom (A1, B1, ... H1, A2, ...) seperti pipet multi-kanal. */
const wellAt = (i: number) => `${WELL_ROWS[i % 8]}${Math.floor(i / 8) + 1}`;

/** Kimia air simulasi per tingkat (1 baik - 4 buruk) dengan variasi kecil `j` (0-1). */
export function chemistry(level: number, j: number) {
  const tan = round(0.22 + 0.16 * level + j * 0.08);
  return {
    temp_c: round(28.6 + j * 1.4, 1),
    ph: round(7.7 + j * 0.4 - level * 0.05, 1),
    do_mg_l: round(6.1 - 0.45 * level - j * 0.3, 1),
    tan_mg_l: tan,
    no2_mg_l: round(0.06 + 0.06 * level + j * 0.03),
    h2s_mg_l: round(0.001 * level + j * 0.001, 3),
    tom_mg_l: round(44 + 8 * level + j * 6, 1),
    alkalinity: Math.round(132 - level * 4 + j * 10),
    salinity_ppt: round(17.5 + j * 1.5, 1),
    transparency_cm: Math.round(42 - level * 4 + j * 6),
    // NH₃ bebas simulasi; backend menghitungnya dengan Emerson.
    nh3_mg_l: round(tan * (0.045 + j * 0.02), 3),
  };
}

/** Well satu sampel (pirA dua replikat; vp28, swp1, amoA, 16S, PPC satu) dan fitur Ct ringkasnya. */
function sampleWells(riskClass: number, j: number, start: number, rejected: boolean) {
  const a = ARCHETYPES[riskClass];
  const pirA = a.pirA === null ? null : round(a.pirA + j, 2);
  const wssv = riskClass === 4 ? round(35.8 - j, 2) : null;
  const ehp = riskClass >= 3 ? round(35.1 - j * 0.5, 2) : null;
  const amoa = round(25.6 + j, 2);
  const s16 = round(17.8 + j * 0.6, 2);
  const ppc = rejected ? round(24.6 + j, 2) : round(19.6 + j * 0.8, 2);
  const tm = (t: number | null, base: number) => (t === null ? null : round(base + j * 0.3, 1));
  const targets: [string, number | null, number][] = [
    ["pirA", pirA === null ? null : round(pirA - 0.12, 2), 81.2],
    ["pirA", pirA === null ? null : round(pirA + 0.12, 2), 81.2],
    ["vp28", wssv, 79.6],
    ["swp1", ehp, 83.4],
    ["amoA", amoa, 84.1],
    ["16S", s16, 86.3],
    ["PPC", ppc, 82.7],
  ];
  const wells: Well[] = targets.map(([target, ct, base], k) => ({
    position: wellAt(start + k),
    target,
    ct,
    tm: tm(ct, base),
    excluded_reason: null,
  }));
  return {
    wells,
    ct: { ct_ahpnd: pirA, ct_wssv: wssv, ct_ehp: ehp, ct_amoa: amoa, ct_16s: s16, ct_ppc: ppc },
  };
}

const ISO = (date: string, time = "07:00") => `${date}T${time}:00+07:00`;
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

const SAMPLING_DATES = ["2026-09-18", "2026-09-25", "2026-10-02", "2026-10-09", "2026-10-16", "2026-10-23"];
const TREND_FACTORS: Record<string, number[]> = {
  RAPID_INCREASE: [0.3, 0.35, 0.45, 0.6, 0.78, 1],
  STABLE: [1.02, 0.97, 1.04, 0.98, 1.01, 1],
  DECREASING: [2.2, 1.9, 1.7, 1.5, 1.35, 1],
};

function seed(): Store {
  // Akun demo hanya bisa dimasuki lewat tombol demo: sandinya acak dan tidak disimpan di mana pun.
  const user = (id: string, full_name: string, email: string, phone_wa: string): MockUser => ({
    id,
    full_name,
    email,
    phone_wa,
    passwordHash: hashPassword(randomBytes(24).toString("hex")),
  });
  const sumber = "f-sumber-rejeki";
  const mina = "f-mina-lestari";
  const store: Store = {
    users: [
      user("u-hendra", "Hendra Kusuma", "hendra@demo.aquaseq.id", "6281234560917"),
      user("u-rizky", "Rizky Pratama", "rizky@demo.aquaseq.id", "6285790213348"),
      user("u-agus", "Agus Setiawan", "agus@demo.aquaseq.id", "6282139904671"),
      user("u-dwi", "Dwi Lestari", "dwi@demo.aquaseq.id", "6281358227405"),
    ],
    farms: [
      {
        id: sumber,
        name: "Tambak Sumber Rejeki",
        regency: "Jember",
        address: "Desa Mojomulyo, Puger",
        provenance: "simulasi",
        archived_at: null,
        owner_id: "u-hendra",
      },
      {
        id: mina,
        name: "Tambak Mina Lestari",
        regency: "Situbondo",
        address: "Desa Klatakan, Kendit",
        provenance: "simulasi",
        archived_at: null,
        owner_id: "u-hendra",
      },
    ],
    memberships: [
      { user_id: "u-hendra", farm_id: sumber, role: "pemilik", active: true },
      { user_id: "u-hendra", farm_id: mina, role: "pemilik", active: true },
      { user_id: "u-rizky", farm_id: sumber, role: "teknisi", active: true },
      { user_id: "u-agus", farm_id: sumber, role: "teknisi", active: true },
      { user_id: "u-dwi", farm_id: sumber, role: "teknisi", active: true },
    ],
    ponds: [],
    samples: [],
    batches: [],
    waterLogs: [],
    tasks: [],
    acked: new Map(),
    cycles: [],
    notifications: [],
    activity: [],
    invitations: [],
    access: new Map(),
    refresh: new Map(),
    models: [
      {
        version: "V1-GSI",
        status: "aktif",
        metrics: { dasar: "Bobot empiris awal, belum validasi lapangan" },
        n_labels: 0,
        synthetic: true,
        trained_at: "2026-10-01T00:00:00+07:00",
        promoted_at: "2026-10-01T00:00:00+07:00",
        promoted_by: null,
        note: "Bobot empiris awal GSI terkalibrasi 5 arketipe emas.",
      },
      {
        version: "V2-Kandidat",
        status: "kandidat",
        metrics: { brier_score: 0.054, auc_roc: 0.97, lead_time_gain_steps: 2 },
        n_labels: 48,
        synthetic: true,
        trained_at: "2026-10-23T18:00:00+07:00",
        promoted_at: null,
        promoted_by: null,
        note: "Model hasil kalibrasi trajektori multivariat. Dilatih di data sintetik klaster Puger Jember; tervalidasi pada pipeline evaluasi.",
      },
    ],
  };

  // [kode, kelas sampel terakhir (0 = ditolak, null = belum ada sampel), peluang %, tren, teknisi]
  type Row = [string, number | null, number, string, string | null];
  const rows: [string, MockPond["system"], number, string, Row[]][] = [
    [
      sumber,
      "intensif",
      3,
      "2026-09-01",
      [
        ["A1", 1, 2.1, "STABLE", "u-agus"],
        ["A2", 2, 14.7, "RAPID_INCREASE", "u-agus"],
        ["A3", 1, 3.8, "DECREASING", "u-agus"],
        ["A4", 0, 0, "INSUFFICIENT_DATA", "u-agus"],
        ["B1", 1, 4.2, "STABLE", "u-rizky"],
        ["B2", 2, 9.6, "STABLE", "u-rizky"],
        ["B3", 3, 34.8, "RAPID_INCREASE", "u-rizky"],
        ["B4", 1, 1.3, "STABLE", "u-rizky"],
        ["C1", 1, 2.9, "DECREASING", "u-dwi"],
        ["C2", 1, 3.1, "STABLE", "u-dwi"],
        ["C3", null, 0, "INSUFFICIENT_DATA", "u-dwi"],
        ["C4", 4, 71.6, "RAPID_INCREASE", "u-dwi"],
      ],
    ],
    [
      mina,
      "bioflok",
      2,
      "2026-08-25",
      [
        ["K1", 1, 2.4, "STABLE", null],
        ["K2", 3, 41.2, "RAPID_INCREASE", null],
        ["K3", 1, 1.9, "STABLE", null],
        ["K4", 2, 18.3, "STABLE", null],
        ["K5", 1, 3.5, "STABLE", null],
        ["K6", 1, 2.2, "STABLE", null],
      ],
    ],
  ];

  for (const [farm_id, system, cycle, stocked_at, ponds] of rows) {
    const short = farm_id.slice(2);
    const wa = farm_id === sumber ? "6281234560917" : null;
    // Satu batch per minggu per lokasi; posisi well berurutan antar sampel.
    const cursor = new Map<string, number>();
    for (const date of SAMPLING_DATES) {
      const batch_id = `b-${short}-${date.slice(5).replace("-", "")}`;
      store.batches.push({
        id: batch_id,
        farm_id,
        lab_name: farm_id === sumber ? "Lab Mikrobiologi Polije" : "Lab Kesehatan Ikan BPBAP Situbondo",
        instrument: farm_id === sumber ? "Bio-Rad CFX96" : "Applied Biosystems QuantStudio 5",
        tested_at: ISO(date, "14:20"),
        file_name: `${short}-run-${date.slice(5).replace("-", "")}.csv`,
        created_at: ISO(date, "15:05"),
        control_wells: ["pirA", "vp28", "swp1"].map((target, k) => ({
          sample_code: "NTC",
          position: `H${12 - k}`,
          target,
          ct: null,
          tm: null,
          excluded_reason: null,
        })),
      });
      cursor.set(batch_id, 0);
    }

    ponds.forEach(([pond_code, latestClass, latestP, trend, assignee_id], index) => {
      const pond: MockPond = {
        id: `p-${short}-${pond_code.toLowerCase()}`,
        farm_id,
        pond_code,
        name: null,
        system,
        area_sqm: system === "intensif" ? 1200 : 800,
        current_cycle: cycle,
        stocked_at,
        assignee_id,
        wa_target: wa,
        archived_at: null,
      };
      store.ponds.push(pond);
      const recorder = assignee_id ?? "u-hendra";
      const level = latestClass === null || latestClass === 0 ? 1 : latestClass;

      // Kimia air harian 7 hari terakhir.
      for (let d = 6; d >= 0; d--) {
        const date = addDays("2026-10-23", -d);
        const j = ((index * 7 + d * 3) % 10) / 10;
        store.waterLogs.push({
          id: `w-${pond.id.slice(2)}-${date.slice(5).replace("-", "")}`,
          pond_id: pond.id,
          measured_at: ISO(date, d % 2 ? "06:40" : "07:15"),
          recorded_by: recorder,
          ...chemistry(level, j),
        });
      }

      // Riwayat sampel mingguan sesuai tren; A4 hanya dua sampel (terakhir ditolak), C3 belum pernah.
      if (latestClass === null) return;
      const factors = TREND_FACTORS[trend] ?? [];
      const history: [string, number, number][] =
        latestClass === 0
          ? [
              ["2026-10-16", 2.6, seedClass(2.6)],
              ["2026-10-23", 0, 0],
            ]
          : SAMPLING_DATES.map((date, k) => {
              const p = k === 5 ? latestP : round(latestP * factors[k], 1);
              return [date, p, k === 5 ? latestClass : seedClass(p)];
            });
      for (const [date, probability_pct, risk_class] of history) {
        const batch_id = `b-${short}-${date.slice(5).replace("-", "")}`;
        const start = cursor.get(batch_id) ?? 0;
        cursor.set(batch_id, start + 7);
        const j = ((index * 13 + date.charCodeAt(9)) % 10) / 10;
        const { wells, ct } = sampleWells(risk_class, j * 0.6, start, risk_class === 0);
        const chem = chemistry(ARCHETYPES[risk_class].chem, j);
        const log = store.waterLogs.find((w) => w.pond_id === pond.id && w.measured_at.startsWith(date));
        store.samples.push({
          id: `s-${pond.id.slice(2)}-${date.slice(5).replace("-", "")}`,
          pond_id: pond.id,
          batch_id,
          sample_code: `${pond_code}-${date.slice(5).replace("-", "")}`,
          sampling_date: date,
          cycle_day: daysBetween(stocked_at, date),
          features: {
            ...ct,
            do_mg_l: chem.do_mg_l,
            tom_mg_l: chem.tom_mg_l,
            ph: chem.ph,
            salinity_ppt: chem.salinity_ppt,
            temp_c: chem.temp_c,
            tan_mg_l: chem.tan_mg_l,
            no2_mg_l: chem.no2_mg_l,
            h2s_mg_l: chem.h2s_mg_l,
            alkalinity: chem.alkalinity,
          },
          wells,
          water_log_id: log?.id ?? null,
          status: risk_class === 0 ? "REJECTED_INHIBITOR" : "VALID",
          probability_pct,
          risk_class,
          copies: ARCHETYPES[risk_class].copies,
          nh3_mg_l: chem.nh3_mg_l,
        });
      }

      // Siklus sebelumnya (data kalibrasi).
      for (let n = 1; n < cycle; n++) {
        const outbreak = pond_code === "C4" && n === cycle - 1;
        store.cycles.push({
          pond_id: pond.id,
          cycle_number: n,
          outcome: outbreak ? "EMERGENCY_HARVEST" : "HARVEST_SUCCESS",
          actual_harvest_kg: outbreak ? 640 : 1580 + ((index * 37 + n * 53) % 420),
          outbreak_date: outbreak ? "2026-06-14" : null,
          primary_suspect_pathogen: outbreak ? "AHPND" : null,
          notes: outbreak ? "Kematian mulai DOC 38, panen darurat hari ke-41." : null,
        });
      }
    });
  }

  seedTasks(store);
  seedInvitations(store);
  return store;
}

function seedTasks(store: Store) {
  const now = Date.now();
  const at = (days: number, hour: number) => {
    const d = new Date(now + days * DAY_MS);
    d.setUTCHours(hour - 7, 0, 0, 0);
    return d.toISOString();
  };
  const pond = (code: string) => `p-sumber-rejeki-${code.toLowerCase()}`;
  const sample = (code: string) => `s-sumber-rejeki-${code.toLowerCase()}-1023`;
  const task = (
    id: string,
    code: string,
    assignee_id: string,
    kind: MockTask["kind"],
    title: string,
    instruction: string,
    due_at: string,
    created_at: string,
    history: MockTask["history"],
    extra: Partial<MockTask> = {},
  ): MockTask => ({
    id,
    farm_id: "f-sumber-rejeki",
    pond_id: pond(code),
    assignee_id,
    created_by: "u-hendra",
    kind,
    title,
    instruction,
    due_at,
    status: history.at(-1)?.status ?? "baru",
    owner_note: null,
    source_sample_id: null,
    source_alert_id: null,
    created_at,
    reports: [],
    history,
    ...extra,
  });
  store.tasks.push(
    task(
      "t-c4-isolasi",
      "C4",
      "u-dwi",
      "tindakan",
      "Isolasi saluran buang kolam C4",
      BACKEND_TEXT[4].recommendation,
      at(0, 16),
      at(-1, 9),
      [
        { status: "baru", by: "u-hendra", note: null, at: at(-1, 9) },
        { status: "dikerjakan", by: "u-dwi", note: null, at: at(0, 7) },
      ],
      { source_sample_id: sample("C4") },
    ),
    task(
      "t-b3-pakan",
      "B3",
      "u-rizky",
      "tindakan",
      "Kurangi pakan 20% dan siphon dasar B3",
      BACKEND_TEXT[3].recommendation,
      at(-1, 17),
      at(-1, 8),
      [
        { status: "baru", by: "u-hendra", note: null, at: at(-1, 8) },
        { status: "dikerjakan", by: "u-rizky", note: null, at: at(-1, 9) },
        { status: "dilaporkan", by: "u-rizky", note: null, at: at(-1, 15) },
      ],
      {
        source_sample_id: sample("B3"),
        reports: [
          {
            id: "r-b3-1",
            note: "Pakan sore dikurangi dari 18 kg jadi 14,5 kg. Siphon dasar selesai jam 14.30, lumpur hitam cukup banyak di sudut timur.",
            measured: { do_mg_l: 4.9, tan_mg_l: 0.58, ph: 7.6 },
            photo_ids: ["f-b3-siphon", "f-b3-lumpur"],
            reported_by: "u-rizky",
            reported_at: at(-1, 15),
          },
        ],
      },
    ),
    task(
      "t-a4-sampel",
      "A4",
      "u-agus",
      "ambil_sampel",
      "Ambil sampel ulang kolam A4",
      BACKEND_TEXT[0].recommendation,
      at(1, 9),
      at(0, 8),
      [{ status: "baru", by: "u-hendra", note: null, at: at(0, 8) }],
      { source_sample_id: sample("A4") },
    ),
    task(
      "t-b2-air",
      "B2",
      "u-rizky",
      "catat_air",
      "Catat kimia air pagi kolam B2",
      "Ukur suhu, pH, DO, dan TAN sebelum pakan pagi.",
      at(-1, 8),
      at(-2, 17),
      [{ status: "baru", by: "u-hendra", note: null, at: at(-2, 17) }],
    ),
    task(
      "t-a2-aerasi",
      "A2",
      "u-agus",
      "tindakan",
      "Pantau DO dan aerasi kolam A2",
      BACKEND_TEXT[2].recommendation,
      at(-2, 16),
      at(-3, 9),
      [
        { status: "baru", by: "u-hendra", note: null, at: at(-3, 9) },
        { status: "dikerjakan", by: "u-agus", note: null, at: at(-3, 10) },
        { status: "dilaporkan", by: "u-agus", note: null, at: at(-2, 14) },
        { status: "selesai", by: "u-hendra", note: null, at: at(-2, 15) },
      ],
      {
        reports: [
          {
            id: "r-a2-1",
            note: "Kincir ke-3 diganti v-belt, DO malam naik dari 3,8 ke 4,6.",
            measured: { do_mg_l: 4.6 },
            photo_ids: [],
            reported_by: "u-agus",
            reported_at: at(-2, 14),
          },
        ],
      },
    ),
    task(
      "t-c1-air",
      "C1",
      "u-dwi",
      "catat_air",
      "Catat kimia air kolam C1",
      "Ukur suhu, pH, DO, dan TAN sore ini.",
      at(0, 17),
      at(-1, 10),
      [
        { status: "baru", by: "u-hendra", note: null, at: at(-1, 10) },
        { status: "dilaporkan", by: "u-dwi", note: null, at: at(-1, 16) },
        { status: "diminta_ulang", by: "u-hendra", note: "Nilai pH belum diisi.", at: at(-1, 18) },
      ],
      { owner_note: "Nilai pH belum diisi." },
    ),
  );

  const note = (
    id: string,
    user_id: string,
    kind: Store["notifications"][number]["kind"],
    title: string,
    entity: Store["notifications"][number]["entity"],
    entity_id: string,
    created_at: string,
    read = false,
  ) =>
    store.notifications.push({
      id,
      user_id,
      kind,
      title,
      entity,
      entity_id,
      created_at,
      read_at: read ? created_at : null,
    });
  note("n-1", "u-hendra", "laporan_masuk", "Rizky Pratama melaporkan tugas kolam B3", "task", "t-b3-pakan", at(-1, 15));
  note("n-2", "u-hendra", "peringatan_baru", "Kolam C4 Bahaya (71,6%)", "pond", pond("C4"), at(-1, 7));
  note(
    "n-3",
    "u-hendra",
    "tugas_terlambat",
    "Tugas catat air kolam B2 lewat jatuh tempo",
    "task",
    "t-b2-air",
    at(-1, 9),
  );
  note("n-4", "u-hendra", "tugas_selesai", "Tugas aerasi kolam A2 ditutup", "task", "t-a2-aerasi", at(-2, 15), true);
  note("n-5", "u-rizky", "tugas_baru", "Tugas baru: catat kimia air kolam B2", "task", "t-b2-air", at(-2, 17));

  const log = (actor_id: string, action: string, entity: string, entity_id: string, detail: string, when: string) =>
    store.activity.push({ farm_id: "f-sumber-rejeki", actor_id, action, entity, entity_id, detail, at: when });
  log(
    "u-hendra",
    "batch.unggah",
    "batch",
    "b-sumber-rejeki-1023",
    "Mengunggah hasil lab 23 Okt (11 sampel, 1 ditolak)",
    ISO("2026-10-23", "15:05"),
  );
  log("u-hendra", "tugas.buat", "task", "t-b3-pakan", "Membuat tugas kolam B3 untuk Rizky Pratama", at(-1, 8));
  log("u-rizky", "tugas.lapor", "task", "t-b3-pakan", "Melaporkan tugas kolam B3 dengan 2 foto", at(-1, 15));
  log("u-hendra", "tugas.buat", "task", "t-c4-isolasi", "Membuat tugas kolam C4 untuk Dwi Lestari", at(-1, 9));
  log(
    "u-hendra",
    "tugas.minta_ulang",
    "task",
    "t-c1-air",
    "Meminta ulang laporan kolam C1: nilai pH belum diisi",
    at(-1, 18),
  );
  log("u-hendra", "tugas.selesai", "task", "t-a2-aerasi", "Menutup tugas aerasi kolam A2", at(-2, 15));
  log("u-hendra", "tugas.buat", "task", "t-a4-sampel", "Membuat tugas ambil sampel ulang kolam A4", at(0, 8));
}

function seedInvitations(store: Store) {
  // Token undangan demo tetap supaya /undangan/undangan-demo-sumber-rejeki bisa dicoba; satu lagi sudah kedaluwarsa.
  const invitation = (id: string, email: string, pond_ids: string[], expiresInDays: number, token: string) => ({
    id,
    farm_id: "f-sumber-rejeki",
    email,
    pond_ids,
    expires_at: new Date(Date.now() + expiresInDays * DAY_MS).toISOString(),
    token_hash: hashToken(token),
    accepted_at: null,
    revoked_at: null,
  });
  store.invitations.push(
    invitation(
      "inv-demo-bayu",
      "bayu@demo.aquaseq.id",
      ["p-sumber-rejeki-c3"],
      INVITATION_TTL_DAYS,
      "undangan-demo-sumber-rejeki",
    ),
    invitation("inv-demo-yusuf", "yusuf.hidayat@demo.aquaseq.id", [], -2, randomBytes(32).toString("hex")),
  );
}

// Proxy dan halaman bisa memuat modul ini sebagai bundel terpisah; globalThis membuat satu proses berbagi satu store.
// Kunci berversi supaya store lama (bentuk data sebelumnya) tidak terpakai setelah HMR.
const holder = globalThis as { __aquaseqMockV3?: Store };
export const store = (holder.__aquaseqMockV3 ??= seed());
