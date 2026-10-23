import { CONFIDENCE } from './params/sdri-v1';
import type { Traced } from './types';

const detectProb = (samples: number, replicates: number) =>
  1 - (1 - CONFIDENCE.theta * (1 - (1 - CONFIDENCE.p) ** replicates)) ** samples;

/**
 * sdri-v1 §7: P(terdeteksi | ada) untuk patogen ND, dan jumlah sampel air yang dibutuhkan
 * agar keyakinan ≥ 95%. Terpisah dari skor SDRI.
 */
export function negativeConfidence(
  samples: number,
  replicates: number,
): Traced & { samplesFor95: number } {
  const value = detectProb(samples, replicates);
  let samplesFor95 = 1;
  while (detectProb(samplesFor95, replicates) < CONFIDENCE.target) samplesFor95++;
  return {
    value,
    samplesFor95,
    trace: [
      {
        rule: 'sdri-v1 §7',
        label: `θ ${CONFIDENCE.theta}, p ${CONFIDENCE.p}, ${replicates} replikat, ${samples} sampel`,
        value,
      },
    ],
  };
}
