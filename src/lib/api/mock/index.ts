import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type {
  Alert,
  Api,
  Farm,
  Me,
  Member,
  Pond,
  SdriResult,
  Task,
  TaskDetail,
  Tokens,
  Trajectory,
  WaterLog,
} from "..";
import { ApiError } from "../errors";
import {
  ARCHETYPES,
  BACKEND_TEXT,
  DAY_MS,
  INVITATION_TTL_DAYS,
  STANDARDS,
  chemistry,
  hashPassword,
  hashToken,
  newId,
  round,
  store,
  type MockFarm,
  type MockInvitation,
  type MockPond,
  type MockSample,
  type MockTask,
  type MockUser,
  type MockWaterLog,
  type Store,
} from "./store";

// Mock backend untuk API_MODE=mock: perilaku mengikuti 09-API-KONTRAK, data SIMULASI (lihat store.ts).

const ACCESS_TTL_SECONDS = 15 * 60;
const OPEN_TASK: Task["status"][] = ["baru", "dikerjakan", "dilaporkan", "diminta_ulang"];

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(Buffer.from(hash, "hex"), scryptSync(password, salt, 32));
}

const unauthorized = () => new ApiError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk lagi.");
const forbidden = () => new ApiError("FORBIDDEN", "Kamu tidak punya akses ke lokasi ini.");
const notFound = (what: string) => new ApiError("NOT_FOUND", `${what} tidak ditemukan.`);
const invitationGone = () =>
  new ApiError("NOT_FOUND", "Undangan tidak berlaku lagi. Minta pemilik tambak mengundang ulang.");

function issueTokens(userId: string): Tokens {
  const access_token = randomBytes(32).toString("hex");
  const refresh_token = randomBytes(32).toString("hex");
  store.access.set(access_token, { userId, expiresAt: Date.now() + ACCESS_TTL_SECONDS * 1000 });
  store.refresh.set(refresh_token, userId);
  return { access_token, refresh_token, expires_in: ACCESS_TTL_SECONDS };
}

function publicUser({ id, full_name, email, phone_wa }: MockUser) {
  return { id, full_name, email, phone_wa };
}

function signIn(user: MockUser) {
  return { ...issueTokens(user.id), user: publicUser(user) };
}

function userOf(token: string): MockUser {
  const session = store.access.get(token);
  const user = store.users.find((u) => u.id === session?.userId);
  if (!session || !user || session.expiresAt < Date.now()) throw unauthorized();
  return user;
}

const refOf = (id: string) => {
  const user = store.users.find((u) => u.id === id);
  return { id, full_name: user?.full_name ?? "Pengguna terhapus" };
};

function farmOf(farmId: string): MockFarm {
  const farm = store.farms.find((f) => f.id === farmId);
  if (!farm) throw notFound("Lokasi");
  return farm;
}

/** Lokasi milik pemilik yang sedang masuk; selain itu 403 (09-API-KONTRAK §9). */
function ownedFarm(token: string, farmId: string): MockFarm {
  const user = userOf(token);
  const farm = farmOf(farmId);
  if (farm.owner_id !== user.id) throw forbidden();
  return farm;
}

function pondOf(pondId: string): MockPond {
  const pond = store.ponds.find((p) => p.id === pondId && !p.archived_at);
  if (!pond) throw notFound("Kolam");
  return pond;
}

/** Kolam milik lokasi pemilik yang sedang masuk. */
function ownedPond(token: string, pondId: string): MockPond {
  const pond = pondOf(pondId);
  ownedFarm(token, pond.farm_id);
  return pond;
}

/** Pemilik lokasi atau teknisi aktif pemegang kolam. */
function readablePond(token: string, pondId: string): MockPond {
  const user = userOf(token);
  const pond = pondOf(pondId);
  if (farmOf(pond.farm_id).owner_id === user.id) return pond;
  const member = store.memberships.some((m) => m.farm_id === pond.farm_id && m.user_id === user.id && m.active);
  if (!member || pond.assignee_id !== user.id) throw forbidden();
  return pond;
}

const activePonds = (farmId: string) => store.ponds.filter((p) => p.farm_id === farmId && !p.archived_at);
const byDate = (a: MockSample, b: MockSample) => a.sampling_date.localeCompare(b.sampling_date);
const samplesOf = (pondId: string) => store.samples.filter((s) => s.pond_id === pondId).toSorted(byDate);
const latestSample = (pondId: string) => samplesOf(pondId).at(-1) ?? null;

function log(farm_id: string, actor_id: string, action: string, entity: string, entity_id: string, detail: string) {
  store.activity.push({ farm_id, actor_id, action, entity, entity_id, detail, at: new Date().toISOString() });
}

function notify(
  user_id: string,
  kind: Store["notifications"][number]["kind"],
  title: string,
  entity: Store["notifications"][number]["entity"],
  entity_id: string,
) {
  store.notifications.push({
    id: newId("n"),
    user_id,
    kind,
    title,
    entity,
    entity_id,
    read_at: null,
    created_at: new Date().toISOString(),
  });
}

function summary(farm: MockFarm): Farm {
  const ponds = activePonds(farm.id);
  const { id, name, regency, address, provenance, archived_at } = farm;
  return {
    id,
    name,
    regency,
    address,
    provenance,
    archived_at,
    pond_count: ponds.length,
    technician_count: store.memberships.filter((m) => m.farm_id === farm.id && m.role === "teknisi" && m.active).length,
    at_risk_count: ponds.filter((p) => (latestSample(p.id)?.risk_class ?? 0) >= 3).length,
  };
}

function resultOf({ status, probability_pct, risk_class }: MockSample): SdriResult {
  const p = probability_pct / 100;
  const [s_qpcr, s_bio, s_chem] = ARCHETYPES[risk_class].sub;
  return {
    status,
    // Logit dari peluang (kebalikan sigmoid) supaya z konsisten dengan angka yang tampil.
    z_score: status === "VALID" ? round(Math.log(p / (1 - p)), 4) : 0,
    probability_pct,
    risk_class,
    ...BACKEND_TEXT[risk_class],
    s_qpcr,
    s_bio,
    s_chem,
    model_version: "V1-GSI",
  };
}

