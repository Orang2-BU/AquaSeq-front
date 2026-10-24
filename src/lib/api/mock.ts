import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Api, Me, Role, Tokens } from ".";
import { ApiError } from "./errors";

// Mock backend untuk API_MODE=mock: data SIMULASI di memori, perilaku mengikuti 09-API-KONTRAK.
// ponytail: hilang saat server restart; cukup untuk dev dan demo, tidak untuk banyak instance.

const ACCESS_TTL_SECONDS = 15 * 60;

interface MockUser {
  id: string;
  full_name: string;
  email: string;
  phone_wa: string | null;
  passwordHash: string;
}

interface Store {
  users: MockUser[];
  memberships: { user_id: string; farm_id: string; farm_name: string; role: Role }[];
  access: Map<string, { userId: string; expiresAt: number }>;
  refresh: Map<string, string>;
}

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
  const demoHash = () => hashPassword(randomBytes(24).toString("hex"));
  return {
    users: [
      {
        id: "u-hendra",
        full_name: "Hendra Kusuma",
        email: "hendra@demo.aquaseq.id",
        phone_wa: "6281234560917",
        passwordHash: demoHash(),
      },
      {
        id: "u-rizky",
        full_name: "Rizky Pratama",
        email: "rizky@demo.aquaseq.id",
        phone_wa: "6285790213348",
        passwordHash: demoHash(),
      },
    ],
    memberships: [
      { user_id: "u-hendra", farm_id: "f-sumber-rejeki", farm_name: "Tambak Sumber Rejeki", role: "pemilik" },
      { user_id: "u-hendra", farm_id: "f-mina-lestari", farm_name: "Tambak Mina Lestari", role: "pemilik" },
      { user_id: "u-rizky", farm_id: "f-sumber-rejeki", farm_name: "Tambak Sumber Rejeki", role: "teknisi" },
    ],
    access: new Map(),
    refresh: new Map(),
  };
}

// Proxy dan halaman bisa memuat modul ini sebagai bundel terpisah; globalThis membuat satu proses berbagi satu store.
const holder = globalThis as { __aquaseqMock?: Store };
const store = (holder.__aquaseqMock ??= seed());

const unauthorized = () => new ApiError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk lagi.");

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
        id: `u-${randomBytes(6).toString("hex")}`,
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
      const session = store.access.get(token);
      const user = store.users.find((u) => u.id === session?.userId);
      if (!session || !user || session.expiresAt < Date.now()) throw unauthorized();
      const memberships = store.memberships
        .filter((m) => m.user_id === user.id)
        .map(({ farm_id, farm_name, role }) => ({ farm_id, farm_name, role }));
      return { ...publicUser(user), memberships };
    },
  },
};
