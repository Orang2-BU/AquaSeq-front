import { GSI_ARCHETYPES } from '@/data/seed/gsi-archetypes';
import { evaluateSample } from '@/engine/sdri';

// Nilai acuan = keluaran `python scripts/sdri_v1_check.py`. Selisih wajib ≤ 0,1 (07-RULES, sdri-v1 §9).
const EXPECTED: Record<string, { sdri: number; cls: string } | 'DITOLAK'> = {
  CTRL: { sdri: 0.0, cls: 'Aman' },
  'POND-BIO': { sdri: 42.8, cls: 'Waspada' },
  'POND-TOX': { sdri: 100.0, cls: 'Kritis' },
  'POND-REM': { sdri: 80.0, cls: 'Kritis' },
  'UNK-HUMIC': 'DITOLAK',
};

describe('tes emas SDRI v1: 5 arketipe GSI', () => {
  test.each(GSI_ARCHETYPES)('$code sama dengan skrip Python', ({ code, input }) => {
    const result = evaluateSample(input);
    const expected = EXPECTED[code];
    if (expected === 'DITOLAK') {
      expect(result.gate.status).toBe('DITOLAK');
      expect(result.sdri).toBeNull();
      return;
    }
    expect(result.sdri).not.toBeNull();
    expect(Math.abs(result.sdri!.value - expected.sdri)).toBeLessThanOrEqual(0.1);
    expect(result.sdri!.cls).toBe(expected.cls);
  });

  test('komponen POND-TOX: patogen 100, kimia 100, nitrifikasi 80', () => {
    const tox = GSI_ARCHETYPES.find((a) => a.code === 'POND-TOX')!;
    const { components } = evaluateSample(tox.input);
    expect(components.patho!.value).toBeCloseTo(100, 1);
    expect(components.chem!.value).toBeCloseTo(100, 1);
    expect(Math.abs(components.nitri!.value - 80)).toBeLessThanOrEqual(0.5);
  });

  test('POND-BIO: pirA di bawah LLOQ tetap dilaporkan dengan skor 25', () => {
    const bio = GSI_ARCHETYPES.find((a) => a.code === 'POND-BIO')!;
    const pirA = evaluateSample(bio.input).components.patho!.perTarget.find(
      (t) => t.target === 'pirA',
    )!;
    expect(pirA.status).toBe('di bawah LLOQ');
    expect(pirA.score).toBe(25);
  });
});
