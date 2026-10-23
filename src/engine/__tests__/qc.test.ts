import { GSI_ARCHETYPES } from '@/data/seed/gsi-archetypes';
import { runGate, sampleGate } from '@/engine/qc';
import type { SampleInput } from '@/engine/types';

const base: SampleInput = GSI_ARCHETYPES.find((a) => a.code === 'CTRL')!.input;

describe('gerbang QC', () => {
  test('menolak sampel bila Ct PPC > 22 (UNK-HUMIC)', () => {
    const humic = GSI_ARCHETYPES.find((a) => a.code === 'UNK-HUMIC')!.input;
    const gate = sampleGate(humic);
    expect(gate.status).toBe('DITOLAK');
    expect(gate.reasons).toContain(
      'PPC 24,46 > 22: inhibisi, purifikasi atau encerkan 1:10 lalu uji ulang',
    );
  });

  test('menolak sampel bila 16S tidak terdeteksi', () => {
    expect(sampleGate({ ...base, ref16sDetected: false }).status).toBe('DITOLAK');
  });

  test('menolak sampel bila NTC target patogen teramplifikasi', () => {
    const gate = sampleGate({ ...base, ntcContaminated: ['pirA'] });
    expect(gate.status).toBe('DITOLAK');
    expect(gate.reasons[0]).toMatch(/NTC pirA/);
  });

  test('menandai TINJAU bila SD replikat > 0,20', () => {
    expect(sampleGate({ ...base, replicateSdMax: 0.31 }).status).toBe('TINJAU');
  });

  test('menandai TINJAU bila kimia wajib kosong', () => {
    expect(sampleGate({ ...base, chemistry: null }).status).toBe('TINJAU');
  });

  test('menandai TINJAU bila read Nanopore < 5.000', () => {
    const microbe = { reads: 4200, opportunistPct: 12, shannon: 3.1, ctrlShannon: 3.3 };
    expect(sampleGate({ ...base, microbe }).status).toBe('TINJAU');
  });

  test('lulus untuk CTRL', () => {
    expect(sampleGate(base)).toEqual({ status: 'LULUS', reasons: [] });
  });

  test('run ditolak bila efisiensi kurva di luar 90-110%', () => {
    expect(runGate({ efficiencyPct: 84.2, r2: 0.995 }).status).toBe('DITOLAK');
    expect(runGate({ efficiencyPct: 98.84, r2: 0.979 }).status).toBe('DITOLAK');
    expect(runGate({ efficiencyPct: 98.84, r2: 1 }).status).toBe('LULUS');
  });
});
