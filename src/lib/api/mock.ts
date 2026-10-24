import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Api, Farm, Me, Role, Tokens } from ".";
import { ApiError } from "./errors";

// Mock backend untuk API_MODE=mock: data SIMULASI di memori, perilaku mengikuti 09-API-KONTRAK.
// ponytail: hilang saat server restart; cukup untuk dev dan demo, tidak untuk banyak instance.

const ACCESS_TTL_SECONDS = 15 * 60;
const INVITATION_TTL_DAYS = 7;

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  phone_wa: string | null;
  passwordHash: string;
}

type MockFarm = Pick<Farm, "id" | "name" | "regency" | "address" | "provenance" | "archived_at"> & { owner_id: string };

interface MockPond {
  id: string;
  farm_id: string;
  pond_code: string;
  system: "intensif" | "bioflok";
  area_sqm: number | null;
  assignee_id: string | null;
  /** Kelas risiko sampel terakhir (1-4); diganti data sampel lengkap saat dasbor dibangun (T19). */
  risk_class: number | null;
}

interface Store {
  users: MockUser[];
  farms: MockFarm[];
  memberships: { user_id: string; farm_id: string; role: Role }[];
  ponds: MockPond[];
  invitations: { id: string; farm_id: string; email: string; pond_ids: string[]; expires_at: string }[];
  access: Map<string, { userId: string; expiresAt: number }>;
  refresh: Map<string, string>;
}

const newId = (prefix: string) => `${prefix}-${randomBytes(6).toString("hex")}`;

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
  const pond = (
    farm_id: string,
    pond_code: string,
    system: MockPond["system"],
    assignee_id: string | null,
    risk_class: number,
  ) => ({
    id: `p-${farm_id.slice(2)}-${pond_code.toLowerCase()}`,
    farm_id,
    pond_code,
    system,
    area_sqm: system === "intensif" ? 1200 : 800,
    assignee_id,
    risk_class,
  });
  const sumber = "f-sumber-rejeki";
  const mina = "f-mina-lestari";
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
      { user_id: "u-hendra", farm_id: sumber, role: "pemilik" },
      { user_id: "u-hendra", farm_id: mina, role: "pemilik" },
      { user_id: "u-rizky", farm_id: sumber, role: "teknisi" },
      { user_id: "u-agus", farm_id: sumber, role: "teknisi" },
      { user_id: "u-dwi", farm_id: sumber, role: "teknisi" },
    ],
    ponds: [
      ...["A1", "A2", "A3", "A4"].map((c, i) => pond(sumber, c, "intensif", "u-agus", [1, 2, 1, 1][i])),
      ...["B1", "B2", "B3", "B4"].map((c, i) => pond(sumber, c, "intensif", "u-rizky", [1, 2, 3, 1][i])),
      ...["C1", "C2", "C3", "C4"].map((c, i) => pond(sumber, c, "intensif", "u-dwi", [1, 1, 2, 4][i])),
      ...["K1", "K2", "K3", "K4", "K5", "K6"].map((c, i) => pond(mina, c, "bioflok", null, [1, 3, 1, 2, 1, 1][i])),
    ],
    invitations: [],
    access: new Map(),
    refresh: new Map(),
  };
}

// Proxy dan halaman bisa memuat modul ini sebagai bundel terpisah; globalThis membuat satu proses berbagi satu store.
const holder = globalThis as { __aquaseqMock?: Store };
const store = (holder.__aquaseqMock ??= seed());

const unauthorized = () => new ApiError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk lagi.");
const forbidden = () => new ApiError("FORBIDDEN", "Kamu tidak punya akses ke lokasi ini.");

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

/** Lokasi milik pemilik yang sedang masuk; selain itu 403 (09-API-KONTRAK §9). */
function ownedFarm(token: string, farmId: string): MockFarm {
  const user = userOf(token);
  const farm = store.farms.find((f) => f.id === farmId);
  if (!farm) throw new ApiError("NOT_FOUND", "Lokasi tidak ditemukan.");
  if (farm.owner_id !== user.id) throw forbidden();
  return farm;
}

function summary(farm: MockFarm): Farm {
  const ponds = store.ponds.filter((p) => p.farm_id === farm.id);
  const { id, name, regency, address, provenance, archived_at } = farm;
  return {
    id,
    name,
    regency,
    address,
    provenance,
    archived_at,
    pond_count: ponds.length,
    technician_count: store.memberships.filter((m) => m.farm_id === farm.id && m.role === "teknisi").length,
    at_risk_count: ponds.filter((p) => (p.risk_class ?? 0) >= 3).length,
  };
}

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
      const membership = store.memberships.find((m) => m.role === role);
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
      // Lokasi yang diarsipkan tidak muncul di pemilih lokasi.
      const memberships = store.memberships.flatMap((m) => {
        const farm = store.farms.find((f) => f.id === m.farm_id && !f.archived_at);
        return m.user_id === user.id && farm ? [{ farm_id: farm.id, farm_name: farm.name, role: m.role }] : [];
      });
      return { ...publicUser(user), memberships };
    },
  },
  farms: {
    list: async (token) => {
      const user = userOf(token);
      const ids = new Set(store.memberships.filter((m) => m.user_id === user.id).map((m) => m.farm_id));
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
      store.memberships.push({ user_id: user.id, farm_id: farm.id, role: "pemilik" });
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
    create: async (token, farmId, { pond_code, system, area_sqm }) => {
      ownedFarm(token, farmId);
      const code = pond_code.toUpperCase();
      if (store.ponds.some((p) => p.farm_id === farmId && p.pond_code === code)) {
        throw new ApiError("CONFLICT", `Kode kolam ${code} sudah dipakai.`, { pond_code: "Kode kolam sudah dipakai." });
      }
      const pond: MockPond = {
        id: newId("p"),
        farm_id: farmId,
        pond_code: code,
        system,
        area_sqm: area_sqm ?? null,
        assignee_id: null,
        risk_class: null,
      };
      store.ponds.push(pond);
      return { id: pond.id, farm_id: farmId, pond_code: code, system };
    },
  },
  invitations: {
    create: async (token, farmId, { email, pond_ids }) => {
      ownedFarm(token, farmId);
      if (pond_ids.some((id) => !store.ponds.some((p) => p.id === id && p.farm_id === farmId))) {
        throw new ApiError("VALIDATION_ERROR", "Ada kolam yang bukan milik lokasi ini.");
      }
      const expires_at = new Date(Date.now() + INVITATION_TTL_DAYS * 86_400_000).toISOString();
      const invitation = { id: newId("inv"), farm_id: farmId, email: email.toLowerCase(), pond_ids, expires_at };
      store.invitations.push(invitation);
      return { id: invitation.id, email: invitation.email, expires_at };
    },
  },
};
