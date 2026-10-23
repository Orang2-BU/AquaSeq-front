import { createMockRepository } from '@/data/mock-repository';
import { waMessage } from '@/features/report-text';

function repo() {
  const raw = new Map<string, string>();
  return createMockRepository({
    getItem: async (k) => raw.get(k) ?? null,
    setItem: async (k, v) => void raw.set(k, v),
  });
}

describe('pesan WhatsApp petambak', () => {
  test('memuat kelas, alasan, tindakan, label SIMULASI, ≤ 600 karakter', async () => {
    const d = await repo().getSample('B-03-2026-10-23');
    const text = waMessage(d);
    expect(text.length).toBeLessThanOrEqual(600);
    expect(text).toMatch(/Risiko: Kritis/);
    expect(text).toMatch(/pirA/);
    expect(text).toMatch(/Ambil sampel udang/);
    expect(text).toMatch(/SIMULASI/);
    expect(text).not.toMatch(/probabilitas|%\s*wabah/i);
  });

  test('sampel ditolak: tanpa skor, minta uji ulang', async () => {
    const text = waMessage(await repo().getSample('C-07-2026-10-23'));
    expect(text).toMatch(/ditolak, perlu uji ulang/);
    expect(text).not.toMatch(/SDRI/);
  });
});
