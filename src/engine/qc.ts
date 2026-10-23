import { GATE } from './params/sdri-v1';
import type { Gate, SampleInput } from './types';

const id = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 });

/** sdri-v1 §3: kurva standar gagal → seluruh run DITOLAK. */
export function runGate(curve: { efficiencyPct: number; r2: number }): Gate {
  const reasons: string[] = [];
  if (curve.efficiencyPct < GATE.efficiencyMinPct || curve.efficiencyPct > GATE.efficiencyMaxPct)
    reasons.push(`Efisiensi ${id(curve.efficiencyPct)}% di luar 90-110%`);
  if (curve.r2 < GATE.r2Min) reasons.push(`R² ${id(curve.r2)} < 0,98`);
  return { status: reasons.length ? 'DITOLAK' : 'LULUS', reasons };
}

/** sdri-v1 §3: gerbang per sampel. DITOLAK tidak diberi skor; TINJAU diberi skor dengan tanda. */
export function sampleGate(s: SampleInput): Gate {
  const rejected: string[] = [];
  const review: string[] = [];
  if (s.ppcCt === null || s.ppcCt > GATE.ppcMaxCt)
    rejected.push(
      `PPC ${s.ppcCt === null ? 'tidak teramplifikasi' : id(s.ppcCt)} > 22: inhibisi, purifikasi atau encerkan 1:10 lalu uji ulang`,
    );
  if (!s.ref16sDetected) rejected.push('16S tidak terdeteksi: DNA tidak terekstrak');
  for (const t of s.ntcContaminated) rejected.push(`NTC ${t} teramplifikasi: kontaminasi`);
  if (s.replicateSdMax > GATE.replicateSdMax)
    review.push(`SD replikat ${id(s.replicateSdMax)} > 0,20: periksa well pencilan`);
  if (!s.chemistry) review.push('Kimia air wajib belum lengkap: komponen kimia dikosongkan');
  if (s.microbe && s.microbe.reads < GATE.nanoporeMinReads)
    review.push(
      `Read Nanopore ${s.microbe.reads.toLocaleString('id-ID')} < 5.000: komponen mikroba dikosongkan`,
    );
  if (rejected.length) return { status: 'DITOLAK', reasons: rejected };
  return { status: review.length ? 'TINJAU' : 'LULUS', reasons: review };
}
