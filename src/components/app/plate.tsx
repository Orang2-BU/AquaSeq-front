import { formatNumber } from "@/lib/format";

export type PlateWell = {
  position: string;
  target: string;
  ct: number | null;
  sample_code: string;
  excluded_reason?: string | null;
};

const ROWS = "ABCDEFGH".split("");
const COLS = Array.from({ length: 12 }, (_, i) => i + 1);
/** Rentang Ct untuk warna: makin kecil Ct makin banyak target, makin pekat. */
const CT_MIN = 15;
const CT_MAX = 40;

/**
 * Heatmap plate 96-well (08-DESIGN pola QC): Ct sebagai warna `neutral-fill` → `accent-fill`,
 * Undetermined berarsir, well di luar `highlight` diredupkan.
 */
export function Plate({ wells, highlight }: { wells: PlateWell[]; highlight?: string }) {
  const byPosition = new Map(wells.map((w) => [w.position, w]));
  return (
    <div className="plate-scroll">
      <table className="plate" aria-label="Plate 96-well">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Baris</span>
            </th>
            {COLS.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {COLS.map((col) => {
                const position = `${row}${col}`;
                const well = byPosition.get(position);
                if (!well) {
                  return (
                    <td key={position} className="well empty">
                      <span className="sr-only">{position} kosong</span>
                    </td>
                  );
                }
                const heat = well.ct === null ? 0 : Math.min(1, Math.max(0, (CT_MAX - well.ct) / (CT_MAX - CT_MIN)));
                const dim = highlight && well.sample_code !== highlight;
                const label = `${position}, ${well.sample_code}, ${well.target}, ${
                  well.ct === null ? "Undetermined" : formatNumber(well.ct)
                }${well.excluded_reason ? `, dikeluarkan: ${well.excluded_reason}` : ""}`;
                return (
                  <td
                    key={position}
                    className={`well ${well.ct === null ? "undetermined" : ""} ${dim ? "dim" : ""} ${well.excluded_reason ? "excluded" : ""}`}
                    style={{ "--heat": heat } as React.CSSProperties}
                    title={label}
                  >
                    <span className="sr-only">{label}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="plate-legend small muted">
        Warna makin pekat = kadar jejak patogen makin tinggi. Arsir = Undetermined (tidak teramplifikasi).
      </p>
    </div>
  );
}