/** Tren mock dari dua titik valid terakhir (meniru `internal/trajectory`, bukan rumus resminya). */
function trajectoryOf(pondId: string): Trajectory {
  const valid = samplesOf(pondId).filter((s) => s.status === "VALID");
  const history = valid.map((s) => ({
    sampling_date: s.sampling_date,
    cycle_day: s.cycle_day,
    probability_pct: s.probability_pct,
    risk_class: s.risk_class,
  }));
  if (valid.length < 2) {
    return {
      pond_id: pondId,
      data_points: valid.length,
      slope: 0,
      trend: "INSUFFICIENT_DATA",
      trajectory_alert: false,
      alert_message: "Data sampling belum cukup untuk evaluasi trajektori (minimal 2 titik).",
      history,
    };
  }
  const [prev, last] = valid.slice(-2);
  const days = Math.max(1, (Date.parse(last.sampling_date) - Date.parse(prev.sampling_date)) / DAY_MS);
  const diff = last.probability_pct - prev.probability_pct;
  const slope = round(diff / days);
  const [trend, alert_message]: [Trajectory["trend"], string] =
    diff >= 3
      ? [
          "RAPID_INCREASE",
          `Waspada Dini: Trajektori risiko melonjak +${slope.toFixed(2)}%/hari. Pola mengindikasikan deviasi kurva sebelum kelas berbalik ke bahaya.`,
        ]
      : diff >= 1
        ? ["MODERATE_INCREASE", "Tren risiko meningkat perlahan. Pantau sampling berikutnya."]
        : diff <= -1
          ? ["DECREASING", "Tren risiko membaik/menurun stabil."]
          : ["STABLE", "Kondisi trajektori stabil dalam batas normal."];
  return {
    pond_id: pondId,
    data_points: valid.length,
    slope,
    trend,
    trajectory_alert: trend === "RAPID_INCREASE",
    alert_message,
    history,
  };
}

function pondView(pond: MockPond): Pond {
  const sample = latestSample(pond.id);
  const { id, farm_id, pond_code, name, system, area_sqm, current_cycle, stocked_at, wa_target, assignee_id } = pond;
  return {
    id,
    farm_id,
    pond_code,
    name,
    system,
    area_sqm,
    current_cycle,
    stocked_at,
    wa_target,
    assignee: assignee_id ? refOf(assignee_id) : null,
    latest_result: sample ? resultOf(sample) : null,
    latest_sampling_date: sample?.sampling_date ?? null,
    trend: trajectoryOf(pond.id).trend,
  };
}

function waterLogView(log: MockWaterLog): WaterLog {
  const { pond_id, recorded_by, ...rest } = log;
  const pond = store.ponds.find((p) => p.id === pond_id);
  return { ...rest, pond: { id: pond_id, pond_code: pond?.pond_code ?? "?" }, recorded_by: refOf(recorded_by) };
}

const isOverdue = (task: MockTask) =>
  ["baru", "dikerjakan", "diminta_ulang"].includes(task.status) && Date.parse(task.due_at) < Date.now();

function taskView(task: MockTask): Task {
  const pond = store.ponds.find((p) => p.id === task.pond_id);
  return {
    id: task.id,
    farm_id: task.farm_id,
    pond: { id: task.pond_id, pond_code: pond?.pond_code ?? "?" },
    assignee: refOf(task.assignee_id),
    created_by: refOf(task.created_by),
    kind: task.kind,
    title: task.title,
    instruction: task.instruction,
    due_at: task.due_at,
    status: task.status,
    owner_note: task.owner_note,
    source_sample_id: task.source_sample_id,
    overdue: isOverdue(task),
    created_at: task.created_at,
  };
}

function taskDetail(task: MockTask): TaskDetail {
  return {
    ...taskView(task),
    reports: task.reports.map(({ photo_ids, reported_by, ...r }) => ({
      ...r,
      reported_by: refOf(reported_by),
      photos: photo_ids.map((id) => ({ id, url: `/files/${id}` })),
    })),
    history: task.history.map((h) => ({ ...h, by: refOf(h.by) })),
  };
}

/** Peringatan aktif dari sampel terakhir tiap kolam (aturan 09-API-KONTRAK §6). */
function alertsOf(farmId: string): Alert[] {
  return activePonds(farmId).flatMap((pond): Alert[] => {
    const sample = latestSample(pond.id);
    if (!sample) return [];
    const trajectory = trajectoryOf(pond.id);
    const kind: Alert["kind"] | null =
      sample.status !== "VALID"
        ? "REJECTED"
        : sample.risk_class >= 3
          ? "RISK_CLASS"
          : trajectory.trajectory_alert
            ? "TRAJECTORY"
            : null;
    if (!kind) return [];
    const id = `al-${sample.id}-${kind.toLowerCase()}`;
    const acked_at = store.acked.get(id) ?? null;
    if (acked_at) return [];
    const openTask = store.tasks.find((t) => t.pond_id === pond.id && OPEN_TASK.includes(t.status));
    return [
      {
        id,
        pond_id: pond.id,
        pond_code: pond.pond_code,
        kind,
        risk_class: sample.risk_class,
        probability_pct: sample.probability_pct,
        message: kind === "TRAJECTORY" ? trajectory.alert_message : BACKEND_TEXT[sample.risk_class].recommendation,
        sample_id: sample.id,
        since: `${sample.sampling_date}T15:05:00+07:00`,
        acked_at,
        open_task_id: openTask?.id ?? null,
      },
    ];
  });
}

function memberView(membership: Store["memberships"][number]): Member {
  const user = store.users.find((u) => u.id === membership.user_id);
  if (!user) throw notFound("Anggota");
  return {
    user_id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: membership.role,
    active: membership.active,
    pond_codes: activePonds(membership.farm_id)
      .filter((p) => p.assignee_id === user.id)
      .map((p) => p.pond_code),
    open_tasks: store.tasks.filter(
      (t) => t.farm_id === membership.farm_id && t.assignee_id === user.id && OPEN_TASK.includes(t.status),
    ).length,
  };
}

