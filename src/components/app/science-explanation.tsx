import { BookOpenCheck, ExternalLink, ShieldCheck, Star } from "lucide-react";
import type { SampleExplanation } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Badge, Icon } from "@/components/ui";

type Data = SampleExplanation;
type Explanation = NonNullable<Data["explanation"]>;

/** Satu kode sumber: "FAKTA" = angka dari mesin; selain itu catatan paket pengetahuan (tautan DOI bila ada). */
function SourceChip({ id, sources }: { id: string; sources: Explanation["sources"] }) {
  if (id === "FAKTA") return <span className="source-chip">Data mesin</span>;
  const s = sources.find((x) => x.id === id);
  if (s?.doi) {
    return (
      <a
        className="source-chip link"
        href={`https://doi.org/${s.doi}`}
        target="_blank"
        rel="noopener noreferrer"
        title={s.title}
      >
        {s.source}
        <Icon icon={ExternalLink} size={12} />
        <span className="sr-only">(buka artikel di tab baru)</span>
      </a>
    );
  }
  return (
    <span className="source-chip" title={s?.title}>
      {s?.source ?? id}
    </span>
  );
}

function writerLabel(e: Explanation) {
  if (e.writer === "template") return "Penjelasan template dari aturan mesin";
  return `Ditulis AI (${e.writer_model ?? e.writer}), angka dan sumber diperiksa mesin`;
}

/**
 * Penjelasan ilmiah sampel (P16): ringkasan, alasan bersumber, tindakan, dan batasan dari backend `internal/science`.
 * LLM hanya menulis; setiap angka dan sumber sudah diperiksa backend, dan tanpa AI isinya template.
 */
export function ScienceExplanation({ data, children }: { data: Data | null; children?: React.ReactNode }) {
  const e = data?.explanation ?? null;
  const ai = data?.ai;
  return (
    <section className="panel science-card" aria-labelledby="science-title">
      <div className="section-heading table-heading">
        <div className="edna-head">
          <span className="edna-icon">
            <Icon icon={BookOpenCheck} size={20} />
          </span>
          <div>
            <h2 id="science-title">Penjelasan ilmiah</h2>
            <p>Bahasa sederhana, setiap alasan menyebut sumbernya</p>
          </div>
        </div>
        {e && (
          <Badge tone={e.writer === "template" ? "neutral" : "ok"}>
            {e.writer === "template" ? "Template" : "AI + diperiksa"}
          </Badge>
        )}
      </div>

      {!data ? (
        <p className="table-empty">Server analisis belum menyediakan penjelasan ilmiah untuk sampel ini.</p>
      ) : !e ? (
        <p className="table-empty">
          Penjelasan belum dibuat.{" "}
          {ai?.writer === "template"
            ? "AI belum tersambung di server, jadi penjelasan akan memakai template dari aturan mesin."
            : `Penulis: ${ai?.writer_model ?? ai?.writer}${ai?.picker ? ", pemilih tindakan: Jev" : ""}.`}
        </p>
      ) : (
        <>
          <p className="science-summary">{e.summary}</p>
          {e.priority_action && (
            <div className="science-priority">
              <Icon icon={Star} size={16} />
              <div>
                <strong>Prioritas hari ini</strong>
                <span>{e.priority_action.action}</span>
                <span className="small muted">
                  Dipilih Jev dari daftar mitigasi mesin, keyakinan {Math.round(e.priority_action.confidence * 100)}%
                </span>
              </div>
              {e.priority_action.needs_review && <Badge tone="warn">Perlu dicek manusia</Badge>}
            </div>
          )}
          <div className="microbiome-grid">
            <div className="insight-card">
              <h3>Kenapa</h3>
              <ul className="science-list">
                {e.reasons.map((r) => (
                  <li key={r.text}>
                    <span>{r.text}</span>
                    <span className="source-row">
                      {r.sources.map((id) => (
                        <SourceChip key={id} id={id} sources={e.sources} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="insight-card">
              <h3>Yang bisa dilakukan</h3>
              <ol className="science-list numbered">
                {e.actions.map((a) => (
                  <li key={a.text}>
                    <span>{a.text}</span>
                    <span className="source-row">
                      <SourceChip id={a.source} sources={e.sources} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="science-limits">
            <Icon icon={ShieldCheck} size={16} />
            <ul>
              {e.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <p className="small muted">
            {writerLabel(e)} · {formatDateTime(e.generated_at)}
            {e.fallback_reason ? ` · AI tidak dipakai: ${e.fallback_reason}` : ""}
          </p>
        </>
      )}
      {children}
    </section>
  );
}
