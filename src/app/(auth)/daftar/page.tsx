import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar pemilik" };

export default function Page() {
  return (
    <section className="solo-center">
      <div className="solo-card">
        <div>
          <h1>Daftar pemilik</h1>
          <p>Teknisi tidak perlu daftar sendiri. Kamu bisa mengundang mereka setelah lokasi tambak dibuat.</p>
        </div>
        <RegisterForm />
        <p className="small">
          Sudah punya akun?{" "}
          <Link className="text-link" href="/masuk">
            Masuk
          </Link>
        </p>
      </div>
    </section>
  );
}
