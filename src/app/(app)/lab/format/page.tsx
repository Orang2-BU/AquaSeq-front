import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Format CSV" };

const COLUMNS = [
  { name: "well", rule: "Posisi well A1-H12, tidak boleh ganda", example: "C7" },
  { name: "sample_code", rule: "Kode kolam + tanggal sampling. NTC untuk kontrol negatif", example: "B3-1030" },
  { name: "target", rule: "pirA, vp28, swp1, amoA, 16S, atau PPC", example: "pirA" },
  { name: "ct", rule: "Angka 1-50, kosong atau Undetermined bila tidak teramplifikasi", example: "31,10" },
  { name: "tm", rule: "Suhu leleh °C (opsional)", example: "81,2" },
];

const TARGETS = [
  ["pirA", "AHPND (Vibrio parahaemolyticus pembawa toksin PirAB)", "Dua replikat"],
  ["vp28", "WSSV (white spot)", "Satu atau dua replikat"],
  ["swp1", "EHP (Enterocytozoon hepatopenaei)", "Satu atau dua replikat"],
  ["amoA", "Bakteri nitrifikasi (bioindikator)", "Satu"],
  ["16S", "Total bakteri, pembanding amoA", "Satu"],
  ["PPC", "Kontrol kualitas: gerbang inhibitor", "Wajib, satu per sampel"],
];

export default function Page() {
  return (
    <div className="page-enter">
      <Link className="back-link" href="/lab/unggah">
        <Icon icon={ArrowLeft} size={16} />
        Unggah data eDNA
      </Link>
      <div className="page-heading">
        <div>
          <h1>Format CSV data eDNA air tambak</h1>
          <p>
            Satu berkas = satu run plate. Ekspor dari alat boleh dipakai langsung; nama kolom bisa dicocokkan saat
            unggah.
          </p>
        </div>
        <div className="page-actions">
          <a className="button secondary" href="/templates/aquaseq-kelimpahan-contoh.csv" download>
            <Icon icon={Download} />
            Contoh kelimpahan 16S
          </a>
          <a className="button secondary" href="/templates/aquaseq-contoh-simulasi.csv" download>
            <Icon icon={Download} />
            Contoh terisi
          </a>
          <a className="button primary" href="/templates/aquaseq-qpcr-template.csv" download>
            <Icon icon={Download} />
            Unduh template
          </a>
        </div>
      </div>

      <div className="detail-grid reverse">
        <div className="stack">
          <section className="panel" aria-labelledby="columns-title">
            <div className="section-heading table-heading">
              <h2 id="columns-title">Bagian 1: well (wajib)</h2>
            </div>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Kolom</th>
                    <th scope="col">Aturan</th>
                    <th scope="col">Contoh</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMNS.map((c) => (
                    <tr key={c.name}>
                      <td data-label="Kolom" className="table-title mono">
                        {c.name}
                      </td>
                      <td data-label="Aturan">{c.rule}</td>
                      <td data-label="Contoh" className="mono">
                        {c.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel" aria-labelledby="targets-title">
            <div className="section-heading table-heading">
              <h2 id="targets-title">Target yang dibaca</h2>
            </div>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Target</th>
                    <th scope="col">Arti</th>
                    <th scope="col">Replikat</th>
                  </tr>
                </thead>
                <tbody>
                  {TARGETS.map(([target, meaning, reps]) => (
                    <tr key={target}>
                      <td data-label="Target" className="table-title mono">
                        {target}
                      </td>
                      <td data-label="Arti">{meaning}</td>
                      <td data-label="Replikat">{reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel" aria-labelledby="std-title">
            <div className="section-heading table-heading">
              <h2 id="std-title">Bagian 2: kurva standar (disarankan)</h2>
            </div>
            <p className="panel-text">
              Setelah baris well, beri satu baris kosong lalu header{" "}
              <span className="mono">std_level,copies_rxn,ct</span>. Minimal 3 titik supaya slope, efisiensi, dan R²
              bisa diperiksa di pratinjau QC.
            </p>
            <pre className="code-sample">{`well,sample_code,target,ct,tm
A1,B3-1030,pirA,31.10,81.2
B1,B3-1030,pirA,31.30,81.3
G1,B3-1030,PPC,19.80,82.7
H12,NTC,pirA,Undetermined,

std_level,copies_rxn,ct
STD-1,1000000,19.80
STD-2,100000,23.20
STD-3,10000,26.50`}</pre>
          </section>
        </div>

        <aside className="stack">
          <section className="panel">
            <div className="section-heading table-heading">
              <h2>Alat yang sudah diuji</h2>
            </div>
            <ul className="plain-list">
              <li>Bio-Rad CFX96 (ekspor &quot;Quantification Cq Results&quot;)</li>
              <li>Applied Biosystems QuantStudio 5 (ekspor &quot;Results&quot;)</li>
            </ul>
            <p className="small muted">
              Pemisah koma atau titik koma diterima. Desimal boleh pakai titik atau koma. Ukuran maksimal 2 MB.
            </p>
          </section>
          <section className="panel">
            <div className="section-heading table-heading">
              <h2>Sebelum mengunggah</h2>
            </div>
            <ul className="plain-list">
              <li>
                Setiap sampel punya satu well kontrol kualitas. Nilai di luar rentang membuat sampel ditolak backend.
              </li>
              <li>Sertakan NTC untuk pirA, vp28, dan swp1 supaya kontaminasi run terlihat.</li>
              <li>Kode sampel diawali kode kolam supaya cocok otomatis.</li>
            </ul>
            <Link className="button primary wide" href="/lab/unggah">
              <Icon icon={Upload} />
              Mulai unggah
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
