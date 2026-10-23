import { negativeConfidence } from '@/engine/confidence';
import { ewma } from '@/engine/ewma';

describe('keyakinan hasil negatif', () => {
  test.each([
    [1, 45],
    [2, 70],
    [4, 91],
    [6, 97],
  ])('%i sampel triplikat ≈ %i%%', (samples, pct) => {
    expect(Math.round(negativeConfidence(samples, 3).value * 100)).toBe(pct);
  });

  test('menyarankan 6 sampel untuk mencapai ≥ 95%', () => {
    // 4 sampel = 90,7% (< 95%), 5 sampel = 94,9% (< 95%), 6 sampel = 97,2%
    expect(negativeConfidence(1, 3).samplesFor95).toBe(6);
  });
});

describe('EWMA', () => {
  test('memberi sinyal pada deret yang naik', () => {
    const result = ewma([20, 22, 21, 24, 30, 41, 55, 70]);
    expect(result.some((p) => p.signal)).toBe(true);
    expect(result.at(-1)!.signal).toBe(true);
  });

  test('tidak memberi sinyal pada deret datar yang bergoyang kecil', () => {
    const result = ewma([20, 22, 21, 20, 22, 21, 20, 22]);
    expect(result.some((p) => p.signal)).toBe(false);
  });

  test('kurang dari 3 sampel: belum ada batas kontrol', () => {
    expect(ewma([20, 25]).every((p) => p.ucl === null && !p.signal)).toBe(true);
  });
});
