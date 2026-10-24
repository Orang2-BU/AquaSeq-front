import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/format";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { SelectFilter } from "@/components/app/select-filter";
import { Badge, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Riwayat unggahan" };

export default function Page({ searchParams }: PageProps<"/lab">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Riwayat unggahan" />}>
        <Batches searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Batches({ searchParams }: Pick<PageProps<"/lab">, "searchParams">) {
  const query = await searchParams;
  const month = one(query.bulan) ?? "";
  const { current } = await getActiveFarms();
  const heading = (
    <div className="page-heading">
      <div>
        <h1>Riwayat unggahan</h1>
        <p>{current ? `${current.name} · satu baris per run plate` : "Hasil lab yang sudah dikirim ke analisis"}</p>
      </div>
      <div className="page-actions">
        <Link className="button primary" href="/lab/unggah">
          <Icon icon={Upload} />
          Unggah hasil lab
        </Link>
      </div>
    </div>
  );
  if (!current) {
    return (
      <>
        {heading}
        <NoFarmState text="Hasil lab dikirim untuk kolam di lokasi tambak. Siapkan lokasi dan kolam dulu." />
      </>
    );
  }
  const batches = await withSession((token) => api.batches.list(token, current.id));
  const months = [...new Set(batches.map((b) => b.tested_at.slice(0, 7)))];
  const shown = month ? batches.filter((b) => b.tested_at.startsWith(month)) : batches;
  const monthLabel = (m: string) =>
    new Date(`${m}-15`).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

  return (
    <>
      {heading}
      {batches.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Belum ada unggahan"
          text="Unggah data eDNA air tambak pertama. Format dan template ada di halaman Format CSV."
        >
          <Link className="button secondary" href="/lab/format">
            Lihat format CSV
          </Link>
        </EmptyState>
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <p className="small muted">
              {shown.length} unggahan · {shown.reduce((a, b) => a + b.sample_count, 0)} sampel
            </p>
            <SelectFilter
              label="Bulan"
              param="bulan"
              value={month}
              basePath="/lab"
              options={[
                { value: "", label: "Semua bulan" },
                ...months.map((m) => ({ value: m, label: monthLabel(m) })),
              ]}
            />
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Tanggal uji</th>
                  <th scope="col">Lab dan alat</th>
                  <th scope="col">Berkas</th>
                  <th scope="col" className="numeric">
                    Sampel
                  </th>
                  <th scope="col">Ditolak</th>
                  <th scope="col">Dikirim</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((b) => (
                  <tr key={b.batch_id}>
                    <td data-label="Tanggal uji" className="table-title">
                      <Link className="table-link plain" href={`/lab/unggahan/${b.batch_id}`}>
                        {formatDate(b.tested_at)}
                      </Link>
                    </td>
                    <td data-label="Lab dan alat">
                      <span className="cell-stack">
                        {b.lab_name}
                        <span className="table-sub">{b.instrument}</span>
                      </span>
                    </td>
                    <td data-label="Berkas" className="mono">
                      {b.file_name}
                    </td>
                    <td data-label="Sampel" className="numeric">
                      {b.sample_count}
                    </td>
                    <td data-label="Ditolak">
                      {b.rejected_count ? (
                        <Badge tone="warn">{b.rejected_count} ditolak</Badge>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td data-label="Dikirim">{formatDateTime(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
