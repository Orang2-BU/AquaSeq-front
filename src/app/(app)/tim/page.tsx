import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Rocket, Users } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { formatDate, isPast } from "@/lib/format";
import { EmptyState } from "@/components/app/empty-state";
import { Badge, Icon } from "@/components/ui";
import { InvitationRowActions, InviteButton, MemberRowActions } from "./team-actions";

export const metadata: Metadata = { title: "Tim" };

export default function Page() {
  return (
    <div className="page-enter">
      <Suspense
        fallback={
          <>
            <div className="page-heading">
              <h1>Tim</h1>
            </div>
            <section className="panel location-grid-skeleton" aria-busy="true" aria-label="Memuat tim" />
          </>
        }
      >
        <Team />
      </Suspense>
    </div>
  );
}

async function Team() {
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Tim</h1>
        </div>
        <EmptyState
          icon={Users}
          title="Belum ada lokasi aktif"
          text="Buat lokasi tambak dulu, lalu undang teknisi ke sana."
        >
          <Link className="button primary" href="/mulai">
            <Icon icon={Rocket} />
            Siapkan tambak
          </Link>
        </EmptyState>
      </>
    );
  }
  const [{ items, invitations }, ponds] = await Promise.all([
    withSession((token) => api.members.list(token, current.id)),
    withSession((token) => api.ponds.list(token, current.id)),
  ]);
  const technicians = items
    .filter((m) => m.role === "teknisi")
    .toSorted((a, b) => Number(b.active) - Number(a.active) || a.full_name.localeCompare(b.full_name));
  const pondOptions = ponds
    .map(({ id, pond_code, assignee }) => ({ id, pond_code, assignee }))
    .toSorted((a, b) => a.pond_code.localeCompare(b.pond_code));
  const unassigned = ponds.filter((p) => !p.assignee).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Tim</h1>
          <p>
            {current.name} · {technicians.filter((m) => m.active).length} teknisi aktif
            {unassigned > 0 && ` · ${unassigned} kolam belum dipegang`}
          </p>
        </div>
        <div className="page-actions">
          <InviteButton farmId={current.id} ponds={pondOptions} />
        </div>
      </div>

      {technicians.length === 0 && invitations.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada teknisi"
          text="Undang teknisi lewat email. Mereka hanya melihat kolam yang kamu bagikan."
        />
      ) : (
        <div className="stack">
          <section className="panel" aria-labelledby="teknisi-heading">
            <div className="section-heading table-heading">
              <h2 id="teknisi-heading">Teknisi</h2>
            </div>
            {technicians.length === 0 ? (
              <p className="table-empty">Belum ada teknisi yang bergabung. Undangan tertunda ada di bawah.</p>
            ) : (
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Nama</th>
                      <th scope="col">Kolam dipegang</th>
                      <th scope="col" className="numeric">
                        Tugas terbuka
                      </th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((member) => (
                      <tr key={member.user_id}>
                        <td data-label="Nama" className="table-title">
                          <span>{member.full_name}</span>
                          <span className="table-sub">{member.email}</span>
                        </td>
                        <td data-label="Kolam dipegang">
                          {member.pond_codes.length ? (
                            <span className="mono">{member.pond_codes.join(", ")}</span>
                          ) : (
                            <span className="muted">Belum ada</span>
                          )}
                        </td>
                        <td data-label="Tugas terbuka" className="numeric">
                          {member.open_tasks}
                        </td>
                        <td data-label="Status">
                          <Badge tone={member.active ? "ok" : "neutral"}>{member.active ? "Aktif" : "Nonaktif"}</Badge>
                        </td>
                        <td className="table-action">
                          <MemberRowActions farmId={current.id} member={member} ponds={pondOptions} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {invitations.length > 0 && (
            <section className="panel" aria-labelledby="undangan-heading">
              <div className="section-heading table-heading">
                <h2 id="undangan-heading">Undangan tertunda</h2>
              </div>
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Email</th>
                      <th scope="col">Kolam</th>
                      <th scope="col">Berlaku sampai</th>
                      <th scope="col">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td data-label="Email" className="table-title">
                          {invitation.email}
                        </td>
                        <td data-label="Kolam">
                          {invitation.pond_codes.length ? (
                            <span className="mono">{invitation.pond_codes.join(", ")}</span>
                          ) : (
                            <span className="muted">Belum dibagi</span>
                          )}
                        </td>
                        <td data-label="Berlaku sampai">
                          {isPast(invitation.expires_at) ? (
                            <Badge tone="warn">Kedaluwarsa</Badge>
                          ) : (
                            formatDate(invitation.expires_at)
                          )}
                        </td>
                        <td className="table-action">
                          <InvitationRowActions invitation={invitation} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
