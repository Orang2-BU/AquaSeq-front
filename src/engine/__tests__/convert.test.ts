import {
  copiesPerMl,
  copiesPerRxn,
  foldRegulation,
  freeAmmonia,
  standardCurve,
} from '@/engine/convert';

const CURVE = { slope: -3.35, intercept: 36.6 };
const VOLUMES = { waterMl: 250, elutionUl: 100, templateUl: 5 };

describe('konversi', () => {
  test('kurva standar GSI memberi efisiensi 98,84% dan R² 1', () => {
    // titik dibangkitkan dari m = -3,35, b = 36,6
    const points = [1e1, 1e2, 1e3, 1e4, 1e5].map((copies) => ({
      copiesRxn: copies,
      ct: 36.6 - 3.35 * Math.log10(copies),
    }));
    const c = standardCurve(points);
    expect(c.slope).toBeCloseTo(-3.35, 6);
    expect(c.intercept).toBeCloseTo(36.6, 6);
    expect(c.r2).toBeCloseTo(1, 6);
    expect(c.efficiencyPct).toBeCloseTo(98.84, 2);
  });

  test('pirA POND-TOX = 1,60 × 10⁴ copies/mL', () => {
    const value = copiesPerMl(copiesPerRxn(18.84, CURVE), VOLUMES);
    expect(value / 1e4).toBeCloseTo(1.6, 2);
  });

  test.each([
    ['CTRL', 0.25, 7.8, 0.0121],
    ['POND-BIO', 0.6, 7.9, 0.036],
    ['POND-TOX', 3.2, 8.4, 0.537],
    ['POND-REM', 0.45, 7.85, 0.0242],
  ])('NH3 bebas %s cocok 4 desimal (Emerson)', (_code, tan, ph, expected) => {
    expect(freeAmmonia(tan, ph, 30)).toBeCloseTo(expected, 4);
  });

  test('fold regulation: naik memberi FC, turun memberi -1/FC', () => {
    // ΔCt sampel 2 lebih besar dari CTRL → FC 0,25 → FR -4
    expect(foldRegulation({ amoA: 24, ref16s: 12 }, { amoA: 22, ref16s: 12 })).toBeCloseTo(-4, 6);
    // ΔCt sampel 1 lebih kecil → FC 2 → FR 2
    expect(foldRegulation({ amoA: 21, ref16s: 12 }, { amoA: 22, ref16s: 12 })).toBeCloseTo(2, 6);
  });
});
