import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, FlaskConical, ShieldAlert, TriangleAlert } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, loadEntity } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatProbability, rejectedReason, riskRank } from "@/lib/risk";
import { Metric, PageSkeleton } from "@/components/app/page-parts";
import { Plate } from "@/components/app/plate";
import { RiskBadge } from "@/components/app/risk-badge";
import { Badge, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Detail unggahan" };

export default function Page({ params }: PageProps<"/lab/unggahan/[batchId]">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Detail unggahan" />}>
        <BatchDetail params={params} />
      </Suspense>
    </div>
  );
}

async function BatchDetail({ params }: Pick<PageProps<"/lab/unggahan/[batchId]">, "params">) {
  const { batchId } = await params;
  const [batch, { current }] = await Promise.all([
    loadEntity((token) => api.batches.get(token, batchId)),
    getActiveFarms(),
  ]);
  const samples = batch.samples.toSorted((a, b) => riskRank(b.sdri_result) - riskRank(a.sdri_result));
  const valid = samples.filter((s) => s.sdri_result.status === "VALID");
  const atRisk = valid.filter((s) => s.sdri_result.risk_class >= 3).length;
  const allRejected = samples.length > 0 && valid.length === 0;

  return (
    <>
      <Link className="back-link" href="/lab">
        <Icon icon={ArrowLeft} size={16} />
        Riwayat unggahan
      </Link>
      <div className="page-heading">
        <div>
          <h1>Hasil uji {formatDate(batch.tested_at)}</h1>
          <p>
            {batch.lab_name} · {batch.instrument} · <span className="mono">{batch.file_name}</span> · dikirim{" "}
            {formatDateTime(batch.created_at)}
          </p>
        </div>
        {current?.provenance === "simulasi" && <Badge tone="warn">Data simulasi</Badge>}
      </div>

      <section className="metric-grid three" aria-label="Ringkasan batch">
        <Metric icon={FlaskConical} label="Sampel" value={batch.sample_count}>
          {valid.length} valid
        </Metric>
        <Metric icon={ShieldAlert} label="Kolam berisiko" value={atRisk} risk={atRisk > 0}>
          Kelas Waspada tinggi atau Bahaya
        </Metric>
        <Metric icon={TriangleAlert} label="Sampel ditolak" value={batch.rejected_count}>
          {batch.rejected_count ? "Perlu ambil sampel ulang" : "Semua lolos gerbang PPC"}
        </Metric>
      </section>

      {allRejected && (
        <section className="reject-box" role="status">
          <h2>Semua sampel ditolak</h2>
          <p>Periksa PPC dan proses ekstraksi run ini, lalu uji ulang sampelnya.</p>
        </section>
      )}

      <div className="detail-grid reverse">
        <section className="panel" aria-labelledby="results-title">
          <div className="section-heading table-heading">
            <h2 id="results-title">Hasil per sampel</h2>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Sampel</th>
                  <th scope="col">Kolam</th>
                  <th scope="col" className="numeric">
                    Peluang
                  </th>
                  <th scope="col">Kelas</th>
                  <th scope="col">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s) => (
                  <tr key={s.sample_id}>
                    <td data-label="Sampel" className="table-title">
                      <Link className="mono table-link" href={`/sampel/${s.sample_id}`}>
                        {s.sample_code}
                      </Link>
                    </td>
                    <td data-label="Kolam">
                      <Link className="mono" href={`/kolam/${s.pond.id}`}>
                        {s.pond.pond_code}
                      </Link>
                    </td>
                    <td data-label="Peluang" className="numeric">
                      {s.sdri_result.status === "VALID" ? formatProbability(s.sdri_result.probability_pct) : "-"}
                    </td>
                    <td data-label="Kelas">
                      <RiskBadge result={s.sdri_result} />
                    </td>
                    <td data-label="Catatan" className="table-note-cell">
                      {s.sdri_result.status === "VALID"
                        ? s.sdri_result.recommendation
                        : rejectedReason(s.sdri_result.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel" aria-labelledby="plate-title">
          <div className="section-heading table-heading">
            <h2 id="plate-title">Plate</h2>
          </div>
          <Plate wells={batch.meta.wells} />
        </section>
      </div>
    </>
  );
}
