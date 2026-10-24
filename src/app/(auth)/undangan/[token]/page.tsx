import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { api, ApiError, type InvitationInfo } from "@/lib/api";
import { AcceptForm } from "./accept-form";

export const metadata: Metadata = { title: "Terima undangan" };

export default function Page({ params }: PageProps<"/undangan/[token]">) {
  return (
    <section className="solo-center">
      <div className="solo-card">
        <Suspense fallback={<p aria-busy="true">Memeriksa undangan...</p>}>
          <Invitation params={params} />
        </Suspense>
      </div>
    </section>
  );
}

async function Invitation({ params }: Pick<PageProps<"/undangan/[token]">, "params">) {
  // Undangan selalu dibaca per permintaan (status bisa berubah: dipakai, dibatalkan, kedaluwarsa).
  await connection();
  const { token } = await params;
  let info: InvitationInfo | null = null;
  try {
    info = token.length <= 200 ? await api.invitations.byToken(token) : null;
  } catch (error) {
    if (!(error instanceof ApiError && error.code === "NOT_FOUND")) throw error;
  }

  if (!info || info.expired) {
    return (
      <>
        <div>
          <h1>{info ? "Undangan kedaluwarsa" : "Undangan tidak berlaku"}</h1>
          <p>
            {info
              ? `Undangan ke ${info.farm_name} sudah lewat 7 hari. Minta ${info.owner_name} mengirim undangan baru.`
              : "Tautan ini sudah dipakai, dibatalkan, atau salah ketik. Minta pemilik tambak mengirim undangan baru."}
          </p>
        </div>
        <p className="small">
          Sudah punya akun?{" "}
          <Link className="text-link" href="/masuk">
            Masuk
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div>
        <h1>Bergabung ke {info.farm_name}</h1>
        <p>
          {info.owner_name} mengundangmu sebagai teknisi.
          {info.pond_codes.length > 0 && (
            <>
              {" "}
              Kolam yang kamu pegang: <span className="mono">{info.pond_codes.join(", ")}</span>.
            </>
          )}
        </p>
      </div>
      <AcceptForm token={token} email={info.email} />
      <p className="small">
        Sudah punya akun?{" "}
        <Link className="text-link" href="/masuk">
          Masuk
        </Link>
      </p>
    </>
  );
}
