import type { Curve, Volumes } from './types';

/** Interpolasi linear yang dibatasi ke rentang [y0, y1]. */
export function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  const y = y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  return Math.min(Math.max(y, Math.min(y0, y1)), Math.max(y0, y1));
}

/** sdri-v1 §4: regresi Ct terhadap log10(salinan/rxn) → slope, intercept, R², efisiensi (%). */
export function standardCurve(points: { copiesRxn: number; ct: number }[]) {
  const xs = points.map((p) => Math.log10(p.copiesRxn));
  const ys = points.map((p) => p.ct);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const slope = sxy / sxx;
  return {
    slope,
    intercept: my - slope * mx,
    r2: syy === 0 ? 1 : (sxy * sxy) / (sxx * syy),
    efficiencyPct: (10 ** (-1 / slope) - 1) * 100,
  };
}

/** sdri-v1 §4: N_rxn = 10^((b − Ct) / |m|), salinan per reaksi. */
export function copiesPerRxn(ct: number, curve: Curve): number {
  return 10 ** ((curve.intercept - ct) / Math.abs(curve.slope));
}

/** sdri-v1 §4: copies/mL air = N_rxn × (V_elusi / V_template) / V_air. */
export function copiesPerMl(nRxn: number, v: Volumes): number {
  return (nRxn * (v.elutionUl / v.templateUl)) / v.waterMl;
}

/** sdri-v1 §4: NH3-N bebas (mg/L), Emerson dkk. 1975. */
export function freeAmmonia(tan: number, ph: number, temperatureC: number): number {
  const pKa = 0.09018 + 2729.92 / (temperatureC + 273.15);
  return tan / (10 ** (pKa - ph) + 1);
}

/** sdri-v1 §4: fold regulation amoA terhadap CTRL (konvensi RT²). */
export function foldRegulation(
  sample: { amoA: number; ref16s: number },
  ctrl: { amoA: number; ref16s: number },
): number {
  const ddCt = sample.amoA - sample.ref16s - (ctrl.amoA - ctrl.ref16s);
  const fc = 2 ** -ddCt;
  return fc >= 1 ? fc : -1 / fc;
}
