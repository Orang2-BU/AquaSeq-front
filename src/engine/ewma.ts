import { EWMA } from './params/sdri-v1';

export interface EwmaPoint {
  x: number;
  z: number;
  ucl: number | null;
  signal: boolean;
}

/**
 * sdri-v1 §8: z_t = λx_t + (1 − λ)z_{t−1}; UCL_t = μ0 + 3σ√(λ/(2−λ)·(1 − (1−λ)^{2t})).
 * μ0 dan σ dari 3 sampel pertama siklus. Ditampilkan sebagai "sinyal tren", bukan peringatan.
 */
export function ewma(series: number[]): EwmaPoint[] {
  const { lambda, L, baselineSamples } = EWMA;
  const base = series.slice(0, baselineSamples);
  const hasBase = base.length === baselineSamples;
  const mu = hasBase ? base.reduce((a, b) => a + b, 0) / baselineSamples : 0;
  const sigma = hasBase
    ? Math.sqrt(base.reduce((a, b) => a + (b - mu) ** 2, 0) / (baselineSamples - 1))
    : 0;
  let z = hasBase ? mu : (series[0] ?? 0);
  return series.map((x, i) => {
    z = lambda * x + (1 - lambda) * z;
    const t = i + 1;
    const ucl = hasBase
      ? mu + L * sigma * Math.sqrt((lambda / (2 - lambda)) * (1 - (1 - lambda) ** (2 * t)))
      : null;
    return { x, z, ucl, signal: ucl !== null && z > ucl };
  });
}