function technicianOf(farmId: string, userId: string) {
  const membership = store.memberships.find((m) => m.farm_id === farmId && m.user_id === userId);
  if (!membership || membership.role !== "teknisi") throw notFound("Teknisi");
  return membership;
}

const pondCodes = (ids: string[]) => store.ponds.filter((p) => ids.includes(p.id)).map((p) => p.pond_code);

/** Undangan yang masih bisa dibuka (belum dipakai dan belum dibatalkan). */
function openInvitation(token: string): MockInvitation {
  const hash = hashToken(token);
  const invitation = store.invitations.find((i) => i.token_hash === hash);
  if (!invitation || invitation.accepted_at || invitation.revoked_at) throw invitationGone();
  return invitation;
}

const isExpired = (invitation: MockInvitation) => Date.parse(invitation.expires_at) < Date.now();

function ownedTask(token: string, taskId: string) {
  const user = userOf(token);
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw notFound("Tugas");
  const owner = farmOf(task.farm_id).owner_id === user.id;
  if (!owner && task.assignee_id !== user.id) throw forbidden();
  return { task, user, owner };
}

/**
 * Hasil simulasi untuk sampel baru: gerbang PPC lalu arketipe dari Ct patogen terendah.
 * Bukan rumus backend; hanya supaya alur unggah bisa dicoba di mode mock.
 */
function simulate(
  ct_ppc: number,
  pathogenCts: (number | null)[],
): Pick<MockSample, "status" | "risk_class" | "probability_pct"> {
  if (ct_ppc < 18 || ct_ppc > 22) return { status: "REJECTED_INHIBITOR", risk_class: 0, probability_pct: 0 };
  const detected = pathogenCts.filter((c): c is number => c !== null && c < 40);
  const lowest = detected.length ? Math.min(...detected) : null;
  const [risk_class, base] =
    lowest === null ? [1, 2.4] : lowest >= 34 ? [2, 11.8] : lowest >= 29 ? [3, 37.5] : [4, 68.9];
  return { status: "VALID", risk_class, probability_pct: round(base + ((lowest ?? 0) % 1) * 2, 1) };
}

