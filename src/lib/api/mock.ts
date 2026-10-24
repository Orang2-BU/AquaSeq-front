import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Api, Farm, Me, Member, Pond, Role, SdriResult, Tokens } from ".";
import { ApiError } from "./errors";

// Mock backend untuk API_MODE=mock: data SIMULASI di memori, perilaku mengikuti 09-API-KONTRAK.
// ponytail: hilang saat server restart; cukup untuk dev dan demo, tidak untuk banyak instance.

const ACCESS_TTL_SECONDS = 15 * 60;
const INVITATION_TTL_DAYS = 7;
const DAY_MS = 86_400_000;

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  phone_wa: string | null;
  passwordHash: string;
}

type MockFarm = Pick<Farm, "id" | "name" | "regency" | "address" | "provenance" | "archived_at"> & { owner_id: string };

/** Sampel terakhir kolam. Angkanya dari tabel seed, bukan dihitung ulang (03-ARCHITECTURE Q5). */
interface MockSample {
  status: SdriResult["status"];
  probability_pct: number;
  /** 1-4, 0 bila ditolak. */
  risk_class: number;
  sampled_at: string;
}

interface MockPond {
  id: string;
  farm_id: string;
  pond_code: string;
  name: string | null;
  system: "intensif" | "bioflok";
  area_sqm: number | null;
  current_cycle: number;
  assignee_id: string | null;
  sample: MockSample | null;
  trend: Pond["trend"];
  archived_at: string | null;
}

interface MockInvitation {
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

interface Store {
  users: MockUser[];
  farms: MockFarm[];
  memberships: { user_id: string; farm_id: string; role: Role; active: boolean }[];
  ponds: MockPond[];
  invitations: MockInvitation[];
  access: Map<string, { userId: string; expiresAt: number }>;
  refresh: Map<string, string>;
}

/** Teks backend per kelas (`internal/sdri/engine.go`: gerbang PPC dan classifyRisk). */
const BACKEND_TEXT: Record<number, { risk_level: string; recommendation: string }> = {
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

/** Subskor contoh per kelas untuk tampilan rincian; bukan hasil rumus. */
const SAMPLE_SUBSCORES: Record<number, [number, number, number]> = {
  0: [1.4, 1.1, 1.2],
  1: [1.1, 1.3, 1.2],
  2: [2.2, 1.6, 1.5],
  3: [2.6, 2.1, 1.9],
  4: [3.3, 2.7, 2.4],
};

const DEMO_INVITATION_TOKEN = "undangan-demo-sumber-rejeki";

const newId = (prefix: string) => `${prefix}-${randomBytes(6).toString("hex")}`;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(Buffer.from(hash, "hex"), scryptSync(password, salt, 32));
}

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
  // [kode, kelas (0 = ditolak, null = belum ada sampel), peluang %, tren, teknisi]
  type Row = [string, number | null, number, Pond["trend"], string | null];
  const ponds = (farm_id: string, system: MockPond["system"], cycle: number, rows: Row[]) =>
    rows.map(([pond_code, risk_class, probability_pct, trend, assignee_id]): MockPond => ({
      id: `p-${farm_id.slice(2)}-${pond_code.toLowerCase()}`,
      farm_id,
      pond_code,
      name: null,
      system,
      area_sqm: system === "intensif" ? 1200 : 800,
      current_cycle: cycle,
      assignee_id,
      sample:
        risk_class === null
          ? null
          : {
              status: risk_class === 0 ? "REJECTED_INHIBITOR" : "VALID",
              probability_pct,
              risk_class,
              sampled_at: "2026-10-23",
            },
      trend,
      archived_at: null,
    }));
  const invitation = (id: string, email: string, pond_ids: string[], expiresInDays: number, token: string) => ({
    id,
    farm_id: sumber,
    email,
    pond_ids,
    expires_at: new Date(Date.now() + expiresInDays * DAY_MS).toISOString(),
    token_hash: hashToken(token),
    accepted_at: null,
    revoked_at: null,
  });
  return {
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
    ponds: [
      ...ponds(sumber, "intensif", 3, [
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
      ]),
      ...ponds(mina, "bioflok", 2, [
        ["K1", 1, 2.4, "STABLE", null],
        ["K2", 3, 41.2, "RAPID_INCREASE", null],
        ["K3", 1, 1.9, "STABLE", null],
        ["K4", 2, 18.3, "STABLE", null],
        ["K5", 1, 3.5, "STABLE", null],
        ["K6", 1, 2.2, "STABLE", null],
      ]),
    ],
    // Token undangan demo tetap supaya /undangan/undangan-demo-sumber-rejeki bisa dicoba; satu lagi sudah kedaluwarsa.
    invitations: [
      invitation(
        "inv-demo-bayu",
        "bayu@demo.aquaseq.id",
        ["p-sumber-rejeki-c3"],
        INVITATION_TTL_DAYS,
        DEMO_INVITATION_TOKEN,
      ),
      invitation("inv-demo-yusuf", "yusuf.hidayat@demo.aquaseq.id", [], -2, randomBytes(32).toString("hex")),
    ],
    access: new Map(),
    refresh: new Map(),
  };
}

// Proxy dan halaman bisa memuat modul ini sebagai bundel terpisah; globalThis membuat satu proses berbagi satu store.
const holder = globalThis as { __aquaseqMock?: Store };
const store = (holder.__aquaseqMock ??= seed());

