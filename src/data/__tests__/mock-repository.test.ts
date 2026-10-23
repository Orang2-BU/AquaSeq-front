import { createMockRepository, type KeyValueStore } from '@/data/mock-repository';
import { buildSeed } from '@/data/seed';
import { toQpcrCsv } from '@/engine/parse/qpcr-csv';

function memoryStore(initial?: string): KeyValueStore & { raw: Map<string, string> } {
  const raw = new Map<string, string>(initial ? [['aquaseq:data', initial]] : []);
  return {
    raw,
    getItem: async (k) => raw.get(k) ?? null,
    setItem: async (k, v) => void raw.set(k, v),
  };
}

const LATEST = '2026-10-23';

describe('MockRepository', () => {
  test('seed SIMULASI termuat dan semua entitas berlabel simulasi', async () => {
    const store = memoryStore();
    const repo = createMockRepository(store);
    const ponds = await repo.listPonds();
    expect(ponds).toHaveLength(5);
    expect(ponds.every((p) => p.pond.provenance === 'simulasi')).toBe(true);
    expect(store.raw.has('aquaseq:data')).toBe(true);
  });

  test('kolam diurutkan dari SDRI tertinggi; sampel DITOLAK di akhir', async () => {
    const ponds = await createMockRepository(memoryStore()).listPonds();
    expect(ponds.map((p) => p.pond.id)).toEqual(['B-03', 'B-05', 'A-02', 'A-01', 'C-07']);
    const sdri = ponds.map((p) => p.latest?.evaluation.sdri?.value ?? null);
    expect(sdri[0]).toBeCloseTo(100, 1);
    expect(Math.abs(sdri[1]! - 80)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(sdri[2]! - 42.8)).toBeLessThanOrEqual(0.1);
    expect(sdri[3]).toBeCloseTo(0, 1);
    expect(sdri[4]).toBeNull();
    expect(ponds[4].latest!.evaluation.gate.reasons[0]).toMatch(/^PPC 24,46 > 22/);
  });

  test('penyimpanan rusak dimuat ulang dari seed', async () => {
    const repo = createMockRepository(memoryStore('{bukan json'));
    expect(await repo.listPonds()).toHaveLength(5);
  });

  test('keluarkan well: alasan wajib, tercatat, dan SDRI dihitung ulang', async () => {
    const repo = createMockRepository(memoryStore());
    const sampleId = `B-05-${LATEST}`;
    const before = await repo.getSample(sampleId);
    const well = before.run.wells.find((w) => w.sampleCode === 'POND-REM' && w.target === 'pirA')!;
    await expect(repo.excludeWell(before.run.id, well.id, '  ')).rejects.toThrow('Alasan wajib');
    await repo.excludeWell(before.run.id, well.id, 'Kurva leleh ganda');
    const after = await repo.getSample(sampleId);
    expect(after.run.wells.find((w) => w.id === well.id)!.excluded!.reason).toBe(
      'Kurva leleh ganda',
    );
    expect(after.evaluation.sdri!.value).not.toBeCloseTo(before.evaluation.sdri!.value, 3);
  });

  test('sampel DITOLAK tidak bisa diterbitkan', async () => {
    const repo = createMockRepository(memoryStore());
    await expect(repo.publishReport(`C-07-${LATEST}`)).rejects.toThrow('DITOLAK');
  });

  test('menerbitkan laporan sampel lulus', async () => {
    const repo = createMockRepository(memoryStore());
    const history = (await repo.getPond('B-03')).history;
    const report = await repo.publishReport(history[3].sampleId);
    expect((await repo.getSample(history[3].sampleId)).report).toEqual(report);
  });

  test('impor run CSV: kode sampel wajib dipetakan ke kolam', async () => {
    const repo = createMockRepository(memoryStore());
    const run = buildSeed().runs.at(-1)!;
    const csv = toQpcrCsv(run.wells, run.standards);
    const meta = { lab: 'Lab Uji', instrument: 'CFX96', date: '2026-10-24', samples: [] };
    const missing = await repo.importRunCsv(csv, meta);
    expect(!missing.ok && missing.errors[0].message).toMatch(/belum dipetakan/);

    const samples = [
      ['CTRL', 'A-01', 'acuan'],
      ['POND-BIO', 'A-02', 'uji'],
      ['POND-TOX', 'B-03', 'uji'],
      ['POND-REM', 'B-05', 'uji'],
      ['UNK-HUMIC', 'C-07', 'uji'],
    ].map(([code, pondId, role]) => ({ code, pondId, doc: 86, role: role as 'acuan' | 'uji' }));
    const ok = await repo.importRunCsv(csv, { ...meta, samples });
    expect(ok.ok).toBe(true);
    const detail = await repo.getRun(ok.ok ? ok.id : '');
    expect(detail.gate.status).toBe('LULUS');
    expect(detail.samples.find((s) => s.sample.code === 'POND-TOX')!.cls).toBe('Kritis');
  });

  test('riwayat kolam B-03: 8 minggu dan SDRI naik', async () => {
    const pond = await createMockRepository(memoryStore()).getPond('B-03');
    expect(pond.history).toHaveLength(8);
    expect(pond.history[0].sdri!).toBeLessThan(pond.history.at(-1)!.sdri!);
    expect(pond.ndStreak.vp28).toBe(8);
    expect(pond.ndStreak.pirA).toBe(0);
  });

  test('peringatan dari sampel Waspada/Kritis terbaru, bisa ditandai ditangani', async () => {
    const repo = createMockRepository(memoryStore());
    const alerts = await repo.listAlerts();
    expect(alerts.map((a) => a.pond.id)).toEqual(['B-03', 'B-05', 'A-02']);
    await repo.resolveAlert(alerts[0].id);
    expect((await repo.listAlerts())[0].resolved).toBe(true);
  });

  test('reset data demo mengembalikan seed', async () => {
    const repo = createMockRepository(memoryStore());
    await repo.resolveAlert(`B-03-${LATEST}`);
    await repo.resetDemo();
    expect((await repo.listAlerts()).every((a) => !a.resolved)).toBe(true);
  });
});
