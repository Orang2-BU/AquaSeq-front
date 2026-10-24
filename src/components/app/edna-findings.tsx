import { Bug, CircleCheck, Microscope, ShieldAlert } from "lucide-react";
import type { EngineeredFeature, SdriResult } from "@/lib/api";
import { NO_TARGET, evidenceRank, evidenceTone, featureLabel, mitigationList } from "@/lib/edna";
import { formatNumber } from "@/lib/format";
import { Badge, Icon } from "@/components/ui";

type Result = Pick<SdriResult, "status" | "predicted_disease" | "disease_name" | "evidence" | "mitigation_actions">;

const GROUPS = [
  { key: "mikroba", title: "Mikroba air" },
  { key: "patogen", title: "Jejak patogen" },
  { key: "kimia", title: "Kimia air" },
  { key: "kontrol", title: "Kontrol kualitas" },
] as const;

/** Angka temuan sesuai satuannya: kopi/mL bulat, mg/L kimia 3 desimal, rasio 2 desimal. */
function valueText(code: string, value: number | null) {
  if (value === null) return "Belum bisa dihitung";
  const { unit } = featureLabel(code);
  const digits = unit === "kopi/mL" ? 0 : unit === "mg/L" ? 3 : 2;
  return `${formatNumber(value, digits)}${unit ? ` ${unit}` : ""}`;
}

/** Teks ambang backend lebih mudah dibaca: `>=` jadi `≥`, pemisah `;` jadi titik tengah. */
const thresholdText = (t: string | number) =>
  String(t).replaceAll(">=", "≥").replaceAll("<=", "≤").replaceAll(";", " ·");

/** Judul dugaan penyakit dari backend. "Belum ada target" bukan bukti kolam bebas penyakit. */
export function DiseaseLine({ result, inverse = false }: { result: Result; inverse?: boolean }) {
  if (result.status !== "VALID" || !result.disease_name) return null;
  const clear = result.predicted_disease === NO_TARGET;
  return (
    <p className={`disease-line ${clear ? "clear" : ""} ${inverse ? "inverse" : ""}`}>
      <Icon icon={clear ? CircleCheck : Bug} size={16} />
      <span>
        <span className="disease-kicker">{clear ? "Hasil eDNA" : "Dugaan dari eDNA"}</span> {result.disease_name}
      </span>
    </p>
  );
}

/**
 * Kartu temuan eDNA mikroba (P16, P15, P37): dugaan penyakit, parameter X1-X12, dan langkah mitigasi.
 * Bila `features` (semua X1-X12 dari detail sampel) ada, semuanya tampil; tanpa itu hanya `evidence` (yang
 * melewati ambang). Semua isi dari backend; web hanya mengelompokkan dan memberi label.
 */
export function EdnaFindings({
  result,
  features,
  limit,
}: {
  result: Result;
  features?: EngineeredFeature[] | null;
  limit?: number;
}) {
  if (result.status !== "VALID") return null;
  const full = features?.length
    ? features.map(({ name, value, threshold, status }) => ({ feature: name, value, threshold, status }))
    : null;
  const rows = (full ?? result.evidence ?? []).toSorted((a, b) => evidenceRank(a.status) - evidenceRank(b.status));
  const outside = rows.filter((r) => r.status === "kritis" || r.status === "peringatan").length;
  const actions = mitigationList(result).slice(0, limit);
  return (
    <section className="edna-card" aria-labelledby="edna-title">
      <div className="edna-head">
        <span className="edna-icon">
          <Icon icon={Microscope} size={20} />
        </span>
        <div>
          <h2 id="edna-title">Temuan eDNA mikroba</h2>
          <DiseaseLine result={result} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="edna-clear">
          <Icon icon={CircleCheck} size={16} /> Semua parameter yang diuji masih dalam ambang aman.
        </p>
      ) : (
        <>
          {full && (
            <p className="small muted">
              {full.length} parameter dari mesin, {outside} melewati ambang aman.
            </p>
          )}
          <div className="edna-groups">
            {GROUPS.map((group) => {
              const items = rows.filter((e) => featureLabel(e.feature).group === group.key);
              if (!items.length) return null;
              return (
                <div key={group.key} className="edna-group">
                  <h3>{group.title}</h3>
                  <ul>
                    {items.map((e) => {
                      const tone = evidenceTone(e.status);
                      return (
                        <li key={e.feature}>
                          <span className="edna-feature">
                            <strong>{featureLabel(e.feature).label}</strong>
                            <span className="small muted">Ambang: {thresholdText(e.threshold)}</span>
                          </span>
                          <span className="edna-value">{valueText(e.feature, e.value)}</span>
                          <Badge tone={tone.tone}>{tone.label}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}

      {actions.length > 0 && (
        <div className="edna-actions">
          <h3>
            <Icon icon={ShieldAlert} size={16} /> Langkah mitigasi
          </h3>
          <ol>
            {actions.map((a) => (
              <li key={a.action}>
                <span>{a.action}</span>
                {a.source && <span className="small muted">{a.source}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="small muted edna-note">Hasil eDNA air adalah alat bantu keputusan, bukan diagnosis klinis.</p>
    </section>
  );
}
