import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageSkeleton } from "@/components/app/page-parts";
import { PasswordForm, ProfileForm } from "./settings-forms";

export const metadata: Metadata = { title: "Pengaturan akun" };

export default function Page() {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Pengaturan akun" />}>
        <Settings />
      </Suspense>
    </div>
  );
}

async function Settings() {
  const me = await getCurrentUser();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Pengaturan akun</h1>
          <p>Profil dan sandi untuk {me.email}</p>
        </div>
      </div>
      <div className="dashboard-grid even">
        <section className="panel" aria-labelledby="profile-title">
          <div className="section-heading table-heading">
            <h2 id="profile-title">Profil</h2>
          </div>
          <div className="form-card">
            <ProfileForm
              name={me.full_name}
              email={me.email}
              phone={me.phone_wa ? me.phone_wa.replace(/^62/, "0") : ""}
            />
          </div>
        </section>
        <section className="panel" aria-labelledby="password-title">
          <div className="section-heading table-heading">
            <h2 id="password-title">Ganti sandi</h2>
          </div>
          <div className="form-card">
            <PasswordForm />
          </div>
        </section>
      </div>
    </>
  );
}
