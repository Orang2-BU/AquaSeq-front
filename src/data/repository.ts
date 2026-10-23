import type { Chemistry } from '@/engine/types';

import type {
  Alert,
  ImportResult,
  PondDetail,
  PondSummary,
  Report,
  RunDetail,
  SampleDetail,
} from './types';

/** Metadata yang tidak ada di CSV qPCR: identitas run dan pemetaan kode sampel → kolam. */
export interface RunMeta {
  lab: string;
  instrument: string;
  date: string;
  samples: { code: string; pondId: string; doc: number | null; role: 'acuan' | 'uji' }[];
}

/**
 * Kontrak data layar (03-ARCHITECTURE §5). Sekarang dipenuhi MockRepository (AsyncStorage);
 * nanti HttpRepository ke API backend tanpa mengubah layar. Galat dilempar sebagai Error
 * berpesan Bahasa Indonesia; impor CSV mengembalikan galat per baris.
 */
export interface Repository {
  listRuns(): Promise<RunDetail[]>;
  getRun(id: string): Promise<RunDetail>;
  importRunCsv(csv: string, meta: RunMeta): Promise<ImportResult>;
  excludeWell(runId: string, wellId: string, reason: string): Promise<void>;
  saveChemistry(sampleId: string, data: Chemistry): Promise<void>;
  importNanoporeCsv(sampleId: string, csv: string): Promise<ImportResult>;
  getSample(id: string): Promise<SampleDetail>;
  publishReport(sampleId: string): Promise<Report>;
  listPonds(): Promise<PondSummary[]>;
  getPond(id: string): Promise<PondDetail>;
  listAlerts(): Promise<Alert[]>;
  resolveAlert(id: string): Promise<void>;
  resetDemo(): Promise<void>;
}
