import type { SampleDetail } from '@/data/types';
import type { RiskClass } from '@/engine/types';
import { fmt, fmtCopies, fmtDate } from '@/ui/format';

/** sdri-v1 §6: tindakan dasar per kelas (isi tidak boleh diubah, hanya diperhalus). */
export const ACTION: Record<RiskClass | 'Ditolak', { title: string; body: string }> = {
  Aman: {
    title: 'Lanjutkan jadwal sampling',
    body: 'Tidak ada sinyal patogen atau stres lingkungan yang berarti.',
  },
  Pantau: {
    title: 'Periksa ulang parameter yang menyimpang',
    body: 'Ukur ulang dalam 2-3 hari dan bandingkan dengan sampel sebelumnya.',
  },
  Waspada: {
    title: 'Perbaiki kualitas air',
    body: 'Tambah aerasi, kurangi pakan, ganti sebagian air, dan percepat sampling berikutnya.',
  },
  Kritis: {
    title: 'Ambil sampel udang untuk konfirmasi lab',
    body: 'Siapkan biosekuriti dan hubungi pendamping. Ini decision support, bukan diagnosis resmi.',
  },
  Ditolak: {
    title: 'Uji ulang sampel',
    body: 'Data gagal kontrol kualitas sehingga skor tidak ditampilkan.',
  },
};

export const classOf = (d: SampleDetail): RiskClass | 'Ditolak' =>
  d.evaluation.sdri?.cls ?? 'Ditolak';

/** Kalimat ringkasan untuk pembaca layar dan WhatsApp. */
export function reasonOf(d: SampleDetail): string {
  const c = d.evaluation.components;
  if (!d.evaluation.sdri) return d.evaluation.gate.reasons[0] ?? 'Gagal kontrol kualitas';
  const parts: string[] = [];
  for (const t of c.patho?.perTarget ?? [])
    if (t.status !== 'tidak terdeteksi')
      parts.push(
        `${t.target} ${t.status === 'di bawah LLOQ' ? 'terdeteksi di bawah batas kuantifikasi' : fmtCopies(t.copiesMl)}`,
      );
  if ((c.chem?.value ?? 0) >= 40) {
    const worst = [...c.chem!.trace]
      .slice(0, -1)
      .sort((a, b) => Number(b.value) - Number(a.value))[0];
    parts.push(`${worst.label} di zona ${Number(worst.value) >= 70 ? 'kritis' : 'peringatan'}`);
  }
  if ((c.nitri?.value ?? 0) >= 40) parts.push('kapasitas nitrifikasi turun');
  if ((c.micro?.value ?? 0) >= 40) parts.push('komunitas mikroba bergeser');
  return parts.length ? parts.join('; ') : 'semua komponen dalam batas aman';
}

/** Pesan WhatsApp petambak (F11): Bahasa Indonesia, ≤ 600 karakter, kelas + alasan + tindakan. */
export function waMessage(d: SampleDetail): string {
  const cls = classOf(d);
  const a = ACTION[cls];
  const lines = [
    `AquaSeq · ${d.pond.name}`,
    `Sampel ${fmtDate(d.sample.takenAt)}${d.sample.doc ? `, DOC ${d.sample.doc}` : ''}`,
    d.evaluation.sdri
      ? `Risiko: ${cls} (SDRI ${fmt(d.evaluation.sdri.value)}/100)`
      : 'Hasil: sampel ditolak, perlu uji ulang',
    `Alasan: ${reasonOf(d)}`,
    `Tindakan: ${a.title}. ${a.body}`,
    d.sample.provenance === 'simulasi' ? 'Catatan: data SIMULASI untuk demo.' : '',
  ].filter(Boolean);
  const text = lines.join('\n');
  return text.length <= 600 ? text : `${text.slice(0, 597)}...`;
}
