import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function Page() {
  return (
    <section className="solo-center">
      <div className="solo-card">
        <div>
          <h1>Masuk</h1>
          <p>Pantau risiko kolam dan tugas teknisi di semua lokasi tambakmu.</p>
        </div>
        {/* useSearchParams (tujuan setelah masuk) butuh Suspense di cacheComponents. */}
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="small">
          Belum punya akun?{" "}
          <Link className="text-link" href="/daftar">
            Daftar sebagai pemilik
          </Link>
          {" · "}
          <Link className="text-link" href="/lupa-sandi">
            Lupa sandi
          </Link>
        </p>
      </div>
    </section>
  );
}
