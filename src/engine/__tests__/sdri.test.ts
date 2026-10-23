import { GSI_ARCHETYPES } from '@/data/seed/gsi-archetypes';
import { evaluateSample } from '@/engine/sdri';

const ctrl = GSI_ARCHETYPES.find((a) => a.code === 'CTRL')!.input;
// 35% oportunis → a = 50; Shannon turun 20% dari CTRL → b = 40; S_Micro = 0,6·50 + 0,4·40 = 46
const microbe = { reads: 12000, opportunistPct: 35, shannon: 2.64, ctrlShannon: 3.3 };

describe('komponen mikroba dan penggabungan', () => {
  test('S_Micro dihitung dari oportunis dan penurunan Shannon', () => {
    const { components, sdri } = evaluateSample({ ...ctrl, microbe });
    expect(components.micro!.value).toBeCloseTo(46, 6);
    // E = 0,25·46 / 1,0 / 100 = 0,115 → SDRI = 100·0,69·0,115
    expect(sdri!.value).toBeCloseTo(7.935, 3);
  });

  test('kimia kosong: bobotnya dikeluarkan dan sisa bobot dinormalkan ulang', () => {
    const { gate, sdri } = evaluateSample({ ...ctrl, chemistry: null, microbe });
    expect(gate.status).toBe('TINJAU');
    // E = 0,25·46 / 0,5 / 100 = 0,23 → SDRI = 15,87
    expect(sdri!.value).toBeCloseTo(15.87, 2);
  });

  test('read Nanopore < 5.000: S_Micro dikosongkan, sampel TINJAU', () => {
    const { gate, components } = evaluateSample({ ...ctrl, microbe: { ...microbe, reads: 4000 } });
    expect(gate.status).toBe('TINJAU');
    expect(components.micro).toBeNull();
  });

  test('tanpa patogen terdeteksi SDRI tidak pernah Kritis (maks 69)', () => {
    const worst = GSI_ARCHETYPES.find((a) => a.code === 'POND-TOX')!.input;
    const { sdri } = evaluateSample({
      ...worst,
      cts: { pirA: null, vp28: null, swp1: null },
      microbe: { reads: 20000, opportunistPct: 80, shannon: 0.5, ctrlShannon: 3.3 },
    });
    expect(sdri!.value).toBeLessThanOrEqual(69);
    expect(sdri!.cls).toBe('Waspada');
  });
});