const SVG_PHOTO = (label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#DCE3EA"/><rect x="40" y="300" width="560" height="140" rx="16" fill="#C9D3DD"/><circle cx="520" cy="110" r="44" fill="#ECECEA"/><text x="320" y="250" font-family="sans-serif" font-size="22" fill="#4A5563" text-anchor="middle">${label}</text></svg>`;

export const mock: Api = {
  health: async () => ({ status: "healthy", service: "aquaseq-mock", version: "0.2.0" }),
  auth: {
    login: async ({ email, password }) => {
      const user = store.users.find((u) => u.email === email.toLowerCase());
      if (!user || !verifyPassword(password, user.passwordHash)) {
        throw new ApiError("UNAUTHORIZED", "Email atau sandi salah.");
      }
      return signIn(user);
    },
    register: async ({ full_name, email, password }) => {
      const normalized = email.toLowerCase();
      if (store.users.some((u) => u.email === normalized)) {
        throw new ApiError("CONFLICT", "Email sudah terdaftar.", { email: "Email ini sudah terdaftar. Masuk saja." });
      }
      const user = {
        id: newId("u"),
        full_name,
        email: normalized,
        phone_wa: null,
        passwordHash: hashPassword(password),
      };
      store.users.push(user);
      return signIn(user);
    },
    demo: async (role) => {
      const membership = store.memberships.find((m) => m.role === role && m.active);
      const user = store.users.find((u) => u.id === membership?.user_id);
      if (!user) throw notFound("Akun demo");
      return signIn(user);
    },
    refresh: async (refreshToken) => {
      const userId = store.refresh.get(refreshToken);
      if (!userId) throw unauthorized();
      // Rotasi: refresh token lama langsung tidak berlaku (09-API-KONTRAK §2).
      store.refresh.delete(refreshToken);
      return issueTokens(userId);
    },
    logout: async (refreshToken) => {
      store.refresh.delete(refreshToken);
    },
    me: async (token): Promise<Me> => {
      const user = userOf(token);
      // Lokasi yang diarsipkan dan keanggotaan nonaktif tidak muncul di pemilih lokasi.
      const memberships = store.memberships.flatMap((m) => {
        const farm = store.farms.find((f) => f.id === m.farm_id && !f.archived_at);
        return m.user_id === user.id && m.active && farm
          ? [{ farm_id: farm.id, farm_name: farm.name, role: m.role }]
          : [];
      });
      return { ...publicUser(user), memberships };
    },
    updateMe: async (token, { full_name, phone_wa }) => {
      const user = userOf(token);
      Object.assign(user, { full_name, phone_wa });
      return publicUser(user);
    },
    changePassword: async (token, { current_password, new_password }) => {
      const user = userOf(token);
      if (!verifyPassword(current_password, user.passwordHash)) {
        throw new ApiError("VALIDATION_ERROR", "Sandi lama salah.", { current_password: "Sandi lama salah." });
      }
      user.passwordHash = hashPassword(new_password);
    },
  },
  farms: {
    list: async (token) => {
      const user = userOf(token);
      const ids = new Set(store.memberships.filter((m) => m.user_id === user.id && m.active).map((m) => m.farm_id));
      return store.farms.filter((f) => ids.has(f.id)).map(summary);
    },
    create: async (token, { name, regency, address }) => {
      const user = userOf(token);
      const farm: MockFarm = {
        id: newId("f"),
        name,
        regency,
        address: address || null,
        provenance: "nyata",
        archived_at: null,
        owner_id: user.id,
      };
      store.farms.push(farm);
      store.memberships.push({ user_id: user.id, farm_id: farm.id, role: "pemilik", active: true });
      return summary(farm);
    },
    update: async (token, id, { name, regency, address }) => {
      const farm = ownedFarm(token, id);
      Object.assign(farm, { name, regency, address: address || null });
      return summary(farm);
    },
    archive: async (token, id) => {
      const farm = ownedFarm(token, id);
      farm.archived_at ??= new Date().toISOString();
      return summary(farm);
    },
  },
  ponds: {
    list: async (token, farmId) => {
      const user = userOf(token);
      const farm = farmOf(farmId);
      if (farm.owner_id === user.id) return activePonds(farmId).map(pondView);
      const member = store.memberships.some((m) => m.farm_id === farmId && m.user_id === user.id && m.active);
      if (!member) throw forbidden();
      // Teknisi hanya melihat kolam yang dipegangnya (09-API-KONTRAK §9).
      return activePonds(farmId)
        .filter((p) => p.assignee_id === user.id)
        .map(pondView);
    },
    get: async (token, pondId) => {
      const pond = readablePond(token, pondId);
      const logs = store.waterLogs
        .filter((w) => w.pond_id === pond.id)
        .toSorted((a, b) => b.measured_at.localeCompare(a.measured_at));
      return { ...pondView(pond), latest_water_log: logs[0] ? waterLogView(logs[0]) : null };
    },
    create: async (token, farmId, { pond_code, system, area_sqm }) => {
      const owner = userOf(token);
      ownedFarm(token, farmId);
      const code = pond_code.toUpperCase();
      if (activePonds(farmId).some((p) => p.pond_code === code)) {
        throw new ApiError("CONFLICT", `Kode kolam ${code} sudah dipakai.`, { pond_code: "Kode kolam sudah dipakai." });
      }
      const pond: MockPond = {
        id: newId("p"),
        farm_id: farmId,
        pond_code: code,
        name: null,
        system,
        area_sqm: area_sqm ?? null,
        current_cycle: 1,
        stocked_at: new Date().toISOString().slice(0, 10),
        assignee_id: null,
        wa_target: null,
        archived_at: null,
      };
      store.ponds.push(pond);
      log(farmId, owner.id, "kolam.buat", "pond", pond.id, `Menambah kolam ${code}`);
      return pondView(pond);
    },
    update: async (token, pondId, { pond_code, system, area_sqm, wa_target }) => {
      const pond = ownedPond(token, pondId);
      const code = pond_code?.toUpperCase();
      if (code && activePonds(pond.farm_id).some((p) => p.pond_code === code && p.id !== pond.id)) {
        throw new ApiError("CONFLICT", `Kode kolam ${code} sudah dipakai.`, { pond_code: "Kode kolam sudah dipakai." });
      }
      if (code) pond.pond_code = code;
      if (system) pond.system = system;
      if (area_sqm !== undefined) pond.area_sqm = area_sqm;
      if (wa_target !== undefined) pond.wa_target = wa_target;
      return pondView(pond);
    },
    archive: async (token, pondId) => {
      const owner = userOf(token);
      const pond = ownedPond(token, pondId);
      pond.archived_at = new Date().toISOString();
      pond.assignee_id = null;
      log(pond.farm_id, owner.id, "kolam.arsip", "pond", pond.id, `Mengarsipkan kolam ${pond.pond_code}`);
      return pondView(pond);
    },
    trajectory: async (token, pondId) => trajectoryOf(readablePond(token, pondId).id),
    samples: async (token, pondId) =>
      samplesOf(readablePond(token, pondId).id)
        .toReversed()
        .map((s) => ({
          sample_id: s.id,
          sample_code: s.sample_code,
          sampling_date: s.sampling_date,
          cycle_day: s.cycle_day,
          sdri_result: resultOf(s),
        })),
    waterLogs: async (token, pondId) => {
      const pond = readablePond(token, pondId);
      return store.waterLogs
        .filter((w) => w.pond_id === pond.id)
        .toSorted((a, b) => b.measured_at.localeCompare(a.measured_at))
        .map(waterLogView);
    },
    logWater: async (token, pondId, body) => {
      const user = userOf(token);
      const pond = readablePond(token, pondId);
      // Rentang sama dengan validasi backend (09-API-KONTRAK §5).
      const limits: Record<string, [number, number, string]> = {
        temp_c: [15, 40, "Suhu 15-40 °C."],
        ph: [5, 10, "pH 5-10."],
        do_mg_l: [0, 20, "DO 0-20 mg/L."],
        tan_mg_l: [0, 20, "TAN 0-20 mg/L."],
        no2_mg_l: [0, 20, "NO₂ 0-20 mg/L."],
        h2s_mg_l: [0, 2, "H₂S 0-2 mg/L."],
        tom_mg_l: [0, 500, "TOM 0-500 mg/L."],
        alkalinity: [0, 400, "Alkalinitas 0-400 mg/L."],
        salinity_ppt: [0, 60, "Salinitas 0-60 ppt."],
        transparency_cm: [0, 200, "Kecerahan 0-200 cm."],
      };
      const fields: Record<string, string> = {};
      for (const [key, [min, max, message]] of Object.entries(limits)) {
        const value = body[key as keyof typeof body];
        if (typeof value === "number" && (value < min || value > max)) fields[key] = `Di luar rentang. ${message}`;
      }
      if (Date.parse(body.measured_at) > Date.now() + 10 * 60_000)
        fields.measured_at = "Waktu ukur tidak boleh di masa depan.";
      if (Object.keys(fields).length) throw new ApiError("VALIDATION_ERROR", "Ada nilai yang di luar rentang.", fields);
      const entry: MockWaterLog = {
        id: newId("w"),
        pond_id: pond.id,
        measured_at: body.measured_at,
        temp_c: body.temp_c,
        ph: body.ph,
        do_mg_l: body.do_mg_l,
        tan_mg_l: body.tan_mg_l,
        no2_mg_l: body.no2_mg_l ?? null,
        h2s_mg_l: body.h2s_mg_l ?? null,
        tom_mg_l: body.tom_mg_l ?? null,
        alkalinity: body.alkalinity ?? null,
        salinity_ppt: body.salinity_ppt ?? null,
        transparency_cm: body.transparency_cm ?? null,
        // NH₃ bebas simulasi (naik dengan pH); backend memakai Emerson.
        nh3_mg_l: round(body.tan_mg_l * Math.max(0.01, 0.045 + (body.ph - 7.8) * 0.04), 3),
        recorded_by: user.id,
      };
      store.waterLogs.push(entry);
      log(pond.farm_id, user.id, "kolam.catat_air", "pond", pond.id, `Mencatat kimia air kolam ${pond.pond_code}`);
      return waterLogView(entry);
    },
    cycles: async (token, pondId) => {
      const pond = ownedPond(token, pondId);
      return store.cycles
        .filter((c) => c.pond_id === pond.id)
        .toSorted((a, b) => b.cycle_number - a.cycle_number)
        .map((c) => ({
          cycle_number: c.cycle_number,
          outcome: c.outcome,
          actual_harvest_kg: c.actual_harvest_kg,
          outbreak_date: c.outbreak_date,
          primary_suspect_pathogen: c.primary_suspect_pathogen,
          notes: c.notes,
        }));
    },
  },
  members: {
    list: async (token, farmId) => {
      ownedFarm(token, farmId);
      const pending = store.invitations.filter((i) => i.farm_id === farmId && !i.accepted_at && !i.revoked_at);
      return {
        items: store.memberships.filter((m) => m.farm_id === farmId).map(memberView),
        invitations: pending.map(({ id, email, pond_ids, expires_at }) => ({
          id,
          email,
          pond_codes: pondCodes(pond_ids),
          expires_at,
        })),
      };
    },
    update: async (token, farmId, userId, { active }) => {
      const owner = userOf(token);
      ownedFarm(token, farmId);
      const membership = technicianOf(farmId, userId);
      membership.active = active;
      if (!active) {
        for (const pond of activePonds(farmId)) if (pond.assignee_id === userId) pond.assignee_id = null;
      }
      log(
        farmId,
        owner.id,
        active ? "anggota.aktif" : "anggota.nonaktif",
        "member",
        userId,
        `${active ? "Mengaktifkan" : "Menonaktifkan"} ${refOf(userId).full_name}`,
      );
      return memberView(membership);
    },
    assignPonds: async (token, farmId, userId, pondIds) => {
      const owner = userOf(token);
      ownedFarm(token, farmId);
      const membership = technicianOf(farmId, userId);
      if (!membership.active)
        throw new ApiError("VALIDATION_ERROR", "Aktifkan teknisi ini dulu sebelum membagi kolam.");
      const ponds = activePonds(farmId);
      if (pondIds.some((id) => !ponds.some((p) => p.id === id))) {
        throw new ApiError("VALIDATION_ERROR", "Ada kolam yang bukan milik lokasi ini.");
      }
      for (const pond of ponds) {
        if (pondIds.includes(pond.id)) pond.assignee_id = userId;
        else if (pond.assignee_id === userId) pond.assignee_id = null;
      }
      log(
        farmId,
        owner.id,
        "anggota.bagi_kolam",
        "member",
        userId,
        `Membagi ${pondIds.length} kolam ke ${refOf(userId).full_name}`,
      );
      return memberView(membership);
    },
  },
  invitations: {
    create: async (token, farmId, { email, pond_ids }) => {
      const owner = userOf(token);
      const farm = ownedFarm(token, farmId);
      const normalized = email.toLowerCase();
      if (pond_ids.some((id) => !activePonds(farmId).some((p) => p.id === id))) {
        throw new ApiError("VALIDATION_ERROR", "Ada kolam yang bukan milik lokasi ini.");
      }
      const existing = store.users.find((u) => u.email === normalized);
      if (existing && store.memberships.some((m) => m.farm_id === farmId && m.user_id === existing.id)) {
        throw new ApiError("CONFLICT", "Orang ini sudah anggota lokasi.", { email: "Email ini sudah anggota lokasi." });
      }
      const invitationToken = randomBytes(32).toString("hex");
      const invitation: MockInvitation = {
        id: newId("inv"),
        farm_id: farmId,
        email: normalized,
        pond_ids,
        expires_at: new Date(Date.now() + INVITATION_TTL_DAYS * DAY_MS).toISOString(),
        token_hash: hashToken(invitationToken),
        accepted_at: null,
        revoked_at: null,
      };
      store.invitations.push(invitation);
      log(farmId, owner.id, "undangan.kirim", "invitation", invitation.id, `Mengundang ${normalized}`);
      // Pengganti email undangan di mode mock (09-API-KONTRAK K6): backend asli mengirim tautan ini lewat email.
      console.info(`[mock] Undangan ${farm.name} untuk ${normalized}: /undangan/${invitationToken}`);
      return { id: invitation.id, email: invitation.email, expires_at: invitation.expires_at };
    },
    revoke: async (token, invitationId) => {
      const invitation = store.invitations.find((i) => i.id === invitationId && !i.accepted_at && !i.revoked_at);
      if (!invitation) throw invitationGone();
      ownedFarm(token, invitation.farm_id);
      invitation.revoked_at = new Date().toISOString();
    },
    byToken: async (invitationToken) => {
      const invitation = openInvitation(invitationToken);
      const farm = farmOf(invitation.farm_id);
      const owner = store.users.find((u) => u.id === farm.owner_id);
      return {
        farm_name: farm.name,
        owner_name: owner?.full_name ?? "Pemilik tambak",
        email: invitation.email,
        pond_codes: pondCodes(invitation.pond_ids),
        expired: isExpired(invitation),
      };
    },
    accept: async (invitationToken, { full_name, password }) => {
      const invitation = openInvitation(invitationToken);
      if (isExpired(invitation)) {
        throw new ApiError("EXPIRED", "Undangan sudah kedaluwarsa. Minta pemilik tambak mengirim undangan baru.");
      }
      if (store.users.some((u) => u.email === invitation.email)) {
        throw new ApiError("CONFLICT", "Email ini sudah punya akun. Masuk dengan akun tersebut.");
      }
      const user = {
        id: newId("u"),
        full_name,
        email: invitation.email,
        phone_wa: null,
        passwordHash: hashPassword(password),
      };
      store.users.push(user);
      store.memberships.push({ user_id: user.id, farm_id: invitation.farm_id, role: "teknisi", active: true });
      for (const pond of activePonds(invitation.farm_id)) {
        if (invitation.pond_ids.includes(pond.id)) pond.assignee_id = user.id;
      }
      invitation.accepted_at = new Date().toISOString();
      log(invitation.farm_id, user.id, "undangan.terima", "member", user.id, `${full_name} bergabung sebagai teknisi`);
      return signIn(user);
    },
  },
  samples: {
    get: async (token, sampleId) => {
      const sample = store.samples.find((s) => s.id === sampleId);
      if (!sample) throw notFound("Sampel");
      const pond = store.ponds.find((p) => p.id === sample.pond_id);
      if (!pond) throw notFound("Kolam");
      const user = userOf(token);
      const owner = farmOf(pond.farm_id).owner_id === user.id;
      if (!owner) readablePond(token, pond.id);
      return {
        id: sample.id,
        pond: { id: pond.id, pond_code: pond.pond_code },
        batch_id: sample.batch_id,
        sample_code: sample.sample_code,
        sampling_date: sample.sampling_date,
        cycle_day: sample.cycle_day,
        features: sample.features,
        // Teknisi tidak menerima data well (09-API-KONTRAK §9).
        meta: owner ? { wells: sample.wells, standards: STANDARDS, water_log_id: sample.water_log_id } : null,
        sdri_result: resultOf(sample),
        copies_per_ml: sample.copies,
        nh3_mg_l: sample.nh3_mg_l,
      };
    },
    createBatch: async (token, { run, samples }) => {
      const owner = userOf(token);
      const ponds = samples.map((s) => pondOf(s.pond_id));
      const farmId = ponds[0]?.farm_id;
      if (!farmId) throw new ApiError("VALIDATION_ERROR", "Batch tidak berisi sampel.");
      ownedFarm(token, farmId);
      if (ponds.some((p) => p.farm_id !== farmId)) {
        throw new ApiError("VALIDATION_ERROR", "Semua sampel dalam satu batch harus dari lokasi yang sama.");
      }
      const codes = new Set<string>();
      for (const s of samples) {
        if (codes.has(s.sample_code)) throw new ApiError("VALIDATION_ERROR", `Kode sampel ${s.sample_code} ganda.`);
        if (store.samples.some((x) => x.sample_code === s.sample_code && x.pond_id === s.pond_id)) {
          throw new ApiError("CONFLICT", `Sampel ${s.sample_code} sudah pernah dikirim.`);
        }
        codes.add(s.sample_code);
      }
      const batch_id = newId("b");
      store.batches.push({
        id: batch_id,
        farm_id: farmId,
        ...run,
        created_at: new Date().toISOString(),
        control_wells: [],
      });
      const results = samples.map((input) => {
        const { features } = input;
        const sim = simulate(features.ct_ppc, [features.ct_ahpnd, features.ct_wssv, features.ct_ehp]);
        const chem = features.tan_mg_l === null ? null : chemistry(1, 0.5).nh3_mg_l;
        const sample: MockSample = {
          id: newId("s"),
          pond_id: input.pond_id,
          batch_id,
          sample_code: input.sample_code,
          sampling_date: input.sampling_date,
          cycle_day: input.cycle_day,
          features,
          wells: input.meta.wells,
          water_log_id: input.meta.water_log_id,
          ...sim,
          copies: ARCHETYPES[sim.risk_class].copies,
          nh3_mg_l: chem,
        };
        store.samples.push(sample);
        return { sample_code: sample.sample_code, sample_id: sample.id, sdri_result: resultOf(sample) };
      });
      const rejected = results.filter((r) => r.sdri_result.status !== "VALID").length;
      log(
        farmId,
        owner.id,
        "batch.unggah",
        "batch",
        batch_id,
        `Mengunggah hasil lab ${run.file_name} (${results.length} sampel, ${rejected} ditolak)`,
      );
      return { batch_id, results };
    },
  },
  batches: {
    list: async (token, farmId) => {
      ownedFarm(token, farmId);
      return store.batches
        .filter((b) => b.farm_id === farmId)
        .toSorted((a, b) => b.tested_at.localeCompare(a.tested_at))
        .map((b) => {
          const samples = store.samples.filter((s) => s.batch_id === b.id);
          return {
            batch_id: b.id,
            lab_name: b.lab_name,
            instrument: b.instrument,
            tested_at: b.tested_at,
            file_name: b.file_name,
            created_at: b.created_at,
            sample_count: samples.length,
            rejected_count: samples.filter((s) => s.status !== "VALID").length,
          };
        });
    },
    get: async (token, batchId) => {
      const batch = store.batches.find((b) => b.id === batchId);
      if (!batch) throw notFound("Unggahan");
      ownedFarm(token, batch.farm_id);
      const samples = store.samples.filter((s) => s.batch_id === batch.id);
      return {
        batch_id: batch.id,
        lab_name: batch.lab_name,
        instrument: batch.instrument,
        tested_at: batch.tested_at,
        file_name: batch.file_name,
        created_at: batch.created_at,
        sample_count: samples.length,
        rejected_count: samples.filter((s) => s.status !== "VALID").length,
        samples: samples.map((s) => ({
          sample_id: s.id,
          sample_code: s.sample_code,
          pond: { id: s.pond_id, pond_code: store.ponds.find((p) => p.id === s.pond_id)?.pond_code ?? "?" },
          sdri_result: resultOf(s),
        })),
        meta: {
          wells: [
            ...samples.flatMap((s) => s.wells.map((w) => ({ ...w, sample_code: s.sample_code }))),
            ...batch.control_wells,
          ],
          standards: STANDARDS,
        },
      };
    },
  },
  waterLogs: {
    list: async (token, farmId) => {
      ownedFarm(token, farmId);
      const ids = new Set(activePonds(farmId).map((p) => p.id));
      return store.waterLogs
        .filter((w) => ids.has(w.pond_id))
        .toSorted((a, b) => b.measured_at.localeCompare(a.measured_at))
        .map(waterLogView);
    },
  },
  alerts: {
    list: async (token, farmId) => {
      ownedFarm(token, farmId);
      return alertsOf(farmId);
    },
    ack: async (token, alertId) => {
      const owner = userOf(token);
      const alert = store.farms
        .filter((f) => f.owner_id === owner.id)
        .flatMap((f) => alertsOf(f.id))
        .find((a) => a.id === alertId);
      if (!alert) throw notFound("Peringatan");
      const acked_at = new Date().toISOString();
      store.acked.set(alertId, acked_at);
      const pond = pondOf(alert.pond_id);
      log(
        pond.farm_id,
        owner.id,
        "peringatan.tangani",
        "pond",
        pond.id,
        `Menandai peringatan kolam ${pond.pond_code} sudah ditangani`,
      );
      return { ...alert, acked_at };
    },
  },
  tasks: {
    list: async (token, farmId) => {
      ownedFarm(token, farmId);
      return store.tasks
        .filter((t) => t.farm_id === farmId)
        .toSorted((a, b) => a.due_at.localeCompare(b.due_at))
        .map(taskView);
    },
    get: async (token, taskId) => taskDetail(ownedTask(token, taskId).task),
    create: async (token, body) => {
      const owner = userOf(token);
      const pond = ownedPond(token, body.pond_id);
      const member = store.memberships.find(
        (m) => m.farm_id === pond.farm_id && m.user_id === body.assignee_id && m.role === "teknisi" && m.active,
      );
      if (!member) {
        throw new ApiError("VALIDATION_ERROR", "Teknisi tidak aktif di lokasi ini.", {
          assignee_id: "Pilih teknisi aktif di lokasi ini.",
        });
      }
      const now = new Date().toISOString();
      const task: MockTask = {
        id: newId("t"),
        farm_id: pond.farm_id,
        pond_id: pond.id,
        assignee_id: body.assignee_id,
        created_by: owner.id,
        kind: body.kind,
        title: body.title,
        instruction: body.instruction,
        due_at: body.due_at,
        status: "baru",
        owner_note: null,
        source_sample_id: body.source_sample_id ?? null,
        source_alert_id: body.source_alert_id ?? null,
        created_at: now,
        reports: [],
        history: [{ status: "baru", by: owner.id, note: null, at: now }],
      };
      store.tasks.push(task);
      notify(body.assignee_id, "tugas_baru", `Tugas baru: ${body.title}`, "task", task.id);
      log(
        pond.farm_id,
        owner.id,
        "tugas.buat",
        "task",
        task.id,
        `Membuat tugas kolam ${pond.pond_code} untuk ${refOf(body.assignee_id).full_name}`,
      );
      return taskView(task);
    },
    update: async (token, taskId, body) => {
      const { task, user, owner } = ownedTask(token, taskId);
      if (!owner) throw forbidden();
      const closed = ["selesai", "batal"].includes(task.status);
      if (closed) throw new ApiError("CONFLICT", "Tugas ini sudah ditutup.");
      const { status, owner_note, ...fields } = body;
      if (Object.keys(fields).length) {
        if (task.status === "dilaporkan")
          throw new ApiError("CONFLICT", "Tugas yang sudah dilaporkan tidak bisa diubah.");
        Object.assign(task, fields);
      }
      if (status) {
        if (status === "diminta_ulang" && !owner_note?.trim()) {
          throw new ApiError("VALIDATION_ERROR", "Tulis catatan untuk teknisi.", {
            owner_note: "Catatan wajib diisi.",
          });
        }
        if (status !== "batal" && task.status !== "dilaporkan") {
          throw new ApiError("CONFLICT", "Tugas belum dilaporkan teknisi.");
        }
        task.status = status;
        task.owner_note = status === "diminta_ulang" ? (owner_note ?? null) : task.owner_note;
        task.history.push({ status, by: user.id, note: owner_note ?? null, at: new Date().toISOString() });
        const pondCode = pondOf(task.pond_id).pond_code;
        const verb = { selesai: "Menutup", diminta_ulang: "Meminta ulang", batal: "Membatalkan" }[status];
        log(task.farm_id, user.id, `tugas.${status}`, "task", task.id, `${verb} tugas kolam ${pondCode}`);
        if (status !== "selesai") {
          notify(task.assignee_id, "tugas_baru", `${verb} tugas kolam ${pondCode}`, "task", task.id);
        }
      }
      return taskView(task);
    },
    mine: async (token) => {
      const user = userOf(token);
      const farms = new Set(store.memberships.filter((m) => m.user_id === user.id && m.active).map((m) => m.farm_id));
      return store.tasks
        .filter((t) => t.assignee_id === user.id && farms.has(t.farm_id))
        .toSorted((a, b) => a.due_at.localeCompare(b.due_at))
        .map(taskView);
    },
    start: async (token, taskId) => {
      const { task, user } = ownedTask(token, taskId);
      if (task.assignee_id !== user.id) throw forbidden();
      if (!["baru", "diminta_ulang"].includes(task.status)) {
        throw new ApiError("CONFLICT", "Tugas ini sudah dikerjakan atau ditutup.");
      }
      task.status = "dikerjakan";
      task.history.push({ status: "dikerjakan", by: user.id, note: null, at: new Date().toISOString() });
      return taskView(task);
    },
    report: async (token, taskId, { note, measured, photos }) => {
      const { task, user } = ownedTask(token, taskId);
      if (task.assignee_id !== user.id) throw forbidden();
      if (!["baru", "dikerjakan", "diminta_ulang"].includes(task.status)) {
        throw new ApiError("CONFLICT", "Tugas ini sudah dilaporkan atau ditutup.");
      }
      if (photos.length > 4) throw new ApiError("VALIDATION_ERROR", "Maksimal 4 foto.", { photos: "Maksimal 4 foto." });
      if (photos.some((p) => p.size > 1_000_000 || !p.type.startsWith("image/"))) {
        throw new ApiError("VALIDATION_ERROR", "Foto harus gambar dan maksimal 1 MB.", {
          photos: "Foto maksimal 1 MB.",
        });
      }
      const photo_ids: string[] = [];
      for (const photo of photos) {
        const id = newId("f");
        store.files.set(id, { body: await photo.arrayBuffer(), type: photo.type });
        photo_ids.push(id);
      }
      const now = new Date().toISOString();
      const report = { id: newId("r"), note, measured, photo_ids, reported_by: user.id, reported_at: now };
      task.reports.push(report);
      task.status = "dilaporkan";
      task.history.push({ status: "dilaporkan", by: user.id, note: null, at: now });
      const pondCode = pondOf(task.pond_id).pond_code;
      notify(task.created_by, "laporan_masuk", `${user.full_name} melaporkan tugas kolam ${pondCode}`, "task", task.id);
      log(
        task.farm_id,
        user.id,
        "tugas.lapor",
        "task",
        task.id,
        `Melaporkan tugas kolam ${pondCode}${photo_ids.length ? ` dengan ${photo_ids.length} foto` : ""}`,
      );
      return { ...report, photos: photo_ids.map((id) => ({ id, url: `/files/${id}` })), reported_by: refOf(user.id) };
    },
  },
  cycles: {
    record: async (token, body) => {
      const owner = userOf(token);
      const pond = ownedPond(token, body.pond_id);
      if (store.cycles.some((c) => c.pond_id === pond.id && c.cycle_number === body.cycle_number)) {
        throw new ApiError("CONFLICT", `Hasil siklus ${body.cycle_number} sudah dicatat.`, {
          cycle_number: "Siklus ini sudah dicatat.",
        });
      }
      store.cycles.push({
        pond_id: pond.id,
        cycle_number: body.cycle_number,
        outcome: body.outcome,
        actual_harvest_kg: body.actual_harvest_kg ?? 0,
        outbreak_date: body.outbreak_date ?? null,
        primary_suspect_pathogen: body.primary_suspect_pathogen ?? null,
        notes: body.notes ?? null,
      });
      if (body.cycle_number >= pond.current_cycle) pond.current_cycle = body.cycle_number + 1;
      log(
        pond.farm_id,
        owner.id,
        "siklus.catat",
        "pond",
        pond.id,
        `Mencatat hasil siklus ${body.cycle_number} kolam ${pond.pond_code}`,
      );
      return { status: "RECORDED", message: "Hasil siklus berhasil dicatat untuk data kalibrasi V2." };
    },
  },
  notifications: {
    list: async (token) => {
      const user = userOf(token);
      const items = store.notifications
        .filter((n) => n.user_id === user.id)
        .toSorted((a, b) => b.created_at.localeCompare(a.created_at))
        .map((n) => ({
          id: n.id,
          kind: n.kind,
          title: n.title,
          entity: n.entity,
          entity_id: n.entity_id,
          read_at: n.read_at,
          created_at: n.created_at,
        }));
      return { items, unread: items.filter((n) => !n.read_at).length };
    },
    read: async (token, body) => {
      const user = userOf(token);
      const now = new Date().toISOString();
      for (const n of store.notifications) {
        if (n.user_id === user.id && !n.read_at && ("all" in body || body.ids.includes(n.id))) n.read_at = now;
      }
    },
  },
  activity: {
    list: async (token, farmId) => {
      ownedFarm(token, farmId);
      return store.activity
        .filter((a) => a.farm_id === farmId)
        .toSorted((a, b) => b.at.localeCompare(a.at))
        .map((a) => ({
          actor: refOf(a.actor_id),
          action: a.action,
          entity: a.entity,
          entity_id: a.entity_id,
          detail: a.detail,
          at: a.at,
        }));
    },
  },
  reports: {
    whatsapp: async (token, p) => {
      userOf(token);
      // Templat sama dengan backend `internal/report/whatsapp.go` (ikon di isi pesan WA disetujui, K3).
      const [label, icon] =
        p.risk_class === 1
          ? ["Aman (Risiko Minimal)", "✅"]
          : p.risk_class === 2
            ? ["Waspada Ringan", "⚠️"]
            : p.risk_class === 3
              ? ["Waspada Tinggi", "🚨"]
              : p.risk_class === 4
                ? ["Bahaya Kritis", "🛑"]
                : ["Uji Ditolak / Perlu Pengulangan", "❓"];
      const message = [
        `${icon} *LAPORAN MONITORING AQUASEQ*`,
        `Petak: *${p.pond_code}*`,
        `Status: *${label} (${p.probability_pct.toFixed(2)}%)*`,
        `Pemicu Utama: ${p.primary_driver.trim() || "Parameter dalam rentang baseline normal"}`,
        `Rekomendasi Tindakan: ${p.action.trim() || "Pertahankan manajemen air dan aerasi stabil."}`,
        "Catatan: Hasil interpretasi eDNA air. Konsultasikan dengan tim pendamping bila ragu.",
      ].join("\n");
      return { whatsapp_message: message };
    },
  },
  files: {
    get: async (token, fileId) => {
      userOf(token);
      const uploaded = store.files.get(fileId);
      if (uploaded) return { body: uploaded.body, contentType: uploaded.type };
      const known = store.tasks.some((t) => t.reports.some((r) => r.photo_ids.includes(fileId)));
      if (!known) throw notFound("Foto");
      return {
        body: new TextEncoder().encode(SVG_PHOTO("Foto laporan (simulasi)")).buffer,
        contentType: "image/svg+xml",
      };
    },
  },
};