const unauthorized = () => new ApiError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk lagi.");
const forbidden = () => new ApiError("FORBIDDEN", "Kamu tidak punya akses ke lokasi ini.");
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

function farmOf(farmId: string): MockFarm {
  const farm = store.farms.find((f) => f.id === farmId);
  if (!farm) throw new ApiError("NOT_FOUND", "Lokasi tidak ditemukan.");
  return farm;
}

/** Lokasi milik pemilik yang sedang masuk; selain itu 403 (09-API-KONTRAK §9). */
function ownedFarm(token: string, farmId: string): MockFarm {
  const user = userOf(token);
  const farm = farmOf(farmId);
  if (farm.owner_id !== user.id) throw forbidden();
  return farm;
}

/** Kolam milik lokasi pemilik yang sedang masuk. */
function ownedPond(token: string, pondId: string): MockPond {
  const pond = store.ponds.find((p) => p.id === pondId && !p.archived_at);
  if (!pond) throw new ApiError("NOT_FOUND", "Kolam tidak ditemukan.");
  ownedFarm(token, pond.farm_id);
  return pond;
}

const activePonds = (farmId: string) => store.ponds.filter((p) => p.farm_id === farmId && !p.archived_at);

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
    at_risk_count: ponds.filter((p) => (p.sample?.risk_class ?? 0) >= 3).length,
  };
}

function resultOf({ status, probability_pct, risk_class }: MockSample): SdriResult {
  const p = probability_pct / 100;
  const [s_qpcr, s_bio, s_chem] = SAMPLE_SUBSCORES[risk_class];
  return {
    status,
    // Logit dari peluang seed (kebalikan sigmoid) supaya z konsisten dengan angka yang tampil.
    z_score: status === "VALID" ? Math.round(Math.log(p / (1 - p)) * 10_000) / 10_000 : 0,
    probability_pct,
    risk_class,
    ...BACKEND_TEXT[risk_class],
    s_qpcr,
    s_bio,
    s_chem,
    model_version: "V1-GSI",
  };
}

function pondView(pond: MockPond): Pond {
  const assignee = store.users.find((u) => u.id === pond.assignee_id);
  const { id, farm_id, pond_code, name, system, area_sqm, current_cycle, sample, trend } = pond;
  return {
    id,
    farm_id,
    pond_code,
    name,
    system,
    area_sqm,
    current_cycle,
    assignee: assignee ? { id: assignee.id, full_name: assignee.full_name } : null,
    latest_result: sample ? resultOf(sample) : null,
    latest_sampling_date: sample?.sampled_at ?? null,
    trend,
  };
}

function memberView(membership: Store["memberships"][number]): Member {
  const user = store.users.find((u) => u.id === membership.user_id);
  if (!user) throw new ApiError("NOT_FOUND", "Anggota tidak ditemukan.");
  return {
    user_id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: membership.role,
    active: membership.active,
    pond_codes: activePonds(membership.farm_id)
      .filter((p) => p.assignee_id === user.id)
      .map((p) => p.pond_code),
    // Tugas belum ada di mock (T21); backend menghitung tugas yang belum ditutup.
    open_tasks: 0,
  };
}

function technicianOf(farmId: string, userId: string) {
  const membership = store.memberships.find((m) => m.farm_id === farmId && m.user_id === userId);
  if (!membership || membership.role !== "teknisi") throw new ApiError("NOT_FOUND", "Teknisi tidak ditemukan.");
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

export const mock: Api = {
  health: async () => ({ status: "healthy", service: "aquaseq-mock", version: "0.1.0" }),
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
      if (!user) throw new ApiError("NOT_FOUND", "Akun demo tidak tersedia.");
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
    create: async (token, farmId, { pond_code, system, area_sqm }) => {
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
        assignee_id: null,
        sample: null,
        trend: "INSUFFICIENT_DATA",
        archived_at: null,
      };
      store.ponds.push(pond);
      return pondView(pond);
    },
    update: async (token, pondId, { pond_code, system, area_sqm }) => {
      const pond = ownedPond(token, pondId);
      const code = pond_code?.toUpperCase();
      if (code && activePonds(pond.farm_id).some((p) => p.pond_code === code && p.id !== pond.id)) {
        throw new ApiError("CONFLICT", `Kode kolam ${code} sudah dipakai.`, { pond_code: "Kode kolam sudah dipakai." });
      }
      if (code) pond.pond_code = code;
      if (system) pond.system = system;
      if (area_sqm !== undefined) pond.area_sqm = area_sqm;
      return pondView(pond);
    },
    archive: async (token, pondId) => {
      const pond = ownedPond(token, pondId);
      pond.archived_at = new Date().toISOString();
      pond.assignee_id = null;
      return pondView(pond);
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
      ownedFarm(token, farmId);
      const membership = technicianOf(farmId, userId);
      membership.active = active;
      if (!active) {
        for (const pond of activePonds(farmId)) if (pond.assignee_id === userId) pond.assignee_id = null;
      }
      return memberView(membership);
    },
    assignPonds: async (token, farmId, userId, pondIds) => {
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
      return memberView(membership);
    },
  },
  invitations: {
    create: async (token, farmId, { email, pond_ids }) => {
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
      return signIn(user);
    },
  },
};
